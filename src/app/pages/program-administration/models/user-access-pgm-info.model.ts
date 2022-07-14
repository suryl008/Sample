import { PgmInfo } from "./pgm-info.model";

export interface UserAccessPgmInfo {
  userAccessPgmId: number;
  grantPgmId: number;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  recStat: string;
  comments?: string;
 
}
