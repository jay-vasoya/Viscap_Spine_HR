'use strict';

const cds = require('@sap/cds');

module.exports = class HRMSService extends cds.ApplicationService {

  async init() {

    const { LeaveRequests, LeaveBalances, Attendances, SwipeRequests } = this.entities;

    // ── Before CREATE LeaveRequests ─────────────────────────────────────────
    this.before('CREATE', 'LeaveRequests', async (req) => {
      const data = req.data;

      // Auto-generate request number
      const count = await SELECT.one`count(*) as cnt`.from(LeaveRequests);
      const seq = (count.cnt || 0) + 1;
      data.requestNo = `LR-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
      data.appliedOn = new Date().toISOString();
      data.status = 'Pending';

      // Validate dates
      if (new Date(data.fromDate) > new Date(data.toDate)) {
        req.error(400, 'From Date cannot be after To Date');
      }

      // Calculate working days
      data.days = data.days || this._calcDays(data.fromDate, data.toDate);
    });

    // ── After CREATE LeaveRequests - deduct pending balance ─────────────────
    this.after('CREATE', 'LeaveRequests', async (data) => {
      await UPDATE(LeaveBalances)
        .where({ employee_ID: data.employee_ID, leaveType_ID: data.leaveType_ID })
        .set({ pending: { '+=': data.days } });
    });

    // ── Action: Approve Leave ───────────────────────────────────────────────
    this.on('approveLeave', async (req) => {
      const { leaveRequestId, remarks } = req.data;
      const lr = await SELECT.one.from(LeaveRequests).where({ ID: leaveRequestId });

      if (!lr) return req.error(404, 'Leave request not found');
      if (lr.status !== 'Pending') return req.error(400, `Cannot approve leave in ${lr.status} status`);

      await UPDATE(LeaveRequests).set({
        status: 'Approved',
        approvedOn: new Date().toISOString(),
        remarks
      }).where({ ID: leaveRequestId });

      // Move from pending to taken
      await UPDATE(LeaveBalances)
        .where({ employee_ID: lr.employee_ID, leaveType_ID: lr.leaveType_ID })
        .set({ pending: { '-=': lr.days }, taken: { '+=': lr.days }, balance: { '-=': lr.days } });

      return SELECT.one.from(LeaveRequests).where({ ID: leaveRequestId });
    });

    // ── Action: Reject Leave ────────────────────────────────────────────────
    this.on('rejectLeave', async (req) => {
      const { leaveRequestId, remarks } = req.data;
      const lr = await SELECT.one.from(LeaveRequests).where({ ID: leaveRequestId });

      if (!lr) return req.error(404, 'Leave request not found');
      if (lr.status !== 'Pending') return req.error(400, `Cannot reject leave in ${lr.status} status`);

      await UPDATE(LeaveRequests).set({
        status: 'Rejected',
        approvedOn: new Date().toISOString(),
        remarks
      }).where({ ID: leaveRequestId });

      // Restore pending balance
      await UPDATE(LeaveBalances)
        .where({ employee_ID: lr.employee_ID, leaveType_ID: lr.leaveType_ID })
        .set({ pending: { '-=': lr.days } });

      return SELECT.one.from(LeaveRequests).where({ ID: leaveRequestId });
    });

    // ── Action: Cancel Leave ────────────────────────────────────────────────
    this.on('cancelLeave', async (req) => {
      const { leaveRequestId } = req.data;
      const lr = await SELECT.one.from(LeaveRequests).where({ ID: leaveRequestId });

      if (!lr) return req.error(404, 'Leave request not found');
      if (!['Pending', 'Approved'].includes(lr.status))
        return req.error(400, `Cannot cancel leave in ${lr.status} status`);

      const wasPending  = lr.status === 'Pending';
      const wasApproved = lr.status === 'Approved';

      await UPDATE(LeaveRequests).set({ status: 'Cancelled' }).where({ ID: leaveRequestId });

      if (wasPending) {
        await UPDATE(LeaveBalances)
          .where({ employee_ID: lr.employee_ID, leaveType_ID: lr.leaveType_ID })
          .set({ pending: { '-=': lr.days } });
      } else if (wasApproved) {
        await UPDATE(LeaveBalances)
          .where({ employee_ID: lr.employee_ID, leaveType_ID: lr.leaveType_ID })
          .set({ taken: { '-=': lr.days }, balance: { '+=': lr.days } });
      }

      return SELECT.one.from(LeaveRequests).where({ ID: leaveRequestId });
    });

    // ── SwipeRequest auto-generate ──────────────────────────────────────────
    this.before('CREATE', 'SwipeRequests', (req) => {
      req.data.status = 'Pending';
    });

    await super.init();
  }

  // ── Helper: Calculate Working Days ───────────────────────────────────────
  _calcDays(from, to) {
    let count = 0;
    const start = new Date(from);
    const end   = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  }
};
