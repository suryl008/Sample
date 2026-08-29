import { FindingRuleCriterion } from "./finding-rule-criterion.model";

export interface FindingRule {
  findingRuleId: number;
  name?: string;
  grantPgmId: number;
  rvwType?: string;
  cfXrefId: number;
  cfaXrefId: number;
  createDt?: Date;
  lastUpdDt?: Date;
  lastUpdId: number;
  recStat?: string;
  findingRuleCriteria?: FindingRuleCriterion[];
}
