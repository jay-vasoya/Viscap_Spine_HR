namespace com.viscap.hrms;

using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';

// ─── Employees ──────────────────────────────────────────────────────────────
entity Employees : cuid, managed {
  empCode        : String(20)  @title: 'Employee Code';
  firstName      : String(50)  @title: 'First Name';
  lastName       : String(50)  @title: 'Last Name';
  fullName       : String(100) @title: 'Full Name';
  email          : String(100) @title: 'Email';
  phone          : String(20)  @title: 'Phone';
  department     : Association to Departments;
  designation    : String(100) @title: 'Designation';
  dateOfJoining  : Date        @title: 'Date of Joining';
  dateOfBirth    : Date        @title: 'Date of Birth';
  gender         : String(10)  @title: 'Gender';
  fatherName     : String(100) @title: 'Father Name';
  spouseName     : String(100) @title: 'Spouse Name';
  confirmationDt : Date        @title: 'Confirmation Date';
  grade          : String(50)  @title: 'Grade';
  branch         : String(100) @title: 'Branch';
  division       : String(100) @title: 'Division';
  category       : String(50)  @title: 'Category';
  
  // Contact Info
  localAddress      : String(500) @title: 'Local Address';
  permanentAddress  : String(500) @title: 'Permanent Address';
  resPhone          : String(20)  @title: 'Res Phone No';
  mobile            : String(20)  @title: 'Mobile';
  officePhone       : String(20)  @title: 'Office Phone No';
  extnNo            : String(10)  @title: 'Extn No';
  altEmail          : String(100) @title: 'Alt Email';
  city              : String(100) @title: 'City';
  district          : String(100) @title: 'District';
  state             : String(100) @title: 'State';
  pinCode           : String(10)  @title: 'Pin Code';

  // Personal Info
  birthPlace     : String(100) @title: 'Birth Place';
  nationality    : String(50)  @title: 'Nationality';
  religion       : String(50)  @title: 'Religion';
  caste          : String(50)  @title: 'Caste';
  bloodGroup     : String(10)  @title: 'Blood Group';
  height         : String(20)  @title: 'Height';
  weight         : String(20)  @title: 'Weight';
  maritalStatus  : String(20)  @title: 'Marital Status';
  identificationMark : String(200) @title: 'Identification Mark';

  status         : String(20)  default 'Active' @title: 'Status';
  manager        : Association to Employees;
  leaveBalances  : Composition of many LeaveBalances on leaveBalances.employee = $self;
  attendances    : Composition of many Attendances on attendances.employee = $self;
  leaveRequests  : Composition of many LeaveRequests on leaveRequests.employee = $self;
}

// ─── Departments ─────────────────────────────────────────────────────────────
entity Departments : cuid {
  code    : String(20)  @title: 'Department Code';
  name    : String(100) @title: 'Department Name';
  head    : Association to Employees;
}

// ─── Leave Types ─────────────────────────────────────────────────────────────
entity LeaveTypes : cuid {
  code         : String(20)  @title: 'Leave Code';
  name         : String(100) @title: 'Leave Name';
  maxDays      : Integer     @title: 'Max Days Per Year';
  isPaid       : Boolean     default true @title: 'Is Paid';
  carryForward : Boolean     default false @title: 'Carry Forward';
  color        : String(20)  @title: 'Color';
}

// ─── Leave Balances ──────────────────────────────────────────────────────────
entity LeaveBalances : cuid {
  employee    : Association to Employees;
  leaveType   : Association to LeaveTypes;
  year        : Integer      @title: 'Year';
  entitled    : Decimal(5,2) @title: 'Entitled Days';
  taken       : Decimal(5,2) default 0 @title: 'Taken Days';
  pending     : Decimal(5,2) default 0 @title: 'Pending Days';
  balance     : Decimal(5,2) @title: 'Balance Days';
}

// ─── Leave Requests ──────────────────────────────────────────────────────────
entity LeaveRequests : cuid, managed {
  requestNo    : String(20)  @title: 'Request No';
  employee     : Association to Employees;
  leaveType    : Association to LeaveTypes;
  fromDate     : Date        @title: 'From Date';
  toDate       : Date        @title: 'To Date';
  days         : Decimal(5,2) @title: 'Number of Days';
  reason       : String(500) @title: 'Reason';
  status       : String(20)  default 'Pending' @title: 'Status';
  appliedOn    : DateTime    @title: 'Applied On';
  approvedBy   : Association to Employees;
  approvedOn   : DateTime    @title: 'Approved On';
  remarks      : String(500) @title: 'Approver Remarks';
}

// ─── Attendances ─────────────────────────────────────────────────────────────
entity Attendances : cuid {
  employee    : Association to Employees;
  date        : Date         @title: 'Date';
  inTime      : Time         @title: 'In Time';
  outTime     : Time         @title: 'Out Time';
  workHours   : Decimal(4,2) @title: 'Work Hours';
  status      : String(20)   @title: 'Status';  // Present, Absent, WFH, Holiday, Leave
  remarks     : String(200)  @title: 'Remarks';
  swipeCount  : Integer      default 0 @title: 'Swipe Count';
}

// ─── Holidays ────────────────────────────────────────────────────────────────
entity Holidays : cuid {
  date        : Date         @title: 'Date';
  name        : String(100)  @title: 'Holiday Name';
  type        : String(50)   @title: 'Type';
  year        : Integer      @title: 'Year';
}

// ─── Payslips ────────────────────────────────────────────────────────────────
entity Payslips : cuid {
  employee     : Association to Employees;
  month        : Integer     @title: 'Month';
  year         : Integer     @title: 'Year';
  basicSalary  : Decimal(10,2) @title: 'Basic Salary';
  hra          : Decimal(10,2) @title: 'HRA';
  da           : Decimal(10,2) @title: 'DA';
  otherAllowances : Decimal(10,2) @title: 'Other Allowances';
  grossSalary  : Decimal(10,2) @title: 'Gross Salary';
  pf           : Decimal(10,2) @title: 'PF';
  esic         : Decimal(10,2) @title: 'ESIC';
  tds          : Decimal(10,2) @title: 'TDS';
  otherDeductions : Decimal(10,2) @title: 'Other Deductions';
  netSalary    : Decimal(10,2) @title: 'Net Salary';
  status       : String(20)   default 'Draft' @title: 'Status';
  paidOn       : Date         @title: 'Paid On';
}

// ─── Swipe Requests ──────────────────────────────────────────────────────────
entity SwipeRequests : cuid, managed {
  employee     : Association to Employees;
  date         : Date        @title: 'Date';
  swipeTime    : Time        @title: 'Swipe Time';
  swipeType    : String(20)  @title: 'Swipe Type';  // IN, OUT
  reason       : String(500) @title: 'Reason';
  status       : String(20)  default 'Pending' @title: 'Status';
}
