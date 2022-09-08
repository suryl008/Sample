export interface CitFindArc {
  cfaRefId: number;
  recType: string;
  grantPgmId: number;
  cfaCd: string;
  cfaSeq: number;
  cfaShortDesc?: string;
  cfaDesc?: string;
  cfaCat?: string;
  editAppl?: string;
  arcAppl?: string;
  createDt?: Date;
  createId: number;
  lastUpdDt: Date;
  lastUpdId: number;
  origCit?: string;
  previousCfaRefId: number;
  citationCategory?: string;
}
