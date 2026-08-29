import { CitFindArc } from "src/app/pages/program-administration/models/cit-find-arc.model";
import { CfaXref } from "./cfa-xref.model";
export interface CfXref {
  cfXrefId: number;
  grantPgmId: number;
  citId: number;
  findId: number;
  seqNo?: number;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  rvwType: string;
  pcInd?: string;
  previousCfXrefId?: number;
  cfaXrefs: CfaXref[];
  cit: CitFindArc;
  find: CitFindArc;
}
