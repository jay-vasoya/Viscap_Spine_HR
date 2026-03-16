sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("com.viscap.hrms.controller.Login", {
        onInit: function () {
            // Check if already logged in
            if (localStorage.getItem("hrmsLogin") === "true") {
                this.getOwnerComponent().getRouter().navTo("dashboard");
            }
        },

        onLogin: function () {
            var sUser = this.byId("username").getValue();
            var sPass = this.byId("password").getValue();

            // Simple mock validation
            if (sUser && sPass) {
                localStorage.setItem("hrmsLogin", "true");
                localStorage.setItem("hrmsUser", sUser);
                
                this.getOwnerComponent().getRouter().navTo("dashboard");
                MessageToast.show("Welcome back!");
            } else {
                MessageToast.show("Please enter username and password");
            }
        }
    });
});
