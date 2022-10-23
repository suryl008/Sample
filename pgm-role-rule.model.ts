import { PgmRoleType } from "./pgm-role-type.model";
export interface PgmRoleRule {
  roleId: number;
  roleType: string;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  role: PgmRoleType;
}
