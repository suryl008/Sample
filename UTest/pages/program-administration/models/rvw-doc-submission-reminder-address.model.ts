import { RvwTypeCompliancePlanSubmissionReminderSchedule } from "./rvwtype-complianceplan-reminder-schedule.model";

export interface RvwDocSubmissionReminderAddress {
  rvwDocSubmissionReminderAddressId: number;
  rvwDocSubmissionReminderScheduleId: number;
  receiptType?: string;
  addressType?: string;
  addressValue?: string;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
}
