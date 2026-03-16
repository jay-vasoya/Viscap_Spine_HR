sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "sap/ui/model/json/JSONModel",
  "com/viscap/hrms/model/models"
], function (UIComponent, Device, JSONModel, models) {
  "use strict";

  return UIComponent.extend("com.viscap.hrms.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      // Call parent init first
      UIComponent.prototype.init.apply(this, arguments);

      // Device model
      this.setModel(models.createDeviceModel(), "device");

      // Current logged-in user model
      const oUserModel = new JSONModel({
        empCode:     "240",
        fullName:    "Jayesh Patel",
        designation: "Software Engineer",
        department:  "Information Technology",
        empID:       "e1000000-0000-0000-0000-000000000001",
        fatherName:  "Arjun Patel",
        spouseName:  "Deepa Patel",
        dateOfBirth: new Date(1995, 5, 15),
        dateOfJoining: new Date(2022, 3, 1),
        confirmationDt: new Date(2022, 9, 1),
        gender: "Male",
        grade: "Senior",
        branch: "Ahmedabad",
        division: "IT",
        category: "Software",
        localAddress: "123, Lotus Apt, Satellite, Ahmedabad",
        permanentAddress: "456, Rose Villa, Mehsana, Gujarat",
        resPhone: "079-222333",
        mobile: "9876543210",
        officePhone: "079-444555",
        extnNo: "101",
        altEmail: "jayesh.alt@gmail.com",
        city: "Ahmedabad",
        district: "Ahmedabad",
        state: "Gujarat",
        pinCode: "380015",
        photo: "https://ui-avatars.com/api/?name=Jayesh+Patel&background=random",
        birthPlace: "Ahmedabad",
        nationality: "Indian",
        religion: "Hindu",
        caste: "Patel",
        bloodGroup: "O+",
        height: "5'8\"",
        weight: "70 kg",
        maritalStatus: "Unmarried",
        identificationMark: "Mole on left arm"
      });
      this.setModel(oUserModel, "user");

      // Initialize router
      this.getRouter().initialize();
    },

    getContentDensityClass: function () {
      if (this._sContentDensityClass === undefined) {
        if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
          this._sContentDensityClass = "";
        } else if (!Device.support.touch) {
          this._sContentDensityClass = "sapUiSizeCompact";
        } else {
          this._sContentDensityClass = "sapUiSizeCozy";
        }
      }
      return this._sContentDensityClass;
    }
  });
});
