import { Guid } from "guid-typescript";
export interface AdminUserLog {
  id: Guid;
  userId: number;
  recStat: string;
  userName?: string;
  fName?: string;
  lName?: string;
  fullName?: string;
  userRole?: string;
  roleMenuMappings?: any[];
  isRegisteredUser?: boolean;
  createDt?: string;
  lastUpdDt?: string;
}
