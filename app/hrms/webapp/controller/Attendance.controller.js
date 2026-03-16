sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("com.viscap.hrms.controller.Attendance", {

    // Formatter used in XML view as formatter: '.dayNameFormatter'
    dayNameFormatter: function (sDate) {
      if (!sDate) return "";
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[new Date(sDate).getDay()];
    },

    onInit: function () {
      const oAttendModel = new JSONModel({
        present: 0, absent: 0, leave: 0, holidays: 2, wfh: 0, avgHours: 0
      });
      this.getView().setModel(oAttendModel, "attendModel");

      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("attendance").attachPatternMatched(this._onRouteMatched, this);
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

    _loadAttendance: function (month, year) {
      const oHrms        = this.getOwnerComponent().getModel("hrms");
      const oAttendModel = this.getView().getModel("attendModel");
      if (!oHrms) return;

      const fromDate = year + "-" + String(month).padStart(2, "0") + "-01";
      const lastDay  = new Date(year, month, 0).getDate();
      const toDate   = year + "-" + String(month).padStart(2, "0") + "-" + String(lastDay).padStart(2, "0");

      // Update table filter
      const oBinding = this.byId("attendTable").getBinding("items");
      if (oBinding) {
        oBinding.filter([
          new Filter("employee_ID", FilterOperator.EQ, "e1000000-0000-0000-0000-000000000001"),
          new Filter("date", FilterOperator.BT, fromDate, toDate)
        ]);
      }

      // Load summary stats
      oHrms.read("/Attendances", {
        filters: [
          new Filter("employee_ID", FilterOperator.EQ, "e1000000-0000-0000-0000-000000000001"),
          new Filter("date", FilterOperator.BT, fromDate, toDate)
        ],
        success: function (oData) {
          const records = oData.value || oData.results || [];
          let present = 0, absent = 0, leave = 0, totalHours = 0;
          records.forEach(function (r) {
            if (r.status === "Present")      { present++; totalHours += parseFloat(r.workHours || 0); }
            else if (r.status === "Absent")  { absent++; }
            else if (r.status === "Leave")   { leave++; }
          });
          oAttendModel.setData({
            present:  present,
            absent:   absent,
            leave:    leave,
            holidays: 2,
            wfh:      0,
            avgHours: present > 0 ? (totalHours / present).toFixed(1) : 0
          });
        }
      });
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("dashboard");
    },

    onApplySwipeNew: function () {
      this.byId("swipeDialog").open();
    },

    onCloseSwipeDialog: function () {
      this.byId("swipeDialog").close();
    },

    onSubmitSwipe: function () {
      const sDate   = this.byId("swipeDatePicker").getValue();
      const sTime   = this.byId("swipeTimePicker").getValue();
      const sType   = this.byId("swipeTypeSelect").getSelectedKey();
      const sReason = this.byId("swipeReasonInput").getValue();

      if (!sDate || !sTime || !sReason) {
        MessageBox.error("Please fill all required fields.");
        return;
      }

      const oHrms = this.getOwnerComponent().getModel("hrms");
      oHrms.create("/SwipeRequests", {
        employee_ID: "e1000000-0000-0000-0000-000000000001",
        date:        sDate,
        swipeTime:   sTime,
        swipeType:   sType,
        reason:      sReason,
        status:      "Pending"
      }, {
        success: function () {
          MessageToast.show("Swipe request submitted!");
          this.byId("swipeDialog").close();
          this.byId("swipeReasonInput").setValue("");
        }.bind(this),
        error: function (e) {
          MessageBox.error("Error: " + (e.message || "Unknown error"));
        }
      });
    }
  });
});
