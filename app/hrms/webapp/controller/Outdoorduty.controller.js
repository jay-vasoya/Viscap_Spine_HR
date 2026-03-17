sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/DatePicker",
  "sap/m/TimePicker",
  "sap/m/Input",
  "sap/m/TextArea",
  "sap/m/VBox"
], function (
  Controller, Filter, FilterOperator,
  MessageToast, MessageBox,
  Dialog, Button, Label, DatePicker, TimePicker, Input, TextArea, VBox
) {
  "use strict";

  const EMPLOYEE_ID = "e1000000-0000-0000-0000-000000000001";

  return Controller.extend("com.viscap.hrms.controller.OutdoorDuty", {

    onInit: function () {
      this._oODDialog = null;
      this.getOwnerComponent().getRouter()
          .getRoute("outdoorDuty")
          .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function () { this._refreshTable(); },

    _refreshTable: function () {
      const oTable = this.byId("odTable");
      if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").refresh();
      }
    },

    // ── Status Filter ─────────────────────────────────────────────────────
    onFilterChange: function () {
      const sKey     = this.byId("odStatusFilter").getSelectedKey();
      const oBinding = this.byId("odTable").getBinding("items");
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
      const oBinding = this.byId("odTable").getBinding("items");
      if (!oBinding) return;

      const aFilters = [new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID)];
      if (sQuery) {
        aFilters.push(new Filter({
          filters: [
            new Filter("purpose",  FilterOperator.Contains, sQuery),
            new Filter("location", FilterOperator.Contains, sQuery)
          ],
          and: false
        }));
      }
      oBinding.filter(aFilters);
    },

    // ── Apply OD Dialog ───────────────────────────────────────────────────
    onApplyOD: function () {
      if (!this._oODDialog) {
        this._oODDate     = new DatePicker({
          valueFormat: "yyyy-MM-dd", displayFormat: "dd MMM yyyy", width: "100%"
        });
        this._oODFromTime = new TimePicker({
          valueFormat: "HH:mm:ss", displayFormat: "HH:mm", width: "100%"
        });
        this._oODToTime   = new TimePicker({
          valueFormat: "HH:mm:ss", displayFormat: "HH:mm", width: "100%"
        });
        this._oODLocation = new Input({
          width: "100%", placeholder: "Enter location..."
        });
        this._oODPurpose  = new TextArea({
          rows: 3, width: "100%", placeholder: "Enter purpose of outdoor duty..."
        });

        this._oODDialog = new Dialog({
          title: "Apply Outdoor Duty", contentWidth: "440px",
          content: [
            new VBox({ items: [
              new Label({ text: "Date",      required: true }), this._oODDate,
              new Label({ text: "From Time", required: true }), this._oODFromTime,
              new Label({ text: "To Time",   required: true }), this._oODToTime,
              new Label({ text: "Location",  required: true }), this._oODLocation,
              new Label({ text: "Purpose",   required: true }), this._oODPurpose
            ]}).addStyleClass("sapUiSmallMargin")
          ],
          beginButton: new Button({
            text: "Submit", type: "Emphasized",
            press: this.onSubmitOD.bind(this)
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () { this._oODDialog.close(); }.bind(this)
          })
        });
        this.getView().addDependent(this._oODDialog);
      }

      // Reset form
      this._oODDate.setValue("");
      this._oODFromTime.setValue("");
      this._oODToTime.setValue("");
      this._oODLocation.setValue("");
      this._oODPurpose.setValue("");
      this._oODDialog.open();
    },

    // ── Submit OD (OData V4) ──────────────────────────────────────────────
    onSubmitOD: function () {
      const sDate     = this._oODDate.getValue();
      const sFromTime = this._oODFromTime.getValue();
      const sToTime   = this._oODToTime.getValue();
      const sLocation = this._oODLocation.getValue();
      const sPurpose  = this._oODPurpose.getValue();

      if (!sDate || !sFromTime || !sToTime || !sLocation || !sPurpose) {
        MessageBox.error("Please fill all required fields.");
        return;
      }

      const oHrms    = this.getOwnerComponent().getModel("hrms");
      const oBinding = oHrms.bindList("/OutdoorDutyRequests");

      oBinding.create({
        employee_ID : EMPLOYEE_ID,
        date        : sDate,
        fromTime    : sFromTime,
        toTime      : sToTime,
        location    : sLocation,
        purpose     : sPurpose,
        status      : "Pending"
      }).created().then(function () {
        MessageToast.show("Outdoor duty request submitted successfully!");
        this._oODDialog.close();
        this._refreshTable();
      }.bind(this)).catch(function (oErr) {
        MessageBox.error(oErr.message || "Submission failed.");
      });
    },

    // ── Cancel OD (OData V4) ──────────────────────────────────────────────
    onCancelOD: function (oEvent) {
      const oCtx = oEvent.getSource().getBindingContext("hrms");

      MessageBox.confirm("Cancel this outdoor duty request?", {
        title: "Confirm Cancellation",
        onClose: function (sAction) {
          if (sAction !== MessageBox.Action.OK) return;
          oCtx.setProperty("status", "Cancelled")
              .then(function () {
                MessageToast.show("Request cancelled.");
                this._refreshTable();
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