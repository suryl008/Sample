import { FindingRuleCriterion } from "./finding-rule-criterion.model";
import { FlexFormPdftemplateField } from "./flex-form-pdf-template-field.model";
export interface FlexFormPdftemplate {
  flexFormPdftemplateId: number;
  name: string;
  pdffileName: string;
  offCd?: string;
  grantPgmId?: number;
  rvwType?: string;
  createdBy: number;
  createdDate: string;
  modifiedBy?: number;
  modifyDate?: string;
  originalFlexFormPdftemplateId?: number;
  version: number;
  published: boolean;
  sourcePdffileName?: string;
  formDescription?: string;
  formCode?: string;
  pdfstream?: number;
  active?: boolean;
  formType: string;
  findingRuleCriterionFlexFormPdftemplates?: FindingRuleCriterion[];
  flexFormPdftemplateFields?: FlexFormPdftemplateField[];
}
