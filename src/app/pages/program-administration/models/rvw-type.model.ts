import { PgmRvwInfo } from "./pgm-rvw-info.model";

export interface RvwType {
  rvwType1: string;
  rvwDesc: string;
  rvwScope: string;
  rvwCls: string;
  wfAppl: string;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  recStat: string;
  pgmRvwInfos: PgmRvwInfo[];
}
