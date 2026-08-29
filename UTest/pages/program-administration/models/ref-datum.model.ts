export interface RefDatum {
  refType: string;
  refSubType: string;
  refCode: string;
  refDesc: string;
  refAddlInfo?: string;
  valReqd: string;
  dataType: string;
  dataTypeRule?: string;
  lenVal: string;
  minLen: number;
  maxLen: number;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  recStat: string;
}
