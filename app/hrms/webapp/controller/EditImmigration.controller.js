sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (Controller, History, MessageToast, Fragment) {
    "use strict";

    return Controller.extend("com.viscap.hrms.controller.EditImmigration", {
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
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.viscap.hrms.view.fragments.EditImmigrationForm",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDialog.then(function(oDialog) {
                oDialog.open();
            });
        },

        onDialogUpdate: function () {
            MessageToast.show("Immigration details update request submitted");
            this.byId("editImmigrationDialog").close();
        },

        onDialogCancel: function () {
            this.byId("editImmigrationDialog").close();
        },

        onStatusChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtering by: " + sKey);
        }
    });
});
