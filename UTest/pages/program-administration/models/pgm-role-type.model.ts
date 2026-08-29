import { PgmRoleRule } from "./pgm-role-rule.model";

export interface PgmRoleType {
  roleId: number;
  grantPgmId: number;
  rvwStage: string;
  roleCls: string;
  roleInd: string;
  roleType: string;
  roleReqd?: string;
  roleRule?: string;
  minNos?: number;
  maxNos?: number;
  dataSrc?: string;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  rvwType: string;
  roleTypeDescription?: string;
  chkInd?: boolean;
  pgmRoleRules: PgmRoleRule[];
}
