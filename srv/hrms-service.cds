using { com.viscap.hrms as hrms } from '../db/schema';

@path: '/odata/v4/hrms'
service HRMSService {

  @readonly
  entity Employees as projection on hrms.Employees {
    *, department.name  as departmentName,
       manager.fullName as managerName
  };

  @readonly
  entity Departments as projection on hrms.Departments;

  @readonly
  entity LeaveTypes as projection on hrms.LeaveTypes;

  @readonly
  entity LeaveBalances as projection on hrms.LeaveBalances {
    *, leaveType.code  as leaveTypeCode,
       leaveType.name  as leaveTypeName,
       leaveType.color as leaveTypeColor
  };

  entity LeaveRequests as projection on hrms.LeaveRequests {
    *, leaveType.code    as leaveTypeCode,
       leaveType.name    as leaveTypeName,
       employee.fullName as employeeName,
       employee.empCode  as employeeCode
  };

  // ✅ NEW
  entity LeavePlanned as projection on hrms.LeavePlanned {
    *, leaveType.code    as leaveTypeCode,
       leaveType.name    as leaveTypeName,
       employee.fullName as employeeName,
       employee.empCode  as employeeCode
  };

  // ✅ NEW
  entity OutdoorDutyRequests as projection on hrms.OutdoorDutyRequests {
    *, employee.fullName   as employeeName,
       employee.empCode    as employeeCode,
       approvedBy.fullName as approvedByName
  };

  // ✅ NEW
  entity CompOffRequests as projection on hrms.CompOffRequests {
    *, employee.fullName   as employeeName,
       employee.empCode    as employeeCode,
       approvedBy.fullName as approvedByName
  };

  @readonly
  entity Attendances as projection on hrms.Attendances {
    *, employee.fullName as employeeName
  };

  @readonly
  entity Holidays as projection on hrms.Holidays;

  @readonly
  entity Payslips as projection on hrms.Payslips {
    *, employee.fullName as employeeName,
       employee.empCode  as employeeCode
  };
@readonly
entity LeaveRules as projection on hrms.LeaveRules {
  *,
  leaveType.code as leaveTypeCode,
  leaveType.name as leaveTypeName
};
  entity SwipeRequests as projection on hrms.SwipeRequests {
    *, employee.fullName as employeeName
  };

  action approveLeave(leaveRequestId: UUID, remarks: String) returns LeaveRequests;
  action rejectLeave(leaveRequestId: UUID, remarks: String)  returns LeaveRequests;
  action cancelLeave(leaveRequestId: UUID)                   returns LeaveRequests;
}