import { RvwDocSubmissionReminderAddress } from "./rvw-doc-submission-reminder-address.model";

export interface RvwDocSubmissionReminderSchedule {
  rvwDocSubmissionReminderScheduleId: number;
  docListId: number;
  emailTemplateId: number;
  scheduleDaysOffsetFromDueDate: number;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  createBy?: string;
  lastUpdBy?: string;
  templateName?: string;
  rvwDocSubmissionReminderAddresses: RvwDocSubmissionReminderAddress[];
}
