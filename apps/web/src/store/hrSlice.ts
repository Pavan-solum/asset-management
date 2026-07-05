import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
  createdAt: string;
}

export interface LeavePolicy {
  id: string;
  name: string;
  code: string;
  maxDays: number;
  description: string;
}

export type PolicyCategory = 'general' | 'conduct' | 'safety' | 'leave' | 'it' | 'finance' | 'remote_work';

export interface PolicyAcknowledgement {
  employeeId: string;
  acknowledgedAt: string;
}

export interface CompanyPolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  version: string;
  effectiveDate: string;
  content: string;
  requiresAcknowledgement: boolean;
  acknowledgements: PolicyAcknowledgement[];
  status: 'active' | 'archived';
  createdAt: string;
}

interface HRState {
  leaveRequests: LeaveRequest[];
  policies: LeavePolicy[];
  companyPolicies: CompanyPolicy[];
}

const initialPolicies: LeavePolicy[] = [
  { id: 'pol-1', name: 'Annual Leave', code: 'AL', maxDays: 25, description: 'Paid vacation days allocated yearly.' },
  { id: 'pol-2', name: 'Sick Leave', code: 'SL', maxDays: 12, description: 'Paid leave for medical recovery and doctor appointments.' },
  { id: 'pol-3', name: 'Casual Leave', code: 'CL', maxDays: 10, description: 'Short-term leaves for personal matters.' },
  { id: 'pol-4', name: 'Maternity Leave', code: 'ML', maxDays: 180, description: 'Paid parental leave for mothers.' },
  { id: 'pol-5', name: 'Paternity Leave', code: 'PL', maxDays: 15, description: 'Paid parental leave for fathers.' },
];

const EMPLOYEES_ALL = ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005', 'emp-006'];
const ackAll = (): PolicyAcknowledgement[] =>
  EMPLOYEES_ALL.map(empId => ({ employeeId: empId, acknowledgedAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString() }));

const initialCompanyPolicies: CompanyPolicy[] = [
  {
    id: 'cpol-001', title: 'Employee Code of Conduct', category: 'conduct', version: '3.1',
    effectiveDate: '2026-01-01', requiresAcknowledgement: true,
    content: '## Code of Conduct\n\n**1. Professional Behaviour**\nAll employees are expected to maintain a high standard of professional conduct in all interactions with colleagues, clients, and partners.\n\n**2. Respect & Inclusion**\nWe are committed to a diverse and inclusive workplace. Discrimination, harassment, or bullying of any kind will not be tolerated.\n\n**3. Confidentiality**\nEmployees must protect company and client confidential information and not disclose it to unauthorized parties.\n\n**4. Conflicts of Interest**\nEmployees must disclose any personal or financial interests that may conflict with their duties.',
    acknowledgements: ackAll(), status: 'active', createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cpol-002', title: 'Remote Work & Flexible Hours Policy', category: 'remote_work', version: '2.0',
    effectiveDate: '2026-01-15', requiresAcknowledgement: true,
    content: '## Remote Work Policy\n\n**Eligibility**\nAll full-time employees are eligible for hybrid work after 3 months of employment.\n\n**WFH Days**\nUp to 3 days per week may be worked from home, subject to manager approval.\n\n**Core Hours**\nAll employees must be available online between 10:00 AM and 4:00 PM IST.\n\n**Security**\nVPN must be used when accessing company systems remotely.',
    acknowledgements: ackAll().slice(0, 5), status: 'active', createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'cpol-003', title: 'IT Security & Acceptable Use Policy', category: 'it', version: '4.2',
    effectiveDate: '2026-01-01', requiresAcknowledgement: true,
    content: '## IT Security Policy\n\n**Password Management**\nAll passwords must be at least 12 characters with MFA mandatory for all company accounts.\n\n**Device Usage**\nCompany devices must not be used for personal activities. Software only via approved IT catalog.\n\n**Data Handling**\nCustomer data must be handled per GDPR/PDPA. Data must not be stored on personal devices.\n\n**Incident Reporting**\nAny suspected breach or lost device must be reported to IT within 1 hour.',
    acknowledgements: ackAll(), status: 'active', createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cpol-004', title: 'Expense Reimbursement Policy', category: 'finance', version: '1.5',
    effectiveDate: '2026-02-01', requiresAcknowledgement: false,
    content: '## Expense Reimbursement Policy\n\n**Eligible Expenses**\nBusiness travel, client meals, approved training, and WFH equipment are reimbursable.\n\n**Limits**\n- Meals (client): Up to ₹3,000 per person\n- Hotels: Up to ₹6,000/night domestic\n- International travel: Requires VP approval\n\n**Submission**\nExpenses must be submitted within 30 days with valid receipts.',
    acknowledgements: ackAll().slice(0, 4), status: 'active', createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'cpol-005', title: 'Leave & Time-Off Policy', category: 'leave', version: '2.3',
    effectiveDate: '2026-01-01', requiresAcknowledgement: true,
    content: '## Leave Policy\n\n**Annual Leave**\n25 days per year, accrued monthly. Up to 10 days carry forward allowed.\n\n**Sick Leave**\n12 days per year. Medical certificate required for 3+ consecutive days.\n\n**Casual Leave**\n10 days per year, not encashable. 24-hour prior notice required.\n\n**Maternity/Paternity**\nMaternity: 26 weeks paid. Paternity: 15 days paid.',
    acknowledgements: ackAll(), status: 'active', createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cpol-006', title: 'Health & Workplace Safety Policy', category: 'safety', version: '1.0',
    effectiveDate: '2026-01-01', requiresAcknowledgement: false,
    content: '## Workplace Safety Policy\n\n**Safety First**\nAll employees must follow safety guidelines and report hazards immediately to facilities management.\n\n**Emergency Procedures**\nFire exits, assembly points, and first-aid kits must be known by all staff.\n\n**Mental Health**\nEAP counselling services are available for all employees confidentially.',
    acknowledgements: ackAll().slice(0, 3), status: 'active', createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cpol-007', title: 'Anti-Harassment & Equal Opportunity', category: 'general', version: '2.0',
    effectiveDate: '2026-01-01', requiresAcknowledgement: true,
    content: '## Anti-Harassment Policy\n\n**Zero Tolerance**\nHarassment or discrimination based on gender, race, religion, sexual orientation, or disability is strictly prohibited.\n\n**Reporting**\nReport incidents to HR or use the anonymous reporting hotline.\n\n**Consequences**\nViolations may result in disciplinary action up to and including termination.',
    acknowledgements: ackAll(), status: 'active', createdAt: '2026-01-01T00:00:00Z',
  },
];

const initialLeaveRequests: LeaveRequest[] = [
  { id: 'lr-001', employeeId: 'emp-001', leaveType: 'Annual Leave', startDate: '2026-07-01', endDate: '2026-07-10', daysCount: 7, reason: 'Summer vacation with family', status: 'pending', approvedBy: null, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'lr-002', employeeId: 'emp-002', leaveType: 'Sick Leave', startDate: '2026-06-10', endDate: '2026-06-12', daysCount: 3, reason: 'Dental surgery and recovery', status: 'approved', approvedBy: 'user-admin', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'lr-003', employeeId: 'emp-005', leaveType: 'Casual Leave', startDate: '2026-06-25', endDate: '2026-06-26', daysCount: 1, reason: 'Personal emergency', status: 'pending', approvedBy: null, createdAt: new Date().toISOString() },
  { id: 'lr-004', employeeId: 'emp-006', leaveType: 'Maternity Leave', startDate: '2026-04-01', endDate: '2026-06-30', daysCount: 90, reason: 'Maternity leave extension', status: 'approved', approvedBy: 'user-admin', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'lr-005', employeeId: 'emp-007', leaveType: 'Casual Leave', startDate: '2026-05-12', endDate: '2026-05-13', daysCount: 1, reason: 'Moving to a new apartment', status: 'rejected', approvedBy: 'user-admin', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
];

const initialState: HRState = {
  leaveRequests: initialLeaveRequests,
  policies: initialPolicies,
  companyPolicies: initialCompanyPolicies,
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    setLeaveRequests: (state, action: PayloadAction<LeaveRequest[]>) => {
      if (action.payload.length > 0) {
        state.leaveRequests = action.payload;
      }
    },
    addLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      state.leaveRequests.unshift(action.payload);
    },
    deleteLeaveRequest: (state, action: PayloadAction<string>) => {
      state.leaveRequests = state.leaveRequests.filter(r => r.id !== action.payload);
    },
    updateLeaveRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'approved' | 'rejected'; approvedBy: string }>
    ) => {
      const idx = state.leaveRequests.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) {
        state.leaveRequests[idx].status = action.payload.status;
        state.leaveRequests[idx].approvedBy = action.payload.approvedBy;
      }
    },
    addPolicy: (state, action: PayloadAction<Omit<LeavePolicy, 'id'>>) => {
      state.policies.push({ ...action.payload, id: `pol-${Date.now()}` });
    },
    updatePolicy: (state, action: PayloadAction<LeavePolicy>) => {
      const idx = state.policies.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) state.policies[idx] = action.payload;
    },
    deletePolicy: (state, action: PayloadAction<string>) => {
      state.policies = state.policies.filter(p => p.id !== action.payload);
    },
    addCompanyPolicy: (state, action: PayloadAction<Omit<CompanyPolicy, 'id' | 'createdAt' | 'acknowledgements'>>) => {
      state.companyPolicies.unshift({ ...action.payload, id: `cpol-${Date.now()}`, acknowledgements: [], createdAt: new Date().toISOString() });
    },
    updateCompanyPolicy: (state, action: PayloadAction<CompanyPolicy>) => {
      const idx = state.companyPolicies.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) state.companyPolicies[idx] = action.payload;
    },
    archiveCompanyPolicy: (state, action: PayloadAction<string>) => {
      const idx = state.companyPolicies.findIndex(p => p.id === action.payload);
      if (idx >= 0) state.companyPolicies[idx].status = 'archived';
    },
    acknowledgePolicy: (state, action: PayloadAction<{ policyId: string; employeeId: string }>) => {
      const policy = state.companyPolicies.find(p => p.id === action.payload.policyId);
      if (!policy) return;
      const exists = policy.acknowledgements.some(a => a.employeeId === action.payload.employeeId);
      if (!exists) {
        policy.acknowledgements.push({ employeeId: action.payload.employeeId, acknowledgedAt: new Date().toISOString() });
      }
    },
  },
});

export const {
  setLeaveRequests,
  addLeaveRequest,
  deleteLeaveRequest,
  updateLeaveRequestStatus,
  addPolicy,
  updatePolicy,
  deletePolicy,
  addCompanyPolicy,
  updateCompanyPolicy,
  archiveCompanyPolicy,
  acknowledgePolicy,
} = hrSlice.actions;
export default hrSlice.reducer;
