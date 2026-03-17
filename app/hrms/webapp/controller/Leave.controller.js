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
  "sap/m/Input",
  "sap/m/TextArea",
  "sap/m/VBox"
], function (
  Controller, JSONModel, Filter, FilterOperator,
  MessageToast, MessageBox,
  Dialog, Button, Label, Select, Item, DatePicker, Input, TextArea, VBox
) {
  "use strict";

  const EMPLOYEE_ID = "e1000000-0000-0000-0000-000000000001";

  return Controller.extend("com.viscap.hrms.controller.Leave", {

    // ── Init ─────────────────────────────────────────────────────────────
    onInit: function () {
      this.getView().setModel(new JSONModel({
        CL_balance: 0, SL_balance: 0,
        PL_balance: 0, total_balance: 0
      }), "leaveModel");

      this.getView().setModel(new JSONModel({ days: 0 }), "dialogModel");
      this._oLeaveDialog = null;

      this.getOwnerComponent().getRouter()
          .getRoute("leave")
          .attachPatternMatched(this._onRouteMatched, this);
    },
// Add to LeavePlanner.controller.js, Leave.controller.js,
// OutdoorDuty.controller.js, CompOff.controller.js
formatIsPending: function (sStatus) {
    return sStatus === "Pending";
},
    _onRouteMatched: function () {
      this._loadLeaveBalance();
      this._refreshTable();
    },

    // ── Load Leave Balance (OData V4) ─────────────────────────────────────
    _loadLeaveBalance: function () {
      const oHrms = this.getOwnerComponent().getModel("hrms");
      if (!oHrms) return;

      const oBinding = oHrms.bindList("/LeaveBalances", null, null, [
        new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID)
      ]);

      oBinding.requestContexts(0, 100).then(function (aContexts) {
        let cl = 0, sl = 0, pl = 0;
        aContexts.forEach(function (oCtx) {
          const code = (oCtx.getProperty("leaveTypeCode") || "").toUpperCase();
          const bal  = parseFloat(oCtx.getProperty("balance") || 0);
          if      (code === "CL") cl = bal;
          else if (code === "SL") sl = bal;
          else if (code === "PL") pl = bal;
        });
        const oModel = this.getView().getModel("leaveModel");
        oModel.setProperty("/CL_balance",    cl);
        oModel.setProperty("/SL_balance",    sl);
        oModel.setProperty("/PL_balance",    pl);
        oModel.setProperty("/total_balance", cl + sl + pl);
      }.bind(this)).catch(function (oErr) {
        console.error("Failed to load leave balance:", oErr.message);
      });
    },

    // ── Refresh Table ─────────────────────────────────────────────────────
    _refreshTable: function () {
      const oTable = this.byId("leaveTable");
      if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").refresh();
      }
    },

    // ── Status Filter ─────────────────────────────────────────────────────
    onFilterChange: function () {
      const sKey     = this.byId("statusFilter").getSelectedKey();
      const oBinding = this.byId("leaveTable").getBinding("items");
      if (!oBinding) return;

      const aFilters = [new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID)];
      if (sKey !== "ALL") {
        aFilters.push(new Filter("status", FilterOperator.EQ, sKey));
      }
      oBinding.filter(aFilters);
    },

    // ── Search ────────────────────────────────────────────────────────────
    onSearch: function (oEvent) {
      const sQuery   = oEvent.getParameter("query") || "";
      const oBinding = this.byId("leaveTable").getBinding("items");
      if (!oBinding) return;

      const aFilters = [new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID)];
      if (sQuery) {
        aFilters.push(new Filter({
          filters: [
            new Filter("leaveTypeName", FilterOperator.Contains, sQuery),
            new Filter("reason",        FilterOperator.Contains, sQuery),
            new Filter("status",        FilterOperator.Contains, sQuery)
          ],
          and: false
        }));
      }
      oBinding.filter(aFilters);
    },

    // ── Apply Leave Dialog ────────────────────────────────────────────────
    onApplyLeave: function () {
      if (!this._oLeaveDialog) {
        this._oLeaveTypeSelect = new Select({
          width: "100%",
          items: {
            path: "hrms>/LeaveTypes",
            template: new Item({ key: "{hrms>ID}", text: "{hrms>name}" })
          }
        });
        this._oFromDate = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy",
          width: "100%", change: this.onDateChange.bind(this)
        });
        this._oToDate = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy",
          width: "100%", change: this.onDateChange.bind(this)
        });
        this._oDaysInput = new Input({
          value: "{dialogModel>/days}", enabled: false, width: "100%"
        });
        this._oReasonInput = new TextArea({
          rows: 3, width: "100%", placeholder: "Enter reason for leave..."
        });

        this._oLeaveDialog = new Dialog({
          title: "Apply for Leave", contentWidth: "480px",
          content: [
            new VBox({ items: [
              new Label({ text: "Leave Type", required: true }),
              this._oLeaveTypeSelect,
              new Label({ text: "From Date",  required: true }),
              this._oFromDate,
              new Label({ text: "To Date",    required: true }),
              this._oToDate,
              new Label({ text: "Working Days" }),
              this._oDaysInput,
              new Label({ text: "Reason",     required: true }),
              this._oReasonInput
            ]}).addStyleClass("sapUiSmallMargin")
          ],
          beginButton: new Button({
            text: "Submit", type: "Emphasized",
            press: this.onSubmitLeave.bind(this)
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () { this._oLeaveDialog.close(); }.bind(this)
          })
        });
        this.getView().addDependent(this._oLeaveDialog);
      }

      // Reset form
      this._oLeaveTypeSelect.setSelectedKey("");
      this._oFromDate.setValue("");
      this._oToDate.setValue("");
      this._oReasonInput.setValue("");
      this.getView().getModel("dialogModel").setProperty("/days", 0);
      this._oLeaveDialog.open();
    },

    // ── Date Change → Calculate Days ──────────────────────────────────────
    onDateChange: function () {
      if (!this._oFromDate || !this._oToDate) return;
      const sFrom = this._oFromDate.getValue();
      const sTo   = this._oToDate.getValue();
      if (!sFrom || !sTo) return;

      const dFrom = new Date(sFrom);
      const dTo   = new Date(sTo);

      if (dTo < dFrom) {
        MessageToast.show("To Date cannot be before From Date.");
        this._oToDate.setValue("");
        this.getView().getModel("dialogModel").setProperty("/days", 0);
        return;
      }

      let workDays = 0;
      const cursor = new Date(dFrom);
      while (cursor <= dTo) {
        if (cursor.getDay() !== 0) workDays++;
        cursor.setDate(cursor.getDate() + 1);
      }
      this.getView().getModel("dialogModel").setProperty("/days", workDays);
    },

    // ── Submit Leave (OData V4) ───────────────────────────────────────────
    onSubmitLeave: function () {
      const sType   = this._oLeaveTypeSelect.getSelectedKey();
      const sFrom   = this._oFromDate.getValue();
      const sTo     = this._oToDate.getValue();
      const sReason = this._oReasonInput.getValue();
      const nDays   = this.getView().getModel("dialogModel").getProperty("/days");

      if (!sType || !sFrom || !sTo || !sReason) {
        MessageBox.error("Please fill all required fields.");
        return;
      }
      if (nDays <= 0) {
        MessageBox.error("Invalid date range.");
        return;
      }

      const oHrms    = this.getOwnerComponent().getModel("hrms");
      const oBinding = oHrms.bindList("/LeaveRequests");

      oBinding.create({
        employee_ID  : EMPLOYEE_ID,
        leaveType_ID : sType,
        fromDate     : sFrom,
        toDate       : sTo,
        days         : nDays,
        reason       : sReason,
        status       : "Pending",
        appliedOn    : new Date().toISOString()
      }).created().then(function () {
        MessageToast.show("Leave request submitted successfully!");
        this._oLeaveDialog.close();
        this._refreshTable();
        this._loadLeaveBalance();
      }.bind(this)).catch(function (oErr) {
        MessageBox.error(oErr.message || "Submission failed.");
      });
    },

    // ── Cancel Leave (OData V4) ───────────────────────────────────────────
    onCancelLeave: function (oEvent) {
      const oCtx  = oEvent.getSource().getBindingContext("hrms");
      const sType = oCtx.getProperty("leaveTypeName");
      const sFrom = oCtx.getProperty("fromDate");

      MessageBox.confirm(
        "Cancel leave request for " + sType + " from " + sFrom + "?",
        {
          title: "Confirm Cancellation",
          onClose: function (sAction) {
            if (sAction !== MessageBox.Action.OK) return;
            oCtx.setProperty("status", "Cancelled")
                .then(function () {
                  MessageToast.show("Leave request cancelled.");
                  this._refreshTable();
                  this._loadLeaveBalance();
                }.bind(this))
                .catch(function (oErr) {
                  MessageBox.error(oErr.message || "Error cancelling.");
                });
          }.bind(this)
        }
      );
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("leaveMenu");
    }
  });
});