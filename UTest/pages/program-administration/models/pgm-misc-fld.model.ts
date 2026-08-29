export interface PgmMiscFld {
  pgmMiscFldsId: number;
  grantPgmId: number;
  rvwType: string;
  fieldName: string;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  mergeFld?: string;
  sortOrder?: number;
}
