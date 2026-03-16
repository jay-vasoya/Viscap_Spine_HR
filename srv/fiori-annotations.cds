using HRMSService from './hrms-service';

// ════════════════════════════════════════════════════════════
//  LeaveRequests – List Report + Object Page Annotations
// ════════════════════════════════════════════════════════════

annotate HRMSService.LeaveRequests with @(
  UI.LineItem: [
    { $Type: 'UI.DataField', Value: requestNo,      Label: 'Request No'  },
    { $Type: 'UI.DataField', Value: leaveTypeName,  Label: 'Leave Type'  },
    { $Type: 'UI.DataField', Value: fromDate,       Label: 'From'        },
    { $Type: 'UI.DataField', Value: toDate,         Label: 'To'          },
    { $Type: 'UI.DataField', Value: days,           Label: 'Days'        },
    { $Type: 'UI.DataField', Value: status,         Label: 'Status',
      Criticality: status_criticality                                     },
    { $Type: 'UI.DataField', Value: appliedOn,      Label: 'Applied On'  }
  ],
  UI.SelectionFields: [ leaveType_ID, status, fromDate ],
  UI.HeaderInfo: {
    TypeName: 'Leave Request',
    TypeNamePlural: 'Leave Requests',
    Title: { Value: requestNo },
    Description: { Value: leaveTypeName }
  },
  UI.FieldGroup #General: {
    $Type: 'UI.FieldGroupType',
    Label: 'Leave Details',
    Data: [
      { $Type: 'UI.DataField', Value: requestNo     },
      { $Type: 'UI.DataField', Value: leaveTypeName },
      { $Type: 'UI.DataField', Value: fromDate       },
      { $Type: 'UI.DataField', Value: toDate         },
      { $Type: 'UI.DataField', Value: days           },
      { $Type: 'UI.DataField', Value: reason         },
      { $Type: 'UI.DataField', Value: status         },
      { $Type: 'UI.DataField', Value: appliedOn      }
    ]
  },
  UI.FieldGroup #Approval: {
    $Type: 'UI.FieldGroupType',
    Label: 'Approval Info',
    Data: [
      { $Type: 'UI.DataField', Value: approvedOn },
      { $Type: 'UI.DataField', Value: remarks    }
    ]
  },
  UI.Facets: [
    { $Type: 'UI.ReferenceFacet', Label: 'Leave Details', ID: 'General', Target: '@UI.FieldGroup#General'   },
    { $Type: 'UI.ReferenceFacet', Label: 'Approval Info', ID: 'Approval', Target: '@UI.FieldGroup#Approval' }
  ]
);

annotate HRMSService.LeaveRequests with {
  status @Common.ValueList: {
    CollectionPath: 'x-LeaveStatus',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: status, ValueListProperty: 'code' }]
  };
  leaveType @Common.ValueListWithFixedValues: true;
};

// ════════════════════════════════════════════════════════════
//  Employees – Annotations
// ════════════════════════════════════════════════════════════

annotate HRMSService.Employees with @(
  UI.LineItem: [
    { $Type: 'UI.DataField', Value: empCode,         Label: 'Emp Code'     },
    { $Type: 'UI.DataField', Value: fullName,         Label: 'Name'         },
    { $Type: 'UI.DataField', Value: departmentName,   Label: 'Department'   },
    { $Type: 'UI.DataField', Value: designation,      Label: 'Designation'  },
    { $Type: 'UI.DataField', Value: dateOfJoining,    Label: 'Joined'       },
    { $Type: 'UI.DataField', Value: status,           Label: 'Status'       }
  ],
  UI.HeaderInfo: {
    TypeName: 'Employee',
    TypeNamePlural: 'Employees',
    Title: { Value: fullName },
    Description: { Value: designation }
  }
);

// ════════════════════════════════════════════════════════════
//  Attendances – Annotations
// ════════════════════════════════════════════════════════════

annotate HRMSService.Attendances with @(
  UI.LineItem: [
    { $Type: 'UI.DataField', Value: date,      Label: 'Date'       },
    { $Type: 'UI.DataField', Value: inTime,    Label: 'In Time'    },
    { $Type: 'UI.DataField', Value: outTime,   Label: 'Out Time'   },
    { $Type: 'UI.DataField', Value: workHours, Label: 'Hours'      },
    { $Type: 'UI.DataField', Value: status,    Label: 'Status'     },
    { $Type: 'UI.DataField', Value: remarks,   Label: 'Remarks'    }
  ],
  UI.SelectionFields: [ date, status ]
);

// ════════════════════════════════════════════════════════════
//  Payslips – Annotations
// ════════════════════════════════════════════════════════════

annotate HRMSService.Payslips with @(
  UI.LineItem: [
    { $Type: 'UI.DataField', Value: month,      Label: 'Month'       },
    { $Type: 'UI.DataField', Value: year,       Label: 'Year'        },
    { $Type: 'UI.DataField', Value: grossSalary, Label: 'Gross'      },
    { $Type: 'UI.DataField', Value: netSalary,  Label: 'Net Salary'  },
    { $Type: 'UI.DataField', Value: status,     Label: 'Status'      },
    { $Type: 'UI.DataField', Value: paidOn,     Label: 'Paid On'     }
  ],
  UI.FieldGroup #SalaryBreakdown: {
    $Type: 'UI.FieldGroupType',
    Label: 'Salary Breakdown',
    Data: [
      { $Type: 'UI.DataField', Value: basicSalary      },
      { $Type: 'UI.DataField', Value: hra               },
      { $Type: 'UI.DataField', Value: da                },
      { $Type: 'UI.DataField', Value: otherAllowances   },
      { $Type: 'UI.DataField', Value: grossSalary       }
    ]
  },
  UI.FieldGroup #Deductions: {
    $Type: 'UI.FieldGroupType',
    Label: 'Deductions',
    Data: [
      { $Type: 'UI.DataField', Value: pf               },
      { $Type: 'UI.DataField', Value: esic              },
      { $Type: 'UI.DataField', Value: tds               },
      { $Type: 'UI.DataField', Value: otherDeductions   },
      { $Type: 'UI.DataField', Value: netSalary         }
    ]
  },
  UI.Facets: [
    { $Type: 'UI.ReferenceFacet', Label: 'Salary Breakdown', Target: '@UI.FieldGroup#SalaryBreakdown' },
    { $Type: 'UI.ReferenceFacet', Label: 'Deductions',       Target: '@UI.FieldGroup#Deductions'       }
  ]
);
