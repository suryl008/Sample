import { CitFindArc } from "src/app/pages/program-administration/models/cit-find-arc.model";
export interface CfaXref {
  cfaXrefId: number;
  cfXrefId: number;
  arcId: number;
  seqNo?: number;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  previousCfaXrefId?: number;
  arc: CitFindArc;
}
