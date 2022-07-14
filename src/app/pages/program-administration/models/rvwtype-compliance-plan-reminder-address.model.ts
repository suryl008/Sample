import { RvwTypeCompliancePlanSubmissionReminderSchedule } from "./rvwtype-complianceplan-reminder-schedule.model";

export interface RvwTypeCompliancePlanSubmissionReminderAddress {
  rvwTypeCompliancePlanSubmissionReminderAddressId: number;
  rvwTypeCompliancePlanSubmissionReminderScheduleId: number;
  receiptType?: string;
  addressType?: string;
  addressValue?: string;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  rvwTypeCompliancePlanSubmissionReminderSchedule: RvwTypeCompliancePlanSubmissionReminderSchedule[];
}
