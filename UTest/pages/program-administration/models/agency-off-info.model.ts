export interface AgencyOffInfo {
  agencyId: number;
  offCd: string;
  offName: string;
  calOr?: string;
  offContact?: string;
  contactDsg?: string;
  offAddSame?: string;
  addLine1?: string;
  addLine2?: string;
  city?: string;
  stateCode?: string;
  zip1?: string;
  zip2?: string;
  createDt?: string;
  createId?: number;
  lastUpdDt?: string;
  lastUpdId?: number;
  allowElectronicApprovals?: string;
  gemsTeamAssignedName?: string;
  gemsTeamAssignedEmail?: string;
}
