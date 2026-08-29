import { PgmRvwInfo } from "./pgm-rvw-info.model";
import { EmailTemplate } from "./email-template.model";
import { RvwTypeCompliancePlanSubmissionReminderAddress } from "./rvwtype-compliance-plan-reminder-address.model";
export interface RvwTypeCompliancePlanSubmissionReminderSchedule {
  rvwTypeCompliancePlanSubmissionReminderScheduleId: number;
  pgmRvwId: number;
  emailTemplateId: number;
  scheduleDaysOffsetFromDueDate: number;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  emailTemplate?: EmailTemplate;
  pgmRvw?: PgmRvwInfo;
  rvwTypeCompliancePlanSubmissionReminderAddress: RvwTypeCompliancePlanSubmissionReminderAddress[];
}
