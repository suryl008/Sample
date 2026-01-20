// consolidated-review-tab-config.ts
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

export interface TabConfiguration {
  // Core properties
  title: string;
  id: string;

  // Search/List page properties
  apiEndpoint: string;
  chartAgencyEndpoint: string;
  columns: Array<{
    fieldName: string;
    headerName: string;
    visible: boolean;
    type: string;
  }>;
  searchObj: any;
  dropdownPlaceholder: string;

  // Details page properties
  detailsTitle?: string;

  // Column configurations for details page
  notificationColumns?: ColumnConfig[];
  mdeColumns?: ColumnConfig[];
  documentColumns?: ColumnConfig[];
  docSubmissionColumns?: ColumnConfig[];

  // Section titles
  mdeSectionTitle?: string;
  notificationSectionTitle?: string;
  documentsSectionTitle?: string;
  datesSectionTitle?: string;
  submissionSectionTitle?: string;
  buttonsSectionTitle?: string;

  // Field labels for details page
  fieldLabels?: FieldLabel;

  // API endpoints for details page
  endpoints?: {
    notificationInfo?: string;
    mdeReviewTeam?: string;
    schedDocs?: string;
    reviewStatus?: string;
    reviewDocs?: string;
    reviewTeam?: string;
    stageHistory?: string;
  };

  // Review type specific properties
  reviewType?: string;
  grantPgmId?: number;
}

export const TAB_CONFIGURATIONS: Record<string, TabConfiguration> = {
  excessfundbal: {
    id: "excessfundbal",
    title: "Excess Fund Balance",
    detailsTitle: "Excess Fund Balance Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/FundBalConsolLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/ConsolRvwChartAgency.json",
    columns: [
      {
        fieldName: "sub_rec_name",
        headerName: "District",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ExcessFundBalance",
        headerName: "Excess Fund Balance",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Sub-Recipient Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Date of Last Activity",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_yr",
        headerName: "Review Year",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 570,
      charteringAgency: null,
      rvwType: "DRT",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "DRT",
    grantPgmId: 570,

    // Column configurations for details page
    notificationColumns: [
      { id: "role_id", name: "Contact Type", type: "select" },
      { id: "user_id", name: "Contact Name", type: "select" },
      { id: "role_email", name: "Email", type: "text" },
      { id: "pri_ind", name: "Primary", type: "checkbox" },
      { id: "chk_ind", name: "Selected", type: "checkbox" },
    ],

    mdeColumns: [
      { id: "role_id", name: "Review Role", type: "select" },
      { id: "user_id", name: "Reviewer Name", type: "select" },
      { id: "chk_ind", name: "Selected", type: "checkbox" },
    ],

    documentColumns: [
      { id: "sub_desc", name: "Submission Category", type: "text" },
      { id: "rec_desc", name: "Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "chk_ind", name: "Select", type: "checkbox" },
      { id: "previewForm", name: "Preview Form", type: "icon" },
    ],

    docSubmissionColumns: [
      { id: "rec_desc", name: "Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "help_txt", name: "Instructions", type: "text" },
      { id: "doc_completed", name: "Status", type: "checkbox" },
    ],

    // Section titles
    mdeSectionTitle: "MDE Contacts",
    notificationSectionTitle: "Sub-Recipient Contacts",
    documentsSectionTitle: "Schedule Documents",
    datesSectionTitle: "Schedule Dates",
    submissionSectionTitle: "Submission",
    buttonsSectionTitle: "Review Buttons",

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Excess Fund Balance Review Type",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },

    // API endpoints for details
    endpoints: {
      notificationInfo:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo.json",
      mdeReviewTeam:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo.json",
      schedDocs:
        "assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo.json",
      reviewStatus:
        "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus.json",
      reviewDocs: "assets/api-data/ConsolidatedReview/GetConsRvwDocInfo.json",
      reviewTeam: "assets/api-data/ConsolidatedReview/GetConsReviewTeam.json",
      stageHistory:
        "assets/api-data/ConsolidatedReview/GetConsReviewStageHistory.json",
    },
  },

  ltclaimexcep: {
    id: "ltclaimexcep",
    title: "LT Claim Exception",
    detailsTitle: "LT Claim Exception Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/LTClaimLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/LTClaimChartAgency.json",
    columns: [
      {
        fieldName: "sub_rec_name",
        headerName: "District",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ClaimAmount",
        headerName: "Claim Amount",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Sub-Recipient Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Date of Last Activity",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ExceptionType",
        headerName: "Exception Type",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 571,
      charteringAgency: null,
      rvwType: "LTC",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "LTC",
    grantPgmId: 571,

    // Column configurations for details page
    notificationColumns: [
      { id: "role_id", name: "Claim Contact Type", type: "select" },
      { id: "user_id", name: "Claim Contact Name", type: "select" },
      { id: "role_email", name: "Email", type: "text" },
      { id: "pri_ind", name: "Primary Contact", type: "checkbox" },
      { id: "chk_ind", name: "Notification", type: "checkbox" },
    ],

    mdeColumns: [
      { id: "role_id", name: "Claim Reviewer Role", type: "select" },
      { id: "user_id", name: "Claim Reviewer", type: "select" },
      { id: "chk_ind", name: "Active", type: "checkbox" },
    ],

    documentColumns: [
      { id: "sub_desc", name: "Claim Category", type: "text" },
      { id: "rec_desc", name: "Claim Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "chk_ind", name: "Select", type: "checkbox" },
      { id: "previewForm", name: "Preview Form", type: "icon" },
    ],

    docSubmissionColumns: [
      { id: "rec_desc", name: "Claim Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "help_txt", name: "Instructions", type: "text" },
      { id: "doc_completed", name: "Completed", type: "checkbox" },
    ],

    // Section titles
    mdeSectionTitle: "LT Claim Review Team",
    notificationSectionTitle: "District Contacts",
    documentsSectionTitle: "Claim Documents",
    datesSectionTitle: "Claim Schedule Dates",
    submissionSectionTitle: "Claim Submission",
    buttonsSectionTitle: "Claim Review Buttons",

    // Field labels
    fieldLabels: {
      rvw_type_desc: "LT Claim Exception Type",
      sub_rec_name: "Claim District",
      rvw_yr: "Claim Year",
      rvw_ref_no: "Claim Ref. No",
    },

    // API endpoints for details
    endpoints: {
      notificationInfo:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-LTC.json",
      mdeReviewTeam:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-LTC-MDE.json",
      schedDocs:
        "assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo-LTC.json",
      reviewStatus:
        "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus-LTC.json",
      reviewDocs:
        "assets/api-data/ConsolidatedReview/GetConsRvwDocInfo-LTC.json",
      reviewTeam:
        "assets/api-data/ConsolidatedReview/GetConsReviewTeam-LTC.json",
      stageHistory:
        "assets/api-data/ConsolidatedReview/GetConsReviewStageHistory-LTC.json",
    },
  },

  contrpage: {
    id: "contrpage",
    title: "Contract Page",
    detailsTitle: "Contract Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/ContractLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/ContractChartAgency.json",
    columns: [
      {
        fieldName: "contract_name",
        headerName: "Contract Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "contract_number",
        headerName: "Contract Number",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ContractValue",
        headerName: "Contract Value",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "ContractDate",
        headerName: "Contract Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ContractType",
        headerName: "Contract Type",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 572,
      charteringAgency: null,
      rvwType: "CON",
      PSA: "",
      rvwYear: null,
      contractId: null,
    },
    dropdownPlaceholder: "Please Select Contract",

    // Details page properties
    reviewType: "CON",
    grantPgmId: 572,

    // Column configurations for details page
    notificationColumns: [
      { id: "role_id", name: "Contract Contact Type", type: "select" },
      { id: "user_id", name: "Contract Contact", type: "select" },
      { id: "role_email", name: "Email", type: "text" },
      { id: "pri_ind", name: "Primary Contact", type: "checkbox" },
      { id: "chk_ind", name: "Notification", type: "checkbox" },
    ],

    mdeColumns: [
      { id: "role_id", name: "Contract Reviewer Role", type: "select" },
      { id: "user_id", name: "Contract Reviewer", type: "select" },
      { id: "chk_ind", name: "Active", type: "checkbox" },
    ],

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Contract Review Type",
      sub_rec_name: "Contract Entity",
      rvw_yr: "Contract Year",
      rvw_ref_no: "Contract Ref. No",
    },
  },

  "10cent": {
    id: "10cent",
    title: "10 Cent",
    detailsTitle: "10 Cent Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/TenCentLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/TenCentChartAgency.json",
    columns: [
      {
        fieldName: "program_name",
        headerName: "Program Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "program_code",
        headerName: "Program Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "Amount",
        headerName: "10 Cent Amount",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "LastActivity",
        headerName: "Date of Last Activity",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "Status",
        headerName: "Status",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 573,
      charteringAgency: null,
      rvwType: "10C",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "10C",
    grantPgmId: 573,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "10 Cent Review Type",
      sub_rec_name: "Program",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  cnpcontr: {
    id: "cnpcontr",
    title: "CNP Contract",
    detailsTitle: "CNP Contract Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/CNPContractLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/CNPContractChartAgency.json",
    columns: [
      {
        fieldName: "contract_name",
        headerName: "Contract Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "cnp_number",
        headerName: "CNP Number",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ContractValue",
        headerName: "Contract Value",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "StartDate",
        headerName: "Start Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "EndDate",
        headerName: "End Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ContractStatus",
        headerName: "Contract Status",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 574,
      charteringAgency: null,
      rvwType: "CNP",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select Contract",

    // Details page properties
    reviewType: "CNP",
    grantPgmId: 574,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "CNP Contract Review Type",
      sub_rec_name: "CNP Contract",
      rvw_yr: "Contract Year",
      rvw_ref_no: "CNP Ref. No",
    },
  },

  clswallinv: {
    id: "clswallinv",
    title: "Closed Wall Invest",
    detailsTitle: "Closed Wall Investment Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/ClosedWallLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/ClosedWallChartAgency.json",
    columns: [
      {
        fieldName: "investment_name",
        headerName: "Investment Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "investment_id",
        headerName: "Investment ID",
        visible: true,
        type: "text",
      },
      {
        fieldName: "InvestmentAmount",
        headerName: "Investment Amount",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "CloseDate",
        headerName: "Close Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "WallType",
        headerName: "Wall Type",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 575,
      charteringAgency: null,
      rvwType: "CWI",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select Investment",

    // Details page properties
    reviewType: "CWI",
    grantPgmId: 575,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Closed Wall Review Type",
      sub_rec_name: "Investment",
      rvw_yr: "Review Year",
      rvw_ref_no: "Investment Ref. No",
    },
  },

  psacontrrvw: {
    id: "psacontrrvw",
    title: "PSA Contract",
    detailsTitle: "PSA Contract Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/PSAContractLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/PSAContractChartAgency.json",
    columns: [
      {
        fieldName: "psa_name",
        headerName: "PSA Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "psa_number",
        headerName: "PSA Number",
        visible: true,
        type: "text",
      },
      {
        fieldName: "PSAValue",
        headerName: "PSA Value",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "StartDate",
        headerName: "Start Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "EndDate",
        headerName: "End Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "PSAStatus",
        headerName: "PSA Status",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 576,
      charteringAgency: null,
      rvwType: "PSA",
      PSA: "",
      rvwYear: null,
      psaId: null,
    },
    dropdownPlaceholder: "Please Select PSA",

    // Details page properties
    reviewType: "PSA",
    grantPgmId: 576,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "PSA Review Type",
      sub_rec_name: "PSA",
      rvw_yr: "PSA Year",
      rvw_ref_no: "PSA Ref. No",
    },
  },

  "31n6beyondhir": {
    id: "31n6beyondhir",
    title: "31N6 Beyond HIR",
    detailsTitle: "31N6 Beyond HIR Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/ThirtyOneN6Lookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/ThirtyOneN6ChartAgency.json",
    columns: [
      {
        fieldName: "program_name",
        headerName: "Program Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "program_code",
        headerName: "Program Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "HIR_Amount",
        headerName: "HIR Amount",
        visible: true,
        type: "currency",
      },
      {
        fieldName: "BeyondDate",
        headerName: "Beyond Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "Status",
        headerName: "Status",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 577,
      charteringAgency: null,
      rvwType: "31N",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "31N",
    grantPgmId: 577,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "31N6 Review Type",
      sub_rec_name: "Program",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  privschconsult: {
    id: "privschconsult",
    title: "Private School",
    detailsTitle: "Private School Consultation Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/PrivateSchoolLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/PrivateSchoolChartAgency.json",
    columns: [
      {
        fieldName: "school_name",
        headerName: "School Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "school_code",
        headerName: "School Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ConsultationDate",
        headerName: "Consultation Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "LastActivity",
        headerName: "Date of Last Activity",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ConsultationType",
        headerName: "Consultation Type",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 578,
      charteringAgency: null,
      rvwType: "PSC",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select School",

    // Details page properties
    reviewType: "PSC",
    grantPgmId: 578,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Private School Consultation Type",
      sub_rec_name: "School",
      rvw_yr: "Consultation Year",
      rvw_ref_no: "Consultation Ref. No",
    },
  },

  falseel: {
    id: "falseel",
    title: "False EL",
    detailsTitle: "False EL Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/FalseELLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/FalseELChartAgency.json",
    columns: [
      {
        fieldName: "sub_rec_name",
        headerName: "District",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Sub-Recipient Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "FalseELCount",
        headerName: "False EL Count",
        visible: true,
        type: "number",
      },
      {
        fieldName: "DetectionDate",
        headerName: "Detection Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_yr",
        headerName: "Review Year",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 579,
      charteringAgency: null,
      rvwType: "FEL",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "FEL",
    grantPgmId: 579,

    // Column configurations for details page
    notificationColumns: [
      { id: "role_id", name: "EL Contact Type", type: "select" },
      { id: "user_id", name: "EL Contact Name", type: "select" },
      { id: "role_email", name: "Email", type: "text" },
      { id: "pri_ind", name: "Primary EL Contact", type: "checkbox" },
      { id: "chk_ind", name: "Notification", type: "checkbox" },
    ],

    mdeColumns: [
      { id: "role_id", name: "EL Reviewer Role", type: "select" },
      { id: "user_id", name: "EL Reviewer", type: "select" },
      { id: "chk_ind", name: "Active", type: "checkbox" },
    ],

    documentColumns: [
      { id: "sub_desc", name: "EL Category", type: "text" },
      { id: "rec_desc", name: "EL Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "chk_ind", name: "Select", type: "checkbox" },
      { id: "previewForm", name: "Preview Form", type: "icon" },
    ],

    // Field labels
    fieldLabels: {
      rvw_type_desc: "False EL Review Type",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "EL Review Ref. No",
    },

    // API endpoints for details
    endpoints: {
      notificationInfo:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-FEL.json",
      mdeReviewTeam:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-FEL-MDE.json",
      schedDocs:
        "assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo-FEL.json",
      reviewStatus:
        "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus-FEL.json",
      reviewDocs:
        "assets/api-data/ConsolidatedReview/GetConsRvwDocInfo-FEL.json",
      reviewTeam:
        "assets/api-data/ConsolidatedReview/GetConsReviewTeam-FEL.json",
      stageHistory:
        "assets/api-data/ConsolidatedReview/GetConsReviewStageHistory-FEL.json",
    },
  },

  usdadodcompliant: {
    id: "usdadodcompliant",
    title: "USDADOD Compliant",
    detailsTitle: "USDADOD Compliant Review Details",

    // Search/List page properties
    apiEndpoint: "assets/api-data/ConsolidatedReview/FalseELLookup.json",
    chartAgencyEndpoint:
      "assets/api-data/ConsolidatedReview/FalseELChartAgency.json",
    columns: [
      {
        fieldName: "sub_rec_name",
        headerName: "District",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Sub-Recipient Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "FalseELCount",
        headerName: "False EL Count",
        visible: true,
        type: "number",
      },
      {
        fieldName: "DetectionDate",
        headerName: "Detection Date",
        visible: true,
        type: "date",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage Description",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_yr",
        headerName: "Review Year",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 579,
      charteringAgency: null,
      rvwType: "FEL",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "FEL",
    grantPgmId: 579,

    // Column configurations for details page
    notificationColumns: [
      { id: "role_id", name: "EL Contact Type", type: "select" },
      { id: "user_id", name: "EL Contact Name", type: "select" },
      { id: "role_email", name: "Email", type: "text" },
      { id: "pri_ind", name: "Primary EL Contact", type: "checkbox" },
      { id: "chk_ind", name: "Notification", type: "checkbox" },
    ],

    mdeColumns: [
      { id: "role_id", name: "EL Reviewer Role", type: "select" },
      { id: "user_id", name: "EL Reviewer", type: "select" },
      { id: "chk_ind", name: "Active", type: "checkbox" },
    ],

    documentColumns: [
      { id: "sub_desc", name: "EL Category", type: "text" },
      { id: "rec_desc", name: "EL Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "chk_ind", name: "Select", type: "checkbox" },
      { id: "previewForm", name: "Preview Form", type: "icon" },
    ],

    // Field labels
    fieldLabels: {
      rvw_type_desc: "False EL Review Type",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "EL Review Ref. No",
    },

    // API endpoints for details
    endpoints: {
      notificationInfo:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-FEL.json",
      mdeReviewTeam:
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-FEL-MDE.json",
      schedDocs:
        "assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo-FEL.json",
      reviewStatus:
        "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus-FEL.json",
      reviewDocs:
        "assets/api-data/ConsolidatedReview/GetConsRvwDocInfo-FEL.json",
      reviewTeam:
        "assets/api-data/ConsolidatedReview/GetConsReviewTeam-FEL.json",
      stageHistory:
        "assets/api-data/ConsolidatedReview/GetConsReviewStageHistory-FEL.json",
    },
  },
};

// Helper function to get default configurations for tabs that don't have specific ones
export function getTabConfig(tabId: string): TabConfiguration {
  const config = TAB_CONFIGURATIONS[tabId];
  if (!config) {
    // Return default configuration for unknown tabs
    return {
      id: tabId,
      title: tabId,
      detailsTitle: `${tabId} Review Details`,
      apiEndpoint: "",
      chartAgencyEndpoint: "",
      columns: [],
      searchObj: {},
      dropdownPlaceholder: "Please Select",
      reviewType: tabId.toUpperCase().substring(0, 3),
      grantPgmId: 500,

      // Default column configurations
      notificationColumns: [
        { id: "role_id", name: "Contact Type", type: "select" },
        { id: "user_id", name: "Contact Name", type: "select" },
        { id: "role_email", name: "Email", type: "text" },
        { id: "pri_ind", name: "Primary", type: "checkbox" },
        { id: "chk_ind", name: "Selected", type: "checkbox" },
      ],

      mdeColumns: [
        { id: "role_id", name: "Review Role", type: "select" },
        { id: "user_id", name: "Reviewer Name", type: "select" },
        { id: "chk_ind", name: "Selected", type: "checkbox" },
      ],

      documentColumns: [
        { id: "sub_desc", name: "Submission Category", type: "text" },
        { id: "rec_desc", name: "Document Type", type: "text" },
        { id: "doc_name", name: "Document Name", type: "text" },
        { id: "doc_cat_desc", name: "Document Category", type: "text" },
        { id: "chk_ind", name: "Select", type: "checkbox" },
        { id: "previewForm", name: "Preview Form", type: "icon" },
      ],

      docSubmissionColumns: [
        { id: "rec_desc", name: "Document Type", type: "text" },
        { id: "doc_name", name: "Document Name", type: "text" },
        { id: "doc_cat_desc", name: "Document Category", type: "text" },
        { id: "help_txt", name: "Instructions", type: "text" },
        { id: "doc_completed", name: "Status", type: "checkbox" },
      ],

      // Default section titles
      mdeSectionTitle: "MDE Contacts",
      notificationSectionTitle: "Sub-Recipient Contacts",
      documentsSectionTitle: "Schedule Documents",
      datesSectionTitle: "Schedule Dates",
      submissionSectionTitle: "Submission",
      buttonsSectionTitle: "Review Buttons",

      // Default field labels
      fieldLabels: {
        rvw_type_desc: "Review Type",
        sub_rec_name: "Entity",
        rvw_yr: "Review Year",
        rvw_ref_no: "Review Ref. No",
      },
    };
  }

  // Ensure all required properties exist
  return {
    // Apply defaults for missing properties
    notificationColumns: config.notificationColumns || [
      { id: "role_id", name: "Contact Type", type: "select" },
      { id: "user_id", name: "Contact Name", type: "select" },
      { id: "role_email", name: "Email", type: "text" },
      { id: "pri_ind", name: "Primary", type: "checkbox" },
      { id: "chk_ind", name: "Selected", type: "checkbox" },
    ],

    mdeColumns: config.mdeColumns || [
      { id: "role_id", name: "Review Role", type: "select" },
      { id: "user_id", name: "Reviewer Name", type: "select" },
      { id: "chk_ind", name: "Selected", type: "checkbox" },
    ],

    documentColumns: config.documentColumns || [
      { id: "sub_desc", name: "Submission Category", type: "text" },
      { id: "rec_desc", name: "Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "chk_ind", name: "Select", type: "checkbox" },
      { id: "previewForm", name: "Preview Form", type: "icon" },
    ],

    docSubmissionColumns: config.docSubmissionColumns || [
      { id: "rec_desc", name: "Document Type", type: "text" },
      { id: "doc_name", name: "Document Name", type: "text" },
      { id: "doc_cat_desc", name: "Document Category", type: "text" },
      { id: "help_txt", name: "Instructions", type: "text" },
      { id: "doc_completed", name: "Status", type: "checkbox" },
    ],

    mdeSectionTitle: config.mdeSectionTitle || "MDE Contacts",
    notificationSectionTitle:
      config.notificationSectionTitle || "Sub-Recipient Contacts",
    documentsSectionTitle: config.documentsSectionTitle || "Schedule Documents",
    datesSectionTitle: config.datesSectionTitle || "Schedule Dates",
    submissionSectionTitle: config.submissionSectionTitle || "Submission",
    buttonsSectionTitle: config.buttonsSectionTitle || "Review Buttons",

    fieldLabels: config.fieldLabels || {
      rvw_type_desc: "Review Type",
      sub_rec_name: "Entity",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },

    // Spread the original config last to override defaults
    ...config,
  };
}

export type TabId = keyof typeof TAB_CONFIGURATIONS;

export interface TabConfig {
  id: TabId;
  label: string;
  disabled?: boolean;
}

export const TAB_LIST: TabConfig[] = [
  { id: "excessfundbal", label: "Excess Fund Balance" },
  { id: "ltclaimexcep", label: "LT Claim Exception" },
  { id: "contrpage", label: "Contract Page" },
  { id: "10cent", label: "10 Cent" },
  { id: "cnpcontr", label: "CNP Contract" },
  { id: "clswallinv", label: "Closed Wall Invest" },
  { id: "psacontrrvw", label: "PSA Contract" },
  { id: "31n6beyondhir", label: "31N6 Beyond HIR" },
  { id: "privschconsult", label: "Private School" },
  { id: "falseel", label: "False EL" },
];

// Utility functions
export function getTabTitle(tabId: TabId): string {
  return TAB_CONFIGURATIONS[tabId]?.title || tabId;
}

export function getDetailsTitle(tabId: TabId): string {
  const config = TAB_CONFIGURATIONS[tabId];
  return config?.detailsTitle || `${config?.title || tabId} Review Details`;
}

export function getReviewType(tabId: TabId): string {
  return (
    TAB_CONFIGURATIONS[tabId]?.reviewType || tabId.toUpperCase().substring(0, 3)
  );
}

export function getGrantPgmId(tabId: TabId): number {
  return TAB_CONFIGURATIONS[tabId]?.grantPgmId || 500;
}

export function getFieldLabel(tabId: TabId, fieldName: string): string {
  const config = TAB_CONFIGURATIONS[tabId];
  return config?.fieldLabels?.[fieldName] || fieldName;
}

export function getSectionTitle(tabId: TabId, section: string): string {
  const config = TAB_CONFIGURATIONS[tabId];
  const sectionTitles: Record<string, string> = {
    mde: config?.mdeSectionTitle || "MDE Contacts",
    notification: config?.notificationSectionTitle || "Sub-Recipient Contacts",
    documents: config?.documentsSectionTitle || "Schedule Documents",
    dates: config?.datesSectionTitle || "Schedule Dates",
    submission: config?.submissionSectionTitle || "Submission",
    buttons: config?.buttonsSectionTitle || "Review Buttons",
  };
  return sectionTitles[section] || section;
}

// export const TAB_CONFIGURATIONS = {
//   excessfundbal: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/FundBalConsolLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/ConsolRvwChartAgency.json",
//     columns: [
//       {
//         fieldName: "sub_rec_name",
//         headerName: "District",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ExcessFundBalance",
//         headerName: "Excess Fund Balance",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "sub_rec_cd",
//         headerName: "Sub-Recipient Code",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "LastActivity",
//         headerName: "Date of Last Activity",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "rvw_yr",
//         headerName: "Review Year",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 570,
//       charteringAgency: null,
//       rvwType: "DRT",
//       PSA: "",
//       rvwYear: null,
//     },
//     title: "Excess Fund Balance",
//     dropdownPlaceholder: "Please Select District",
//   },
//   ltclaimexcep: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/LTClaimLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/LTClaimChartAgency.json",
//     columns: [
//       {
//         fieldName: "sub_rec_name",
//         headerName: "District",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ClaimAmount",
//         headerName: "Claim Amount",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "sub_rec_cd",
//         headerName: "Sub-Recipient Code",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "LastActivity",
//         headerName: "Date of Last Activity",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ExceptionType",
//         headerName: "Exception Type",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 571,
//       charteringAgency: null,
//       rvwType: "LTC",
//       PSA: "",
//       rvwYear: null,
//       exceptionType: "",
//     },
//     title: "LT Claim Exception",
//     dropdownPlaceholder: "Please Select District",
//   },
//   contrpage: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/ContractLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/ContractChartAgency.json",
//     columns: [
//       {
//         fieldName: "contract_name",
//         headerName: "Contract Name",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "contract_number",
//         headerName: "Contract Number",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ContractValue",
//         headerName: "Contract Value",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "ContractDate",
//         headerName: "Contract Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ContractType",
//         headerName: "Contract Type",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 572,
//       charteringAgency: null,
//       rvwType: "CON",
//       PSA: "",
//       rvwYear: null,
//       contractId: null,
//     },
//     title: "Contract Page",
//     dropdownPlaceholder: "Please Select Contract",
//   },
//   "10cent": {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/TenCentLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/TenCentChartAgency.json",
//     columns: [
//       {
//         fieldName: "program_name",
//         headerName: "Program Name",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "program_code",
//         headerName: "Program Code",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "Amount",
//         headerName: "10 Cent Amount",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "LastActivity",
//         headerName: "Date of Last Activity",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "Status",
//         headerName: "Status",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 573,
//       charteringAgency: null,
//       rvwType: "10C",
//       PSA: "",
//       rvwYear: null,
//     },
//     title: "10 Cent Review",
//     dropdownPlaceholder: "Please Select Program",
//   },
//   cnpcontr: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/CNPContractLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/CNPContractChartAgency.json",
//     columns: [
//       {
//         fieldName: "contract_name",
//         headerName: "Contract Name",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "cnp_number",
//         headerName: "CNP Number",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ContractValue",
//         headerName: "Contract Value",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "StartDate",
//         headerName: "Start Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "EndDate",
//         headerName: "End Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ContractStatus",
//         headerName: "Contract Status",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 574,
//       charteringAgency: null,
//       rvwType: "CNP",
//       PSA: "",
//       rvwYear: null,
//     },
//     title: "CNP Contract Review",
//     dropdownPlaceholder: "Please Select Contract",
//   },
//   clswallinv: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/ClosedWallLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/ClosedWallChartAgency.json",
//     columns: [
//       {
//         fieldName: "investment_name",
//         headerName: "Investment Name",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "investment_id",
//         headerName: "Investment ID",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "InvestmentAmount",
//         headerName: "Investment Amount",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "CloseDate",
//         headerName: "Close Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "WallType",
//         headerName: "Wall Type",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 575,
//       charteringAgency: null,
//       rvwType: "CWI",
//       PSA: "",
//       rvwYear: null,
//     },
//     title: "Closed Wall Investment",
//     dropdownPlaceholder: "Please Select Investment",
//   },
//   psacontrrvw: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/PSAContractLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/PSAContractChartAgency.json",
//     columns: [
//       {
//         fieldName: "psa_name",
//         headerName: "PSA Name",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "psa_number",
//         headerName: "PSA Number",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "PSAValue",
//         headerName: "PSA Value",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "StartDate",
//         headerName: "Start Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "EndDate",
//         headerName: "End Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "PSAStatus",
//         headerName: "PSA Status",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 576,
//       charteringAgency: null,
//       rvwType: "PSA",
//       PSA: "",
//       rvwYear: null,
//       psaId: null,
//     },
//     title: "PSA Contract Review",
//     dropdownPlaceholder: "Please Select PSA",
//   },
//   "31n6beyondhir": {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/ThirtyOneN6Lookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/ThirtyOneN6ChartAgency.json",
//     columns: [
//       {
//         fieldName: "program_name",
//         headerName: "Program Name",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "program_code",
//         headerName: "Program Code",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "HIR_Amount",
//         headerName: "HIR Amount",
//         visible: true,
//         type: "currency",
//       },
//       {
//         fieldName: "BeyondDate",
//         headerName: "Beyond Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "Status",
//         headerName: "Status",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 577,
//       charteringAgency: null,
//       rvwType: "31N",
//       PSA: "",
//       rvwYear: null,
//     },
//     title: "31N6 Beyond HIR Review",
//     dropdownPlaceholder: "Please Select Program",
//   },
//   privschconsult: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/PrivateSchoolLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/PrivateSchoolChartAgency.json",
//     columns: [
//       {
//         fieldName: "school_name",
//         headerName: "School Name",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "school_code",
//         headerName: "School Code",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ConsultationDate",
//         headerName: "Consultation Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "LastActivity",
//         headerName: "Date of Last Activity",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "ConsultationType",
//         headerName: "Consultation Type",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 578,
//       charteringAgency: null,
//       rvwType: "PSC",
//       PSA: "",
//       rvwYear: null,
//     },
//     title: "Private School Consultation",
//     dropdownPlaceholder: "Please Select School",
//   },
//   falseel: {
//     apiEndpoint: "assets/api-data/ConsolidatedReview/FalseELLookup.json",
//     chartAgencyEndpoint:
//       "assets/api-data/ConsolidatedReview/FalseELChartAgency.json",
//     columns: [
//       {
//         fieldName: "sub_rec_name",
//         headerName: "District",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "sub_rec_cd",
//         headerName: "Sub-Recipient Code",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "FalseELCount",
//         headerName: "False EL Count",
//         visible: true,
//         type: "number",
//       },
//       {
//         fieldName: "DetectionDate",
//         headerName: "Detection Date",
//         visible: true,
//         type: "date",
//       },
//       {
//         fieldName: "rvw_stage_desc",
//         headerName: "Review Stage Description",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "AssignedTo",
//         headerName: "Assigned To",
//         visible: true,
//         type: "text",
//       },
//       {
//         fieldName: "rvw_yr",
//         headerName: "Review Year",
//         visible: true,
//         type: "text",
//       },
//     ],
//     searchObj: {
//       grantPgmId: 579,
//       charteringAgency: null,
//       rvwType: "FEL",
//       PSA: "",
//       rvwYear: null,
//     },
//     title: "False EL Review",
//     dropdownPlaceholder: "Please Select District",
//   },
// };

// export type TabId = keyof typeof TAB_CONFIGURATIONS;

// export interface TabConfig {
//   id: TabId;
//   label: string;
//   disabled?: boolean;
// }

// export const TAB_LIST: TabConfig[] = [
//   { id: "excessfundbal", label: "Excess Fund Balance" },
//   { id: "ltclaimexcep", label: "LT Claim Exception" },
//   { id: "contrpage", label: "Contract Page" },
//   { id: "10cent", label: "10 Cent" },
//   { id: "cnpcontr", label: "CNP Contract" },
//   { id: "clswallinv", label: "Closed Wall Invest" },
//   { id: "psacontrrvw", label: "PSA Contract" },
//   { id: "31n6beyondhir", label: "31N6 Beyond HIR" },
//   { id: "privschconsult", label: "Private School" },
//   { id: "falseel", label: "False EL" },
// ];
