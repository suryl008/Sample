export interface ColumnConfig {
  id: string;
  name: string;
  type?: string;
  visible?: boolean;
}

export interface FieldLabel {
  rvw_type_desc: string;
  sub_rec_name: string;
  rvw_yr: string;
  rvw_ref_no: string;
  [key: string]: string;
}

export type SearchFieldId =
  | "district"
  | "reviewType"
  | "reviewTypeAgency"
  | "charteringAgency"
  | "psa"
  | "falseElDistrict"
  | "elUic";

export type SearchRunAction = "none" | "auto" | "charteringAgency" | "searchResult" | "falseEl";

export interface SearchFormConfig {
  kind: "none" | "standard";
  action: SearchRunAction;
  fields: SearchFieldId[];
  requiredFields: SearchFieldId[];
  showAddSubRecipient: boolean;
  linkField?: string;
}

const DISTRICT_SEARCH: SearchFormConfig = {
  kind: "standard",
  action: "charteringAgency",
  fields: ["district"],
  requiredFields: ["district"],
  showAddSubRecipient: true,
  linkField: "sub_rec_name",
};

const DISTRICT_AND_TYPE_SEARCH: SearchFormConfig = {
  kind: "standard",
  action: "charteringAgency",
  fields: ["district", "reviewType"],
  requiredFields: ["district", "reviewType"],
  showAddSubRecipient: true,
  linkField: "sub_rec_name",
};

const TYPE_AND_AGENCY_SEARCH: SearchFormConfig = {
  kind: "standard",
  action: "searchResult",
  fields: ["reviewType", "reviewTypeAgency"],
  requiredFields: ["reviewType", "reviewTypeAgency"],
  showAddSubRecipient: true,
  linkField: "sub_rec_name",
};

const PSA_SEARCH: SearchFormConfig = {
  kind: "standard",
  action: "charteringAgency",
  fields: ["charteringAgency", "psa"],
  requiredFields: ["charteringAgency", "psa"],
  showAddSubRecipient: true,
  linkField: "sub_rec_name",
};

const FALSE_EL_SEARCH: SearchFormConfig = {
  kind: "standard",
  action: "falseEl",
  fields: ["falseElDistrict", "elUic"],
  requiredFields: ["falseElDistrict"],
  showAddSubRecipient: true,
  linkField: "DistrictName",
};

const AUTO_SEARCH: SearchFormConfig = {
  kind: "none",
  action: "auto",
  fields: [],
  requiredFields: [],
  showAddSubRecipient: false,
  linkField: "InvoicePeriod",
};

export interface TabConfiguration {
  title: string;
  id: string;
  columns: Array<{
    fieldName: string;
    headerName: string;
    visible: boolean;
    type: string;
  }>;
  searchForm: SearchFormConfig;
  searchObj: any;
  tblActionTitle?: string;
  dropdownPlaceholder: string;
  dropdown1Placeholder?: string;
  dropdown2Placeholder?: string;
  detailsTitle?: string;
  notificationColumns?: ColumnConfig[];
  mdeColumns?: ColumnConfig[];
  documentColumns?: ColumnConfig[];
  docSubmissionColumns?: ColumnConfig[];
  mdeSectionTitle?: string;
  notificationSectionTitle?: string;
  documentsSectionTitle?: string;
  datesSectionTitle?: string;
  submissionSectionTitle?: string;
  buttonsSectionTitle?: string;
  lateClaimExceptionInfoTitle?: string;
  fieldLabels?: FieldLabel;
  reviewType?: string;
  grantPgmId?: number;
  endpoints?: {
    notificationInfo?: string;
    mdeReviewTeam?: string;
    schedDocs?: string;
    reviewStatus?: string;
    reviewDocs?: string;
    reviewTeam?: string;
    stageHistory?: string;
  };
}

type SearchColumn = TabConfiguration["columns"][number];

const STANDARD_REVIEW_COLUMNS: SearchColumn[] = [
  { fieldName: "rvw_type_desc", headerName: "Program", visible: true, type: "text" },
  { fieldName: "sub_rec_cd", headerName: "Code", visible: true, type: "text" },
  { fieldName: "sub_rec_name", headerName: "Parent", visible: true, type: "text" },
  { fieldName: "rvw_ref_no", headerName: "Review Number", visible: true, type: "text" },
  { fieldName: "rvw_yr", headerName: "Review Year", visible: true, type: "text" },
];

const DEFAULT_FIELD_LABELS: FieldLabel = {
  rvw_type_desc: "Review Type",
  sub_rec_name: "District",
  rvw_yr: "Review Year",
  rvw_ref_no: "Review Ref. No",
};

const DEFAULT_NOTIFICATION_COLUMNS: ColumnConfig[] = [
  { id: "role_id", name: "Contact Type", type: "select" },
  { id: "user_id", name: "Contact Name", type: "select" },
  { id: "role_email", name: "Email", type: "text" },
  { id: "pri_ind", name: "Primary", type: "checkbox" },
  { id: "chk_ind", name: "Selected", type: "checkbox" },
];

const DEFAULT_MDE_COLUMNS: ColumnConfig[] = [
  { id: "role_id", name: "Review Role", type: "select" },
  { id: "user_id", name: "Reviewer Name", type: "select" },
  { id: "chk_ind", name: "Selected", type: "checkbox" },
];

const DEFAULT_DOCUMENT_COLUMNS: ColumnConfig[] = [
  { id: "sub_desc", name: "Submission Category", type: "text" },
  { id: "rec_desc", name: "Document Type", type: "text" },
  { id: "doc_name", name: "Document Name", type: "text" },
  { id: "doc_cat_desc", name: "Document Category", type: "text" },
  { id: "chk_ind", name: "Select", type: "checkbox" },
  { id: "previewForm", name: "Preview Form", type: "icon" },
];

const DEFAULT_DOC_SUBMISSION_COLUMNS: ColumnConfig[] = [
  { id: "rec_desc", name: "Document Type", type: "text" },
  { id: "doc_name", name: "Document Name", type: "text" },
  { id: "doc_cat_desc", name: "Document Category", type: "text" },
  { id: "help_txt", name: "Instructions", type: "text" },
  { id: "doc_completed", name: "Status", type: "checkbox" },
];

function standardReviewColumns(): SearchColumn[] {
  return STANDARD_REVIEW_COLUMNS.map((column) => ({ ...column }));
}

function fieldLabels(overrides: Partial<FieldLabel> = {}): FieldLabel {
  return { ...DEFAULT_FIELD_LABELS, ...overrides };
}

function searchObj(
  grantPgm: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    grantPgm,
    agencyId: 0,
    charteringAgency: null,
    rvwType: "",
    wfCd: "",
    PSA: "",
    rvwYear: null,
    ...extra,
  };
}

export const TAB_CONFIGURATIONS: Record<string, TabConfiguration> = {
  excessfundbal: {
    id: "excessfundbal",
    title: "Excess Fund Balance",
    detailsTitle: "Excess Fund Balance Review Details",
    columns: [
      { fieldName: "sub_rec_name", headerName: "District", visible: true, type: "text" },
      { fieldName: "ExcessFundBalance", headerName: "Excess Fund Balance", visible: true, type: "text" },
      { fieldName: "sub_rec_cd", headerName: "Sub-Recipient Code", visible: true, type: "text" },
      { fieldName: "LastActivity", headerName: "Date of Last Activity", visible: true, type: "datetime" },
      { fieldName: "rvw_stage_desc", headerName: "Review Stage Description", visible: true, type: "text" },
      { fieldName: "AssignedTo", headerName: "Assigned To", visible: true, type: "text" },
      { fieldName: "rvw_yr", headerName: "Review Year", visible: true, type: "text" },
    ],
    searchForm: DISTRICT_SEARCH,
    searchObj: searchObj("EFB19"),
    dropdownPlaceholder: "Please Select District",
    reviewType: "DRT",
    fieldLabels: fieldLabels(),
  },

  ltclaimexcep: {
    id: "ltclaimexcep",
    title: "LT Claim Exception",
    detailsTitle: "LT Claim Exception Review Details",
    lateClaimExceptionInfoTitle: "Late Claim Exception Info",
    columns: [
      { fieldName: "rvw_type_desc", headerName: "Program", visible: true, type: "text" },
      { fieldName: "sub_rec_cd", headerName: "Sub-Recipient Code", visible: true, type: "text" },
      { fieldName: "ClaimMonth", headerName: "Claim Date", visible: true, type: "text" },
      { fieldName: "LastActivity", headerName: "Last Activity", visible: true, type: "datetime" },
      { fieldName: "rvw_stage_desc", headerName: "Review Stage Description", visible: true, type: "text" },
      { fieldName: "AssignedTo", headerName: "Assigned To", visible: true, type: "text" },
      { fieldName: "rvw_yr", headerName: "Review Year", visible: true, type: "text" },
    ],
    searchForm: DISTRICT_AND_TYPE_SEARCH,
    searchObj: searchObj("LCEP", { exceptionType: "" }),
    dropdownPlaceholder: "Please Select District",
    dropdown2Placeholder: "Please Select Program",
    fieldLabels: fieldLabels(),
  },

  contrpage: {
    id: "contrpage",
    title: "Contracts Page (Rebid)",
    detailsTitle: "Contract Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: searchObj("CRP", { contractId: null }),
    dropdownPlaceholder: "Type of Contract",
    dropdown2Placeholder: "Parent",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Type of Contract",
      sub_rec_name: "Parent",
    }),
  },

  "10cent": {
    id: "10cent",
    title: "10 Cent Program GANS",
    detailsTitle: "10 Cent Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: searchObj("SY21CNP10"),
    dropdownPlaceholder: "Please Select Application",
    dropdown2Placeholder: "Please Select Parent",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Application",
      sub_rec_name: "Parent",
    }),
  },

  cnpcontr: {
    id: "cnpcontr",
    title: "CNP Contracts",
    detailsTitle: "CNP Contract Review Details",
    columns: standardReviewColumns(),
    searchForm: DISTRICT_AND_TYPE_SEARCH,
    searchObj: searchObj("FSCR"),
    dropdownPlaceholder: "Please Select Contract Review",
    dropdown2Placeholder: "Please Select SFA",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Contract Review",
      sub_rec_name: "SFA",
    }),
  },

  clswallinv: {
    id: "clswallinv",
    title: "Class Wallet Invoicing",
    detailsTitle: "Class Wallet Invoicing Review Details",
    columns: [
      { fieldName: "InvoicePeriod", headerName: "Invoice Period", visible: true, type: "text" },
      { fieldName: "LastActivity", headerName: "Date of Last Activity", visible: true, type: "datetime" },
      { fieldName: "rvw_stage_desc", headerName: "Review Stage", visible: true, type: "text" },
      { fieldName: "AssignedTo", headerName: "Assigned To", visible: true, type: "text" },
    ],
    searchForm: AUTO_SEARCH,
    searchObj: searchObj("CWI2122"),
    dropdownPlaceholder: "",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Invoice",
      sub_rec_name: "Parent",
    }),
  },

  psacontrrvw: {
    id: "psacontrrvw",
    title: "PSA Contract Review",
    detailsTitle: "PSA Contract Review Details",
    columns: standardReviewColumns(),
    searchForm: PSA_SEARCH,
    searchObj: searchObj("PSACS", { psaId: null }),
    dropdownPlaceholder: "Please Select Contracts",
    dropdown2Placeholder: "Please Select Parent",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Contracts",
      sub_rec_name: "Parent",
    }),
  },

  sec61a2: {
    id: "sec61a2",
    title: "Section 61a(2) Application",
    detailsTitle: "Section 61a(2) Application Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: searchObj("61a(2)", { exceptionType: "" }),
    dropdownPlaceholder: "Please Select Application",
    dropdown2Placeholder: "Please Select District",
    fieldLabels: fieldLabels({ rvw_type_desc: "Application" }),
  },

  ctenewpgm: {
    id: "ctenewpgm",
    title: "CTE New Program",
    detailsTitle: "CTE New Program Review Details",
    columns: [
      { fieldName: "rvw_yr", headerName: "App Year", visible: true, type: "text" },
      { fieldName: "window", headerName: "Window", visible: true, type: "text" },
      { fieldName: "ProgramType", headerName: "Program Type", visible: true, type: "text" },
      { fieldName: "sub_rec_cd", headerName: "PSN", visible: true, type: "text" },
      { fieldName: "sub_rec_name", headerName: "CIP Code", visible: true, type: "text" },
      { fieldName: "building_name", headerName: "Building Name", visible: true, type: "text" },
      { fieldName: "rvw_ref_no", headerName: "GEMS ID", visible: true, type: "text" },
      { fieldName: "LastActivity", headerName: "Last Activity", visible: true, type: "datetime" },
      { fieldName: "rvw_stage_desc", headerName: "Current Stage", visible: true, type: "text" },
      { fieldName: "AssignedTo", headerName: "Assigned To", visible: true, type: "text" },
    ],
    searchForm: DISTRICT_SEARCH,
    searchObj: searchObj("CTENP"),
    dropdownPlaceholder: "Please Select Type",
    dropdown2Placeholder: "Please Select Applicant",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Type",
      sub_rec_name: "Applicant",
    }),
  },

  emcapp: {
    id: "emcapp",
    title: "EMC Application Scoring",
    detailsTitle: "EMC Application Scoring Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: {
      grantPgm: "CTEEMCA",
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select Planning Grant",
    dropdown2Placeholder: "Please Select Applicant",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Planning Grant",
      sub_rec_name: "Applicant",
    }),
  },

  cteexecel: {
    id: "cteexecel",
    title: "CTE Excellence Award Scoring",
    detailsTitle: "CTE Excellence Award Scoring Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: searchObj("CTEEIPA", { exceptionType: "" }),
    dropdownPlaceholder: "Please Select Type of Award",
    dropdown2Placeholder: "Please Select Applicant",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Type of Award",
      sub_rec_name: "Applicant",
    }),
  },

  psalegacy: {
    id: "psalegacy",
    title: "PSA (Legacy)",
    detailsTitle: "PSA (Legacy) Review Details",
    columns: standardReviewColumns(),
    searchForm: PSA_SEARCH,
    searchObj: searchObj("PSACSLD", { rvwType: "DRT", exceptionType: "", psaId: null }),
    dropdownPlaceholder: "Please Select Contracts",
    dropdown2Placeholder: "Please Select Parent",
    reviewType: "DRT",
    fieldLabels: fieldLabels({ rvw_type_desc: "Review" }),
  },

  emcplan: {
    id: "emcplan",
    title: "EMC Planning Grant Scoring",
    detailsTitle: "EMC Planning Grant Scoring Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: {
      grantPgm: "CTEEMCP",
      agencyId: 0,
      charteringAgency: null,
      rvwType: "DRT",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select Planning Grant",
    dropdown2Placeholder: "Please Select Applicant",
    reviewType: "DRT",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Planning Grant",
      sub_rec_name: "Applicant",
    }),
  },

  egr: {
    id: "egr",
    title: "Equipment Requests",
    detailsTitle: "Equipment and Capital Expenditure Request",
    columns: standardReviewColumns(),
    searchForm: DISTRICT_SEARCH,
    searchObj: {
      grantPgm: "EGR",
      agencyId: 0,
      charteringAgency: null,
      rvwType: "DRT",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "District",
    dropdown1Placeholder: "Review Type",
    dropdown2Placeholder: "Sponsor",
    fieldLabels: fieldLabels({ sub_rec_name: "Sponsor" }),
  },

  greensheet: {
    id: "greensheet",
    title: "Single Audit Process",
    detailsTitle: "Green Sheet Audit Process",
    columns: standardReviewColumns(),
    searchForm: DISTRICT_AND_TYPE_SEARCH,
    searchObj: {
      grantPgm: "GREENSHEET",
      agencyId: 0,
      charteringAgency: null,
      rvwType: "DRT",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "District",
    dropdown1Placeholder: "Review Type",
    dropdown2Placeholder: "Sponsor",
    fieldLabels: fieldLabels({ sub_rec_name: "Sponsor" }),
  },

  "31n6beyondhir": {
    id: "31n6beyondhir",
    title: "31n(6) Beyond Hiring",
    detailsTitle: "31n(6) Beyond Hiring Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: searchObj("31n(6)FPB"),
    dropdownPlaceholder: "Please Select Application",
    dropdown1Placeholder: "Please Select Application",
    dropdown2Placeholder: "Please Select Applicant",
    fieldLabels: fieldLabels({
      rvw_type_desc: "Application",
      sub_rec_name: "Applicant",
    }),
  },

  privschconsult: {
    id: "privschconsult",
    title: "Private Sch Consult",
    detailsTitle: "Private Sch Consult Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: {
      grantPgm: "PSC2425",
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select review",
    dropdown2Placeholder: "Please Select District",
    fieldLabels: fieldLabels({ rvw_type_desc: "Review" }),
  },

  falseel: {
    id: "falseel",
    title: "False EL",
    detailsTitle: "False EL Review Details",
    columns: [
      { fieldName: "UICCode", headerName: "UIC", visible: true, type: "text" },
      { fieldName: "DistrictCode", headerName: "District Code", visible: true, type: "text" },
      { fieldName: "DistrictName", headerName: "District Name", visible: true, type: "text" },
      { fieldName: "rvw_ref_no", headerName: "GEMS ID", visible: true, type: "text" },
      { fieldName: "DateSubmitted", headerName: "Date Submitted", visible: true, type: "date" },
      { fieldName: "ReviewStatus", headerName: "Review Status", visible: true, type: "text" },
    ],
    searchForm: FALSE_EL_SEARCH,
    searchObj: searchObj("FD1920", { rvwType: "FEL" }),
    dropdownPlaceholder: "Please Select District",
    tblActionTitle: "Open",
    fieldLabels: fieldLabels(),
  },

  usdadodcompliant: {
    id: "usdadodcompliant",
    title: "USDADOD Compliant",
    detailsTitle: "USDADOD Compliant Review Details",
    columns: standardReviewColumns(),
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: searchObj("FDCOMP", { rvwType: "USD" }),
    dropdownPlaceholder: "Please Select Reviews",
    dropdown2Placeholder: "Please Select Sub-recipient",
    fieldLabels: fieldLabels(),
  },
};

export function getSearchFormConfig(tabId: string): SearchFormConfig {
  return TAB_CONFIGURATIONS[tabId]?.searchForm || TYPE_AND_AGENCY_SEARCH;
}

export function getLinkField(tabId: string): string | null {
  const searchForm = getSearchFormConfig(tabId);
  if (searchForm.linkField) {
    return searchForm.linkField;
  }

  const columns = TAB_CONFIGURATIONS[tabId]?.columns || [];
  const named = columns.find(
    (column) =>
      column.visible &&
      (column.fieldName === "sub_rec_name" || column.fieldName === "DistrictName"),
  );
  return named?.fieldName || columns.find((column) => column.visible)?.fieldName || null;
}

export function getTabConfig(tabId: string): TabConfiguration {
  const config = TAB_CONFIGURATIONS[tabId] || {
    id: tabId,
    title: tabId,
    detailsTitle: `${tabId} Review Details`,
    columns: [],
    searchForm: TYPE_AND_AGENCY_SEARCH,
    searchObj: {},
    dropdownPlaceholder: "Please Select",
    dropdown1Placeholder: "Please Select",
    dropdown2Placeholder: "Please Select",
    tblActionTitle: "Select Review",
    reviewType: tabId.toUpperCase().substring(0, 3),
  };

  return {
    ...config,
    notificationColumns: config.notificationColumns || DEFAULT_NOTIFICATION_COLUMNS,
    mdeColumns: config.mdeColumns || DEFAULT_MDE_COLUMNS,
    documentColumns: config.documentColumns || DEFAULT_DOCUMENT_COLUMNS,
    docSubmissionColumns: config.docSubmissionColumns || DEFAULT_DOC_SUBMISSION_COLUMNS,
    mdeSectionTitle: config.mdeSectionTitle || "MDE Contacts",
    notificationSectionTitle: config.notificationSectionTitle || "Sub-Recipient Contacts",
    documentsSectionTitle: config.documentsSectionTitle || "Schedule Documents",
    datesSectionTitle: config.datesSectionTitle || "Schedule Dates",
    submissionSectionTitle: config.submissionSectionTitle || "Submission",
    buttonsSectionTitle: config.buttonsSectionTitle || "Review Buttons",
    fieldLabels: config.fieldLabels || DEFAULT_FIELD_LABELS,
  };
}

export type TabId = keyof typeof TAB_CONFIGURATIONS;

export interface TabConfig {
  id: TabId;
  label: string;
  disabled?: boolean;
}

export const TAB_LIST: TabConfig[] = Object.values(TAB_CONFIGURATIONS).map((config) => ({
  id: config.id as TabId,
  label: config.title,
}));

export function getConfiguredGrantPgms(): string[] {
  const codes = new Set<string>();
  for (const config of Object.values(TAB_CONFIGURATIONS)) {
    const grantPgm = config.searchObj?.grantPgm;
    if (typeof grantPgm === "string" && grantPgm.trim()) {
      codes.add(grantPgm.trim());
    }
  }
  return Array.from(codes);
}

export function getFieldLabel(tabId: TabId, fieldName: string): string {
  const config = TAB_CONFIGURATIONS[tabId];
  return config?.fieldLabels?.[fieldName] || fieldName;
}

export function getSectionTitle(tabId: TabId, section: string): string {
  const config = getTabConfig(tabId);
  const sectionTitles: Record<string, string> = {
    mde: config.mdeSectionTitle || "MDE Contacts",
    notification: config.notificationSectionTitle || "Sub-Recipient Contacts",
    documents: config.documentsSectionTitle || "Schedule Documents",
    dates: config.datesSectionTitle || "Schedule Dates",
    submission: config.submissionSectionTitle || "Submission",
    buttons: config.buttonsSectionTitle || "Review Buttons",
  };
  return sectionTitles[section] || section;
}
