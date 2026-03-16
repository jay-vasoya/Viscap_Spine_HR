using { com.viscap.hrms as hrms } from '../db/schema';

// ─── HR Self Service OData V4 ─────────────────────────────────────────────────
@path: '/odata/v4/hrms'
service HRMSService {

  // ── Employees ──────────────────────────────────────────────────────────────
  @readonly
  entity Employees as projection on hrms.Employees {
    *,
    department.name as departmentName,
    manager.fullName as managerName
  };

  // ── Departments ────────────────────────────────────────────────────────────
  @readonly
  entity Departments as projection on hrms.Departments;

  // ── Leave Types ────────────────────────────────────────────────────────────
  @readonly
  entity LeaveTypes as projection on hrms.LeaveTypes;

  // ── Leave Balances ─────────────────────────────────────────────────────────
  @readonly
  entity LeaveBalances as projection on hrms.LeaveBalances {
    *,
    leaveType.code  as leaveTypeCode,
    leaveType.name  as leaveTypeName,
    leaveType.color as leaveTypeColor
  };

  // ── Leave Requests ─────────────────────────────────────────────────────────
  entity LeaveRequests as projection on hrms.LeaveRequests {
    *,
    leaveType.code as leaveTypeCode,
    leaveType.name as leaveTypeName,
    employee.fullName as employeeName,
    employee.empCode as employeeCode
  };

  // ── Attendances ────────────────────────────────────────────────────────────
  @readonly
  entity Attendances as projection on hrms.Attendances {
    *,
    employee.fullName as employeeName
  };

  // ── Holidays ───────────────────────────────────────────────────────────────
  @readonly
  entity Holidays as projection on hrms.Holidays;

  // ── Payslips ───────────────────────────────────────────────────────────────
  @readonly
  entity Payslips as projection on hrms.Payslips {
    *,
    employee.fullName as employeeName,
    employee.empCode  as employeeCode
  };

  // ── Swipe Requests ─────────────────────────────────────────────────────────
  entity SwipeRequests as projection on hrms.SwipeRequests {
    *,
    employee.fullName as employeeName
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  action approveLeave(leaveRequestId: UUID, remarks: String) returns LeaveRequests;
  action rejectLeave(leaveRequestId: UUID, remarks: String)  returns LeaveRequests;
  action cancelLeave(leaveRequestId: UUID)                   returns LeaveRequests;
}
