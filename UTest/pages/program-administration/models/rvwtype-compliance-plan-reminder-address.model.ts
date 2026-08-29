import { RvwTypeCompliancePlanSubmissionReminderSchedule } from "./rvwtype-complianceplan-reminder-schedule.model";

export interface RvwTypeCompliancePlanSubmissionReminderAddress {
  rvwTypeCompliancePlanSubmissionReminderAddressId: number;
  rvwTypeCompliancePlanSubmissionReminderScheduleId: number;
  receiptType?: string;
  addressType?: string;
  addressValue?: string;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  rvwTypeCompliancePlanSubmissionReminderSchedule: RvwTypeCompliancePlanSubmissionReminderSchedule[];
}
