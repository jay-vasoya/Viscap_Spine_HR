sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/DatePicker",
  "sap/m/TimePicker",
  "sap/m/TextArea",
  "sap/m/VBox"
], function (
  Controller, JSONModel, Filter, FilterOperator,
  MessageToast, MessageBox,
  Dialog, Button, Label, Select, Item, DatePicker, TimePicker, TextArea, VBox
) {
  "use strict";

  const EMPLOYEE_ID   = "e1000000-0000-0000-0000-000000000001";
  const EMPLOYEE_NAME = "Jay Vasoya";
  const EMPLOYEE_CODE = "240";

  return Controller.extend("com.viscap.hrms.controller.Attendance", {

    // ── Formatter ─────────────────────────────────────────────────────────
    dayNameFormatter: function (sDate) {
      if (!sDate) return "";
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[new Date(sDate).getDay()];
    },

    // ── Init ──────────────────────────────────────────────────────────────
    onInit: function () {
      this.getView().setModel(new JSONModel({
        employeeName : EMPLOYEE_NAME,
        employeeCode : EMPLOYEE_CODE,
        present      : 0,
        absent       : 0,
        leave        : 0,
        holidays     : 0,
        wfh          : 0,
        avgHours     : 0
      }), "attendModel");

      this._oSwipeDialog = null;

      this.getOwnerComponent().getRouter()
          .getRoute("attendance")
          .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function () {
      const now = new Date();
      this.byId("monthSelector").setSelectedKey(String(now.getMonth() + 1));
      this.byId("yearSelector").setSelectedKey(String(now.getFullYear()));
      this._loadAttendance(now.getMonth() + 1, now.getFullYear());
    },

    onMonthChange: function () {
      const month = parseInt(this.byId("monthSelector").getSelectedKey());
      const year  = parseInt(this.byId("yearSelector").getSelectedKey());
      this._loadAttendance(month, year);
    },

    onRefresh: function () { this.onMonthChange(); },

    // ── Load Attendance (OData V4) ────────────────────────────────────────
    _loadAttendance: function (month, year) {
      const oHrms       = this.getOwnerComponent().getModel("hrms");
      const oAttendModel = this.getView().getModel("attendModel");
      if (!oHrms) return;

      const fromDate = year + "-" + String(month).padStart(2, "0") + "-01";
      const lastDay  = new Date(year, month, 0).getDate();
      const toDate   = year + "-" + String(month).padStart(2, "0") + "-" +
                       String(lastDay).padStart(2, "0");

      // Update table filter
      const oTable = this.byId("attendTable");
      if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").filter([
          new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID),
          new Filter("date", FilterOperator.BT, fromDate, toDate)
        ]);
      }

      // Load summary via OData V4 requestContexts
      const oBinding = oHrms.bindList("/Attendances", null, null, [
        new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID),
        new Filter("date", FilterOperator.BT, fromDate, toDate)
      ]);

      oBinding.requestContexts(0, 200).then(function (aContexts) {
        let present = 0, absent = 0, leave = 0,
            holidays = 0, wo = 0, totalHours = 0;

        aContexts.forEach(function (oCtx) {
          const sStatus = (oCtx.getProperty("status") || "").toUpperCase();
          if      (sStatus === "PRESENT" || sStatus === "DP") {
            present++; totalHours += parseFloat(oCtx.getProperty("workHours") || 0);
          } else if (sStatus === "ABSENT" || sStatus === "ABS") { absent++; }
          else if  (sStatus === "LEAVE")                         { leave++;  }
          else if  (sStatus === "HOLIDAY" || sStatus === "PH")   { holidays++; }
          else if  (sStatus === "WO")                            { wo++; }
        });

        oAttendModel.setProperty("/present",  present);
        oAttendModel.setProperty("/absent",   absent);
        oAttendModel.setProperty("/leave",    leave);
        oAttendModel.setProperty("/holidays", holidays);
        oAttendModel.setProperty("/wfh",      wo);
        oAttendModel.setProperty("/avgHours",
          present > 0 ? (totalHours / present).toFixed(1) : 0);
      }.bind(this)).catch(function (oErr) {
        console.error("Failed to load attendance:", oErr.message);
      });
    },

    onDatePress: function (oEvent) {
      const oCtx  = oEvent.getSource().getBindingContext("hrms");
      const sDate = oCtx ? oCtx.getProperty("date") : "";
      MessageToast.show("Selected: " + sDate);
    },

    onExportPDF: function () {
      MessageToast.show("Exporting PDF...");
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("dashboard");
    },

    // ── Swipe Dialog ──────────────────────────────────────────────────────
    onApplySwipeNew: function () {
      if (!this._oSwipeDialog) {
        this._oSwipeDatePicker = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy", width: "100%"
        });
        this._oSwipeTimePicker = new TimePicker({
          valueFormat: "HH:mm:ss", displayFormat: "HH:mm", width: "100%"
        });
        this._oSwipeTypeSelect = new Select({
          width: "100%",
          items: [
            new Item({ key: "IN",  text: "IN" }),
            new Item({ key: "OUT", text: "OUT" })
          ]
        });
        this._oSwipeReasonInput = new TextArea({
          rows: 3, width: "100%", placeholder: "Enter reason..."
        });

        this._oSwipeDialog = new Dialog({
          title: "Apply Swipe Request", contentWidth: "400px",
          content: [
            new VBox({ items: [
              new Label({ text: "Date",       required: true }), this._oSwipeDatePicker,
              new Label({ text: "Swipe Time", required: true }), this._oSwipeTimePicker,
              new Label({ text: "Swipe Type", required: true }), this._oSwipeTypeSelect,
              new Label({ text: "Reason",     required: true }), this._oSwipeReasonInput
            ]}).addStyleClass("sapUiSmallMargin")
          ],
          beginButton: new Button({
            text: "Submit", type: "Emphasized",
            press: this.onSubmitSwipe.bind(this)
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () { this._oSwipeDialog.close(); }.bind(this)
          })
        });
        this.getView().addDependent(this._oSwipeDialog);
      }

      this._oSwipeDatePicker.setValue("");
      this._oSwipeTimePicker.setValue("");
      this._oSwipeTypeSelect.setSelectedKey("IN");
      this._oSwipeReasonInput.setValue("");
      this._oSwipeDialog.open();
    },

    // ── Submit Swipe (OData V4) ───────────────────────────────────────────
    onSubmitSwipe: function () {
      const sDate   = this._oSwipeDatePicker.getValue();
      const sTime   = this._oSwipeTimePicker.getValue();
      const sType   = this._oSwipeTypeSelect.getSelectedKey();
      const sReason = this._oSwipeReasonInput.getValue();

      if (!sDate || !sTime || !sReason) {
        MessageBox.error("Please fill all required fields.");
        return;
      }

      const oHrms    = this.getOwnerComponent().getModel("hrms");
      const oBinding = oHrms.bindList("/SwipeRequests");

      oBinding.create({
        employee_ID : EMPLOYEE_ID,
        date        : sDate,
        swipeTime   : sTime,
        swipeType   : sType,
        reason      : sReason,
        status      : "Pending"
      }).created().then(function () {
        MessageToast.show("Swipe request submitted!");
        this._oSwipeDialog.close();
      }.bind(this)).catch(function (oErr) {
        MessageBox.error(oErr.message || "Submission failed.");
      });
    }
  });
});