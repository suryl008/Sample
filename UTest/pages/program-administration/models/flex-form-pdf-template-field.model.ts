export interface FlexFormPdftemplateField {
  flexFormPdftemplateFieldId: number;
  flexFormPdftemplateId: number;
  name: string;
  description?: string;
  defaultValue?: string;
  ordinal: number;
  readOnly?: boolean;
  numericOnly?: boolean;
  alphaOnly?: boolean;
  characterLimit?: number;
  createdBy: number;
  createDate: Date;
  modifiedBy?: number;
  modifyDate?: Date;
  fieldRequired?: boolean;
  fieldType: string;
  tabName?: string;
  cell?: string;
  copiedFromFlexFormPdftemplateFieldId?: number;
}
