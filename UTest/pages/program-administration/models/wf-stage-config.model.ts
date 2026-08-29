export interface WfStageConfig {
  stageId: number;
  wfCd: string;
  rvwStage: string;
  stageSeq?: number;
  stageAppl: string;
  chkComplDt: string;
  remindDays?: number;
  autoPromote?: string;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  recStat?: string;
  description?: string;
}
