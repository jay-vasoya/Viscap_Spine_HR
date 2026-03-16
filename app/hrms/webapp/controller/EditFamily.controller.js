sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (Controller, History, MessageToast, Fragment) {
    "use strict";

    return Controller.extend("com.viscap.hrms.controller.EditFamily", {
        onInit: function () {
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("dashboard", {}, true);
            }
        },

        onAddNew: function () {
            var oView = this.getView();

            if (!this._pDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.viscap.hrms.view.fragments.EditFamilyForm",
                    controller: this
                }).then(function (oDialog) {
                    this._pDialog = oDialog;
                    oView.addDependent(this._pDialog);
                    this._pDialog.open();
                }.bind(this));
            } else {
                this._pDialog.open();
            }
        },

        onDialogUpdate: function () {
            MessageToast.show("Family details update request submitted");
            this._pDialog.close();
        },

        onDialogCancel: function () {
            this._pDialog.close();
        },

        onStatusChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtering by: " + sKey);
        }
    });
});
