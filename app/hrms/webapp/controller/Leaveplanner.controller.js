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

  return Controller.extend("com.viscap.hrms.controller.LeavePlanner", {

    onInit: function () {
      this.getView().setModel(new JSONModel({ days: 0 }), "plannedModel");
      this._oPlannedDialog = null;

      this.getOwnerComponent().getRouter()
          .getRoute("leavePlanner")
          .attachPatternMatched(this._onRouteMatched, this);
    },

    // ✅ FIX: Use setTimeout to wait for view to fully render
    _onRouteMatched: function () {
      setTimeout(function () {
        this._applyPlannerFilter();
      }.bind(this), 0);
    },

    onPlannerYearChange: function () { this._applyPlannerFilter(); },
    onRefreshPlanner:    function () { this._applyPlannerFilter(); },

    // ✅ FIX: Show ALL entries for employee, year filter is optional
    _applyPlannerFilter: function () {
      const oTable = this.byId("plannerTable");
      if (!oTable) return;

      const oBinding = oTable.getBinding("items");
      if (!oBinding) return;

      const oYearSelect = this.byId("plannerYearSelect");
      const sYear = oYearSelect ? oYearSelect.getSelectedKey() : "";

      // Always filter by employee — year filter only if selected
      const aFilters = [
        new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID)
      ];

      // ✅ FIX: Only add year filter if a year is selected
      if (sYear) {
        aFilters.push(
          new Filter("fromDate", FilterOperator.GE, sYear + "-01-01"),
          new Filter("fromDate", FilterOperator.LE, sYear + "-12-31")
        );
      }

      oBinding.filter(aFilters);
    },

    // ── Add Planned Dialog ────────────────────────────────────────────────
    onAddLeavePlanned: function () {
      if (!this._oPlannedDialog) {
        this._oPlannedTypeSelect = new Select({
          width: "100%",
          items: {
            path: "hrms>/LeaveTypes",
            template: new Item({ key: "{hrms>ID}", text: "{hrms>name}" })
          }
        });
        this._oPlannedFrom = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy",
          width: "100%", change: this.onPlannedDateChange.bind(this)
        });
        this._oPlannedTo = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy",
          width: "100%", change: this.onPlannedDateChange.bind(this)
        });
        this._oPlannedDays = new Input({
          value: "{plannedModel>/days}", enabled: false, width: "100%"
        });
        this._oPlannedReason = new TextArea({
          rows: 3, width: "100%", placeholder: "Enter reason..."
        });

        this._oPlannedDialog = new Dialog({
          title: "Add Leave Planned", contentWidth: "440px",
          content: [
            new VBox({ items: [
              new Label({ text: "Leave Type", required: true }),
              this._oPlannedTypeSelect,
              new Label({ text: "From Date",  required: true }),
              this._oPlannedFrom,
              new Label({ text: "To Date",    required: true }),
              this._oPlannedTo,
              new Label({ text: "Working Days" }),
              this._oPlannedDays,
              new Label({ text: "Reason",     required: true }),
              this._oPlannedReason
            ]}).addStyleClass("sapUiSmallMargin")
          ],
          beginButton: new Button({
            text: "Save", type: "Emphasized",
            press: this.onSavePlanned.bind(this)
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () { this._oPlannedDialog.close(); }.bind(this)
          })
        });
        this.getView().addDependent(this._oPlannedDialog);
      }

      this._oPlannedTypeSelect.setSelectedKey("");
      this._oPlannedFrom.setValue("");
      this._oPlannedTo.setValue("");
      this._oPlannedReason.setValue("");
      this.getView().getModel("plannedModel").setProperty("/days", 0);
      this._oPlannedDialog.open();
    },

    // ── Date Change ───────────────────────────────────────────────────────
    onPlannedDateChange: function () {
      if (!this._oPlannedFrom || !this._oPlannedTo) return;
      const sFrom = this._oPlannedFrom.getValue();
      const sTo   = this._oPlannedTo.getValue();
      if (!sFrom || !sTo) return;

      const dFrom = new Date(sFrom);
      const dTo   = new Date(sTo);
      if (dTo < dFrom) {
        MessageToast.show("To Date cannot be before From Date.");
        this._oPlannedTo.setValue("");
        this.getView().getModel("plannedModel").setProperty("/days", 0);
        return;
      }

      let workDays = 0;
      const cursor = new Date(dFrom);
      while (cursor <= dTo) {
        if (cursor.getDay() !== 0) workDays++;
        cursor.setDate(cursor.getDate() + 1);
      }
      this.getView().getModel("plannedModel").setProperty("/days", workDays);
    },

    // ── Save Planned (OData V4) ───────────────────────────────────────────
    onSavePlanned: function () {
      const sType   = this._oPlannedTypeSelect.getSelectedKey();
      const sFrom   = this._oPlannedFrom.getValue();
      const sTo     = this._oPlannedTo.getValue();
      const sReason = this._oPlannedReason.getValue();
      const nDays   = this.getView().getModel("plannedModel").getProperty("/days");

      if (!sType || !sFrom || !sTo || !sReason) {
        MessageBox.error("Please fill all required fields.");
        return;
      }

      const oHrms    = this.getOwnerComponent().getModel("hrms");
      const oBinding = oHrms.bindList("/LeavePlanned");

      oBinding.create({
        employee_ID  : EMPLOYEE_ID,
        leaveType_ID : sType,
        fromDate     : sFrom,
        toDate       : sTo,
        days         : nDays,
        reason       : sReason,
        status       : "Pending"
      }).created().then(function () {
        MessageToast.show("Leave planned saved successfully!");
        this._oPlannedDialog.close();
        // ✅ FIX: Refresh the table binding directly instead of re-filtering
        const oTable = this.byId("plannerTable");
        if (oTable && oTable.getBinding("items")) {
          oTable.getBinding("items").refresh();
        }
      }.bind(this)).catch(function (oErr) {
        MessageBox.error(oErr.message || "Submission failed.");
      });
    },
// Add to LeavePlanner.controller.js, Leave.controller.js,
// OutdoorDuty.controller.js, CompOff.controller.js
formatIsPending: function (sStatus) {
    return sStatus === "Pending";
},
    // ── Delete Planned (OData V4) ─────────────────────────────────────────
    onDeletePlanned: function (oEvent) {
      const oCtx = oEvent.getSource().getBindingContext("hrms");

      MessageBox.confirm("Delete this planned leave?", {
        onClose: function (sAction) {
          if (sAction !== MessageBox.Action.OK) return;
          oCtx.delete("$auto")
              .then(function () {
                MessageToast.show("Planned leave deleted.");
              })
              .catch(function (oErr) {
                MessageBox.error(oErr.message || "Delete failed.");
              });
        }.bind(this)
      });
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("leaveMenu");
    }
  });
});