import { UserInfo } from "./user-info.model";
import { PgmInfo } from "./pgm-info.model";

export interface PgmPerm {
  permId: number;
  recType: string;
  grantPgmId: number;
  agencyId: number;
  subRvwId: number;
  userId: number;
  permCd: string;
  catAppl: string;
  contactInd: string;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  recStat: string;
  consolidatedRvwPermCd?: string;
  // rvwType?: string;
  // grantPgm: PgmInfo;
  // user: UserInfo;
}
