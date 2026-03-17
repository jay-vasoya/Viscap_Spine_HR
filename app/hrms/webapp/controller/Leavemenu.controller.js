sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("com.viscap.hrms.controller.LeaveMenu", {

    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("leaveMenu").attachPatternMatched(
        this._onRouteMatched, this
      );
    },

    _onRouteMatched: function () {
      const oSearch = this.byId("headerSearch");
      if (oSearch) oSearch.setValue("");
    },

    onHeaderSearch: function (oEvent) {
      const sQuery = oEvent.getParameter("query") || "";
      if (!sQuery) return;
      MessageToast.show("Searching for: " + sQuery);
    },

    // ── Navigation ────────────────────────────────────────────────────────
    onMyInfo: function () {
      this.getOwnerComponent().getRouter().navTo("leaveMyInfo");
    },

    onLeavePlanner: function () {
      this.getOwnerComponent().getRouter().navTo("leavePlanner");
    },

    // ✅ FIX: was navigating to "leave" but route target viewLevel
    // needs to match App.view.xml NavContainer properly
    onLeave: function () {
      this.getOwnerComponent().getRouter().navTo("leave");
    },

    onOutdoorDuty: function () {
      this.getOwnerComponent().getRouter().navTo("outdoorDuty");
    },

    onCompOff: function () {
      this.getOwnerComponent().getRouter().navTo("compOff");
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("dashboard");
    }
  });
});