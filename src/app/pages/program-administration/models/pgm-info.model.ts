import { EmailTemplate } from "./email-template.model";
import { PgmPerm } from "./pgm-perm.model";
import { PgmRvwInfo } from "./pgm-rvw-info.model";
import { UserAccessPgmInfo } from "./user-access-pgm-info.model";

export interface PgmInfo {
  grantPgmId: number;
  grantPgm: string;
  roundNo: number;
  grantPgmDesc: string;
  offCd: string;
  rvwStart: number;
  regAppl: string;
  consAppl: string;
  raSrc: string;
  pgmSrc: string;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  recStat?: string;
  pcRel?: string;
  cfdaNo?: string;
  subCdNm?: string;
  subPNm?: string;
  subCNm?: string;
  findRptNm?: string;
  compPlanNm?: string;
  compEviNm?: string;
  confirmEmailReq?: string;
  sendEmailConfirm?: string;
  consolidatedReviewEnabled?: string;
  consolidatedReviewTypeName?: string;
  consolidatedReviewName?: string;
  consolidatedReviewAutoAddReviewLead?: string;
  grantPgmType?: string;
  createReviewEnabled?: string;
  // pgmRvwInfos?: PgmRvwInfo[];
  pgmPerms?: PgmPerm[];
  userAccessPgmInfos?: UserAccessPgmInfo[];
  // emailTemplates?: EmailTemplate[];
}
