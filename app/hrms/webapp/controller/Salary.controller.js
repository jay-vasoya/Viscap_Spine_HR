sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  var MONTHS = ["", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return Controller.extend("com.viscap.hrms.controller.Salary", {

    monthNameFormatter: function (iMonth) {
      return MONTHS[iMonth] || "";
    },

    currencyFormatter: function (nValue) {
      if (nValue === undefined || nValue === null) return "";
      return "Rs. " + parseFloat(nValue).toLocaleString("en-IN");
    },

    onInit: function () {},

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("dashboard");
    },

    onPayslipPress: function (oEvent) {
      var oCtx  = oEvent.getSource().getBindingContext("hrms");
      if (!oCtx) return;
      var oData = oCtx.getObject();

      var fmt = this.currencyFormatter.bind(this);
      var oView = this.getView();
      oView.byId("detailBasic").setText(fmt(oData.basicSalary));
      oView.byId("detailHRA").setText(fmt(oData.hra));
      oView.byId("detailDA").setText(fmt(oData.da));
      oView.byId("detailOther").setText(fmt(oData.otherAllowances));
      oView.byId("detailGross").setText(fmt(oData.grossSalary));
      oView.byId("detailPF").setText(fmt(oData.pf));
      oView.byId("detailESIC").setText(fmt(oData.esic));
      oView.byId("detailTDS").setText(fmt(oData.tds));
      oView.byId("detailOtherDed").setText(fmt(oData.otherDeductions));
      oView.byId("detailNet").setText(fmt(oData.netSalary));

      oView.byId("payslipDetailPanel").setVisible(true);
    },

    onDownloadPayslip: function (oEvent) {
      MessageToast.show("Downloading payslip...");
    }
  });
});
