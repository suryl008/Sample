export interface EmailTemplate {
  emailTemplateId: number;
  offCd: string;
  grantPgmId: number;
  templateName?: string;
  templateSubject?: string;
  templateBody?: string;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  rvwType?: string;
  autoAttach: string;
  status: string;
}
