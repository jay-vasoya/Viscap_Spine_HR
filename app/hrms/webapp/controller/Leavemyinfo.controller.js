sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
  "use strict";

  const EMPLOYEE_ID = "e1000000-0000-0000-0000-000000000001";

  return Controller.extend("com.viscap.hrms.controller.LeaveMyInfo", {

    onInit: function () {
      // Track which tabs have been loaded to avoid re-filtering
      this._tabLoaded = {};

      this.getOwnerComponent()
          .getRouter()
          .getRoute("leaveMyInfo")
          .attachPatternMatched(this._onRouteMatched, this);
    },

    // ── On route match: only load the default visible tab ───────────────────
    _onRouteMatched: function () {
      this._tabLoaded = {}; // reset on each navigation
      // Default tab is "entitlement" — load only that
      this._loadEntitlement();
    },

    // ══ TAB SELECT ═══════════════════════════════════════════════════════════
    onTabSelect: function (oEvent) {
      const sKey = oEvent.getParameter("key");
      switch (sKey) {
        case "entitlement":
          this._loadEntitlement();
          break;
        case "register":
          this._applyRegisterFilter();
          break;
        case "rules":
          this._loadLeaveRules();
          break;
      }
    },

    // ══ ENTITLEMENT TAB ═══════════════════════════════════════════════════════
    // Entity  : LeaveBalances
    // Filter  : employee_ID eq <guid>
    _loadEntitlement: function () {
      if (this._tabLoaded.entitlement) return;

      const oBinding = this.byId("entitlementTable")?.getBinding("items");
      if (!oBinding) return;

      oBinding.filter([
        new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID)
      ]);

      this._tabLoaded.entitlement = true;
    },

    // ══ REGISTER TAB ══════════════════════════════════════════════════════════
    // Entity  : LeaveRequests
    // Filter  : employee_ID eq <guid>
    //           AND fromDate ge 2026-01-01 AND fromDate le 2026-12-31
    onRegisterYearChange: function () {
      this._tabLoaded.register = false; // force reload on year change
      this._applyRegisterFilter();
    },

    _applyRegisterFilter: function () {
      const oSelect  = this.byId("registerYearSelect");
      const oBinding = this.byId("registerTable")?.getBinding("items");
      if (!oSelect || !oBinding) return;

      const sYear = oSelect.getSelectedKey();
      const sFrom = sYear + "-01-01";
      const sTo   = sYear + "-12-31";

      oBinding.filter([
        new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID),
        new Filter("fromDate",    FilterOperator.GE, sFrom),
        new Filter("fromDate",    FilterOperator.LE, sTo)
      ]);

      this._tabLoaded.register = true;
    },

    onRegisterSearch: function (oEvent) {
      const sQuery   = (oEvent.getParameter("query") ??
                        oEvent.getParameter("newValue") ?? "").trim();
      const oBinding = this.byId("registerTable")?.getBinding("items");
      if (!oBinding) return;

      const sYear = this.byId("registerYearSelect")?.getSelectedKey();
      const sFrom = sYear + "-01-01";
      const sTo   = sYear + "-12-31";

      const aFilters = [
        new Filter("employee_ID", FilterOperator.EQ, EMPLOYEE_ID),
        new Filter("fromDate",    FilterOperator.GE, sFrom),
        new Filter("fromDate",    FilterOperator.LE, sTo)
      ];

      if (sQuery) {
        aFilters.push(new Filter({
          filters: [
            new Filter("requestNo",     FilterOperator.Contains, sQuery),
            new Filter("leaveTypeName", FilterOperator.Contains, sQuery),
            new Filter("status",        FilterOperator.Contains, sQuery)
          ],
          and: false
        }));
      }

      oBinding.filter(aFilters);
    },

    // ══ RULES TAB ═════════════════════════════════════════════════════════════
    // Entity  : LeaveRules — no employee filter, plain master data
    _loadLeaveRules: function () {
      if (this._tabLoaded.rules) return; // already loaded, skip

      const oBinding = this.byId("rulesTable")?.getBinding("items");
      if (!oBinding) return;

      // No filters needed — LeaveRules is master data, not employee-scoped
      oBinding.filter([]);  // clear any stale filters
      oBinding.refresh();   // explicit refresh to trigger the request

      this._tabLoaded.rules = true;
    },

    // ══ NAV BACK ══════════════════════════════════════════════════════════════
    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("leaveMenu");
    }
  });
});