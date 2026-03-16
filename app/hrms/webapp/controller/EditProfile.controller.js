sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/VBox"
], function (Controller, History, MessageToast, Dialog, Button, Text, VBox) {
    "use strict";

    return Controller.extend("com.viscap.hrms.controller.EditProfile", {
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

        onAddPhoto: function () {
            if (!this.pDialog) {
                this.pDialog = new Dialog({
                    title: "Upload Photo",
                    content: new VBox({
                        items: [
                            new Text({ text: "Select Photo" }),
                            new Button({ text: "Choose File", press: function() { MessageToast.show("File browser opened"); } }),
                            new Text({ text: "* Note: file size should not be more than 1 MB.", class: "sapUiTinyMarginTop" })
                        ]
                    }).addStyleClass("sapUiContentPadding"),
                    beginButton: new Button({
                        text: "Save",
                        press: function () {
                            this.pDialog.close();
                            MessageToast.show("Photo uploaded successfully");
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.pDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this.pDialog);
            }
            this.pDialog.open();
        },

        onSave: function () {
            MessageToast.show("Profile updated successfully");
        }
    });
});
