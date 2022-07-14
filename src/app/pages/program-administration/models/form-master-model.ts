export interface FormMaster {
  formMasterId: number;
  formName: string;
  approvedFlag: boolean;
  activeFlag: boolean;
  url?: string;
  headerContent?: string;
  noOfSections?: number;
  createdDate?: string;
  createdBy?: number;
  formHeader?: string;
  isEditable?: boolean;
  programCode?: string;
  formCode?: string;
  isPublish?: boolean;
  helpText?: string;
  formDescription?: string;
}
