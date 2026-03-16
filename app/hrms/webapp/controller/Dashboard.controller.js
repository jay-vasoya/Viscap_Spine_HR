sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
  "use strict";

  return Controller.extend("com.viscap.hrms.controller.Dashboard", {

    onInit: function () {
      // Dashboard summary model
      const oDashModel = new JSONModel({
        presentDays: 12,
        leaveBalance: 31,
        netSalary: "50.3"
      });
      this.getView().setModel(oDashModel, "dashModel");

      // Set user info from component model into view controls safely
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("dashboard").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function () {
      // Safely set user display after view is rendered
      const oUserModel = this.getOwnerComponent().getModel("user");
      if (oUserModel) {
        const sFullName = oUserModel.getProperty("/fullName") || "Jayesh Patel";
        const sDesig    = oUserModel.getProperty("/designation") || "Software Engineer";
        const sDept     = oUserModel.getProperty("/department") || "Information Technology";
        const sCode     = oUserModel.getProperty("/empCode") || "240";

        // Get initials safely
        const aWords   = sFullName.split(" ");
        const sInitials = aWords.map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase();

        const oView = this.getView();
        oView.byId("welcomeTitle").setText("Good Morning, " + sFullName + "!");
        oView.byId("welcomeSubtitle").setText(sDesig + " · " + sDept);
        oView.byId("welcomeEmpCode").setText("Employee Code: " + sCode);
        oView.byId("headerUserName").setText(sFullName);
        oView.byId("headerAvatar").setInitials(sInitials);
      }

      // Load leave balances
      this._loadLeaveBalances();
    },

    _loadLeaveBalances: function () {
      const oHrms       = this.getOwnerComponent().getModel("hrms");
      const oDashModel  = this.getView().getModel("dashModel");
      if (!oHrms) return;

      const oListBinding = oHrms.bindList("/LeaveBalances", undefined, undefined, [
        new Filter("employee_ID", FilterOperator.EQ, "e1000000-0000-0000-0000-000000000001"),
        new Filter("year", FilterOperator.EQ, new Date().getFullYear())
      ]);

      oListBinding.requestContexts().then(function (aContexts) {
        const total = aContexts.reduce(function (s, oContext) {
          return s + (parseFloat(oContext.getProperty("balance")) || 0);
        }, 0);
        oDashModel.setProperty("/leaveBalance", total);
      });
    },

    onNavDashboard:  function () { this.getOwnerComponent().getRouter().navTo("dashboard"); },
    onNavAttendance: function () { this.getOwnerComponent().getRouter().navTo("attendance"); },
    onNavLeave:      function () { this.getOwnerComponent().getRouter().navTo("leave"); },
    onNavSalaryCTC: function () { this.getOwnerComponent().getRouter().navTo("salary-ctc"); },
    onNavSalaryPayslip: function () { this.getOwnerComponent().getRouter().navTo("salary-payslip"); },
    onNavSalaryMonthlyReport: function () { this.getOwnerComponent().getRouter().navTo("salary-monthly-report"); },
    onNavViewStatutory: function () { this.getOwnerComponent().getRouter().navTo("view-statutory"); },
    onNavViewFamily: function () { this.getOwnerComponent().getRouter().navTo("view-family"); },
    onNavViewNominee: function () { this.getOwnerComponent().getRouter().navTo("view-nominee"); },
    onNavViewImmigration: function () { this.getOwnerComponent().getRouter().navTo("view-immigration"); },
    onNavViewDrivingLicense: function () { this.getOwnerComponent().getRouter().navTo("view-driving-license"); },
    onNavViewSkills: function () { this.getOwnerComponent().getRouter().navTo("view-skills"); },
    onNavViewLanguages: function () { this.getOwnerComponent().getRouter().navTo("view-languages"); },
    onNavViewQualification: function () { this.getOwnerComponent().getRouter().navTo("view-qualification"); },
    onNavViewSocialDetails: function () { this.getOwnerComponent().getRouter().navTo("view-social-details"); },
    onNavViewAssets: function () { this.getOwnerComponent().getRouter().navTo("view-assets"); },
    onNavViewPolicy: function () { this.getOwnerComponent().getRouter().navTo("view-policy"); },
    onChangePassword: function () { this.getOwnerComponent().getRouter().navTo("change-password"); },
    onNavPersonal:   function () { this.getOwnerComponent().getRouter().navTo("personal"); },
    onNavEditProfile: function () { this.getOwnerComponent().getRouter().navTo("edit-profile"); },
    onNavEditContact: function () { this.getOwnerComponent().getRouter().navTo("edit-contact"); },
    onNavEditPersonal: function () { this.getOwnerComponent().getRouter().navTo("edit-personal"); },
    onNavEditImmigration: function () { this.getOwnerComponent().getRouter().navTo("edit-immigration"); },
    onNavEditVisa: function () { this.getOwnerComponent().getRouter().navTo("edit-visa"); },
    onNavEditDrivingLicense: function () { this.getOwnerComponent().getRouter().navTo("edit-driving-license"); },
    onNavEditFamily: function () { this.getOwnerComponent().getRouter().navTo("edit-family"); },
    onNavEditSkills: function () { this.getOwnerComponent().getRouter().navTo("edit-skills"); },
    onNavEditNominee: function () { this.getOwnerComponent().getRouter().navTo("edit-nominee"); },
    onNavEditLanguages: function () { this.getOwnerComponent().getRouter().navTo("edit-languages"); },
    onNavEditQualification: function () { this.getOwnerComponent().getRouter().navTo("edit-qualification"); },
    onNavEditPreviousExperience: function () { this.getOwnerComponent().getRouter().navTo("edit-previous-experience"); },
    onNavEmployment: function () { this.getOwnerComponent().getRouter().navTo("employment"); },
    onNavContact:    function () { this.getOwnerComponent().getRouter().navTo("contact"); },

    onAvatarPress: function () {
      MessageToast.show("Profile settings");
    }
  });
});
