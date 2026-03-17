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
  "sap/m/TextArea",
  "sap/m/VBox"
], function (
  Controller, JSONModel, Filter, FilterOperator,
  MessageToast, MessageBox,
  Dialog, Button, Label, Select, Item, DatePicker, TextArea, VBox
) {
  "use strict";

  const EMPLOYEE_ID = "e1000000-0000-0000-0000-000000000001";

  return Controller.extend("com.viscap.hrms.controller.CompOff", {

    onInit: function () {
      this.getView().setModel(new JSONModel({ balance: 0 }), "compOffModel");
      this._oCompOffDialog = null;

      this.getOwnerComponent().getRouter()
          .getRoute("compOff")
          .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function () {
      this._loadBalance();
      this._refreshTable();
    },

    // ── Load Balance (OData V4) ───────────────────────────────────────────
    _loadBalance: function () {
      // Set to 0 — extend with CompOffBalance entity if needed
      this.getView().getModel("compOffModel").setProperty("/balance", 0);
    },

    _refreshTable: function () {
      const oTable = this.byId("compOffTable");
      if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").refresh();
      }
    },

    // ── Status Filter ─────────────────────────────────────────────────────
    onFilterChange: function () {
      const sKey     = this.byId("compOffStatusFilter").getSelectedKey();
      const oBinding = this.byId("compOffTable").getBinding("items");
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
      const oBinding = this.byId("compOffTable").getBinding("items");
      if (!oBinding) return;

      const aFilters = [new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID)];
      if (sQuery) {
        aFilters.push(new Filter("reason", FilterOperator.Contains, sQuery));
      }
      oBinding.filter(aFilters);
    },

    // ── Apply CompOff Dialog ──────────────────────────────────────────────
    onApplyCompOff: function () {
      if (!this._oCompOffDialog) {
        this._oWorkedDate = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy", width: "100%"
        });
        this._oAvailDate = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy", width: "100%"
        });
        this._oShiftSelect = new Select({
          width: "100%",
          items: [
            new Item({ key: "FULL",   text: "Full Day" }),
            new Item({ key: "FIRST",  text: "First Half" }),
            new Item({ key: "SECOND", text: "Second Half" })
          ]
        });
        this._oCompOffReason = new TextArea({
          rows: 3, width: "100%", placeholder: "Enter reason for comp. off..."
        });

        this._oCompOffDialog = new Dialog({
          title: "Apply Comp. Off", contentWidth: "440px",
          content: [
            new VBox({ items: [
              new Label({ text: "Worked Date", required: true }), this._oWorkedDate,
              new Label({ text: "Shift",       required: true }), this._oShiftSelect,
              new Label({ text: "Avail Date",  required: true }), this._oAvailDate,
              new Label({ text: "Reason",      required: true }), this._oCompOffReason
            ]}).addStyleClass("sapUiSmallMargin")
          ],
          beginButton: new Button({
            text: "Submit", type: "Emphasized",
            press: this.onSubmitCompOff.bind(this)
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () { this._oCompOffDialog.close(); }.bind(this)
          })
        });
        this.getView().addDependent(this._oCompOffDialog);
      }

      // Reset form
      this._oWorkedDate.setValue("");
      this._oAvailDate.setValue("");
      this._oShiftSelect.setSelectedKey("FULL");
      this._oCompOffReason.setValue("");
      this._oCompOffDialog.open();
    },

    // ── Submit CompOff (OData V4) ─────────────────────────────────────────
    onSubmitCompOff: function () {
      const sWorkedDate = this._oWorkedDate.getValue();
      const sShift      = this._oShiftSelect.getSelectedKey();
      const sAvailDate  = this._oAvailDate.getValue();
      const sReason     = this._oCompOffReason.getValue();

      if (!sWorkedDate || !sShift || !sAvailDate || !sReason) {
        MessageBox.error("Please fill all required fields.");
        return;
      }

      const oHrms    = this.getOwnerComponent().getModel("hrms");
      const oBinding = oHrms.bindList("/CompOffRequests");

      oBinding.create({
        employee_ID : EMPLOYEE_ID,
        workedDate  : sWorkedDate,
        shift       : sShift,
        availDate   : sAvailDate,
        reason      : sReason,
        status      : "Pending"
      }).created().then(function () {
        MessageToast.show("Comp. off request submitted successfully!");
        this._oCompOffDialog.close();
        this._refreshTable();
        this._loadBalance();
      }.bind(this)).catch(function (oErr) {
        MessageBox.error(oErr.message || "Submission failed.");
      });
    },

    // ── Cancel CompOff (OData V4) ─────────────────────────────────────────
    onCancelCompOff: function (oEvent) {
      const oCtx = oEvent.getSource().getBindingContext("hrms");

      MessageBox.confirm("Cancel this comp. off request?", {
        title: "Confirm Cancellation",
        onClose: function (sAction) {
          if (sAction !== MessageBox.Action.OK) return;
          oCtx.setProperty("status", "Cancelled")
              .then(function () {
                MessageToast.show("Request cancelled.");
                this._refreshTable();
                this._loadBalance();
              }.bind(this))
              .catch(function (oErr) {
                MessageBox.error(oErr.message || "Error cancelling.");
              });
        }.bind(this)
      });
    },
// Add to LeavePlanner.controller.js, Leave.controller.js,
// OutdoorDuty.controller.js, CompOff.controller.js
formatIsPending: function (sStatus) {
    return sStatus === "Pending";
},
    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("leaveMenu");
    }
  });
});