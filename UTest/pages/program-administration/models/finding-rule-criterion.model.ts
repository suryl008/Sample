export interface FindingRuleCriterion {
  findingRuleCriteriaId: number;
  findingRuleId: number;
  ordinal?: number;
  groupId?: number;
  andOr?: string;
  flexFormPdftemplateId?: number;
  flexFormPdftemplateFieldId?: number;
  operator?: string;
  valueType?: string;
  valueText?: string;
  flexFormPdftemplateIdValue?: number;
  flexFormPdftemplateFieldIdValue?: number;
  createDt?: Date;
  createId?: number;
  lastUpdDt?: Date;
  lastUpdId?: number;
  questionnaireId?: number;
  questionnaireFieldId?: number;
  questionnaireIdValue?: number;
  questionnaireFieldIdValue?: number;
  sourceType?: string;
}
