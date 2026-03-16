sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.viscap.hrms.controller.App", {
        onInit: function () {
            // Apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            // Initialize UI model for layout control
            var oUIModel = new JSONModel({
                sideExpanded: true,
                isAppVisible: false
            });
            this.getView().setModel(oUIModel, "ui");

            // Attach route matched listener
            this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oUIModel = this.getView().getModel("ui");

            // Toggle visibility based on route
            if (sRouteName === "login") {
                oUIModel.setProperty("/isAppVisible", false);
            } else {
                // Check authentication
                if (localStorage.getItem("hrmsLogin") !== "true") {
                    this.getOwnerComponent().getRouter().navTo("login");
                } else {
                    oUIModel.setProperty("/isAppVisible", true);
                }
            }
        },

        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();

            this._setToggleButtonTooltip(bSideExpanded);

            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        _setToggleButtonTooltip: function (bSideExpanded) {
            var oToggleButton = this.byId("sideNavigationToggleButton");

            if (bSideExpanded) {
                oToggleButton.setTooltip("Large Size");
            } else {
                oToggleButton.setTooltip("Small Size");
            }
        },

        onItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            this.getOwnerComponent().getRouter().navTo(oItem.getKey());
        }
    });
});
