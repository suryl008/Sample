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
  columns: Array<{
    fieldName: string;
    headerName: string;
    visible: boolean;
    type: string;
  }>;
  searchObj: any;
  dropdownPlaceholder: string;
  dropdownRvwTypePlaceholder?: string;

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

  // Review type specific properties
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

export const TAB_CONFIGURATIONS: Record<string, TabConfiguration> = {
  excessfundbal: {
    id: "excessfundbal",
    title: "Excess Fund Balance",
    detailsTitle: "Excess Fund Balance Review Details",
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
        type: "text",
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
        type: "datetime",
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
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "DRT",
    grantPgmId: 570,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Review Type",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  ltclaimexcep: {
    id: "ltclaimexcep",
    title: "LT Claim Exception",
    detailsTitle: "LT Claim Exception Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
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
        fieldName: "ClaimMonth",
        headerName: "Claim Date",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Last Activity",
        visible: true,
        type: "datetime",
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
      grantPgmId: 321,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select District",
    dropdownRvwTypePlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "",
    grantPgmId: 321,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Review Type",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  contrpage: {
    id: "contrpage",
    title: "Contracts Page (Rebid)",
    detailsTitle: "Contract Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 325,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
      contractId: null,
    },
    dropdownPlaceholder: "Type of Contract",

    // Details page properties
    reviewType: "CON",
    grantPgmId: 325,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Type of Contract",
      sub_rec_name: "Parent",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  "10cent": {
    id: "10cent",
    title: "10 Cent Program GANS",
    detailsTitle: "10 Cent Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 582,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "",
    grantPgmId: 582,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Application",
      sub_rec_name: "Parent",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  cnpcontr: {
    id: "cnpcontr",
    title: "CNP Contracts",
    detailsTitle: "CNP Contract Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Contract Type",
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
        fieldName: "sub_rec_name",
        headerName: "Sub-Recipient Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Last Activity",
        visible: true,
        type: "datetime",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage",
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
      grantPgmId: 1459,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "",
    grantPgmId: 574,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Contract Review",
      sub_rec_name: "SFA",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  clswallinv: {
    id: "clswallinv",
    title: "Class Wallet Invoicing",
    detailsTitle: "Class Wallet Invoicing Review Details",
    columns: [
      {
        fieldName: "InvoicePeriod",
        headerName: "Invoice Period",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Date of Last Activity",
        visible: true,
        type: "datetime",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Review Stage",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 1555,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "",

    // Details page properties
    reviewType: "",
    grantPgmId: 1555,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Invoice",
      sub_rec_name: "Parent",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  psacontrrvw: {
    id: "psacontrrvw",
    title: "PSA Contract Review",
    detailsTitle: "PSA Contract Review Details",
    columns: [
      {
        fieldName: "psa_name",
        headerName: "PSA",
        visible: true,
        type: "text",
      },
      {
        fieldName: "SubmissionType",
        headerName: "Submission Type",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Last Activity",
        visible: true,
        type: "datetime",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Current Stage",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 475,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
      psaId: null,
    },
    dropdownPlaceholder: "Please Select PSA",

    // Details page properties
    reviewType: "PSA",
    grantPgmId: 475,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Contracts",
      sub_rec_name: "Parent",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  section61a: {
    id: "section61a",
    title: "Section 61a(2) Application",
    detailsTitle: "Section 61a(2) Application Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 1698,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select District",
    dropdownRvwTypePlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "",
    grantPgmId: 1698,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Application",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  ctepgm: {
    id: "ctepgm",
    title: "CTE New Program",
    detailsTitle: "CTE New Program Review Details",
    columns: [
      {
        fieldName: "rvw_yr",
        headerName: "App Year",
        visible: true,
        type: "text",
      },
      {
        fieldName: "window",
        headerName: "Window",
        visible: true,
        type: "text",
      },
      {
        fieldName: "ProgramType",
        headerName: "Program Type",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "PSN",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "CIP Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "building_name",
        headerName: "Building Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "GEMS ID",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Last Activity",
        visible: true,
        type: "datetime",
      },
      {
        fieldName: "rvw_stage_desc",
        headerName: "Current Stage",
        visible: true,
        type: "text",
      },
      {
        fieldName: "AssignedTo",
        headerName: "Assigned To",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 1537,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "",
    grantPgmId: 1537,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Type",
      sub_rec_name: "Applicant",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  emcapp: {
    id: "emcapp",
    title: "EMC Application Scoring",
    detailsTitle: "EMC Application Scoring Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 1698,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select District",
    dropdownRvwTypePlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "",
    grantPgmId: 1698,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Planning Grant",
      sub_rec_name: "Applicant",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  cteexec: {
    id: "cteexec",
    title: "CTE Excellence Award Scoring",
    detailsTitle: "CTE Excellence Award Scoring Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 1544,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select District",
    dropdownRvwTypePlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "",
    grantPgmId: 1544,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Type of Award",
      sub_rec_name: "Applicant",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  psa: {
    id: "psa",
    title: "PSA (Legacy)",
    detailsTitle: "PSA (Legacy) Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 1930,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "DRT",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select District",
    dropdownRvwTypePlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "DRT",
    grantPgmId: 1930,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Review",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  emcplan: {
    id: "emcplan",
    title: "EMC Planning Grant Scoring",
    detailsTitle: "EMC Planning Grant Scoring Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 1549,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "DRT",
      PSA: "",
      rvwYear: null,
      exceptionType: "",
    },
    dropdownPlaceholder: "Please Select District",
    dropdownRvwTypePlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "DRT",
    grantPgmId: 1549,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Planning Grant",
      sub_rec_name: "Applicant",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  "31n6beyondhir": {
    id: "31n6beyondhir",
    title: "31n(6) Beyond Hiring",
    detailsTitle: "31n(6) Beyond Hiring Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "LastActivity",
        headerName: "Last Activity",
        visible: true,
        type: "datetime",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 1926,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select Program",

    // Details page properties
    reviewType: "",
    grantPgmId: 1926,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Application",
      sub_rec_name: "Applicant",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  privschconsult: {
    id: "privschconsult",
    title: "Private Sch Consult",
    detailsTitle: "Private Sch Consult Review Details",
    columns: [
      {
        fieldName: "rvw_type_desc",
        headerName: "Program",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_cd",
        headerName: "Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "sub_rec_name",
        headerName: "Parent",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "Review Number",
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
      grantPgmId: 1927,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select School",

    // Details page properties
    reviewType: "",
    grantPgmId: 1927,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Review",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  falseel: {
    id: "falseel",
    title: "False EL",
    detailsTitle: "False EL Review Details",
    columns: [
      {
        fieldName: "UICCode",
        headerName: "UIC",
        visible: true,
        type: "text",
      },
      {
        fieldName: "DistrictCode",
        headerName: "District Code",
        visible: true,
        type: "text",
      },
      {
        fieldName: "DistrictName",
        headerName: "District Name",
        visible: true,
        type: "text",
      },
      {
        fieldName: "rvw_ref_no",
        headerName: "GEMS ID",
        visible: true,
        type: "text",
      },
      {
        fieldName: "DateSubmitted",
        headerName: "Date Submitted",
        visible: true,
        type: "date",
      },
      {
        fieldName: "ReviewStatus",
        headerName: "Review Status",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 579,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "FEL",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "FEL",
    grantPgmId: 579,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Review Type",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
    },
  },

  usdadodcompliant: {
    id: "usdadodcompliant",
    title: "USDADOD Compliant",
    detailsTitle: "USDADOD Compliant Review Details",
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
        fieldName: "ComplianceScore",
        headerName: "Compliance Score",
        visible: true,
        type: "number",
      },
      {
        fieldName: "LastReviewDate",
        headerName: "Last Review Date",
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
        fieldName: "ComplianceStatus",
        headerName: "Compliance Status",
        visible: true,
        type: "text",
      },
    ],
    searchObj: {
      grantPgmId: 580,
      agencyId: 0,
      charteringAgency: null,
      rvwType: "USD",
      PSA: "",
      rvwYear: null,
    },
    dropdownPlaceholder: "Please Select District",

    // Details page properties
    reviewType: "USD",
    grantPgmId: 580,

    // Field labels
    fieldLabels: {
      rvw_type_desc: "Review Type",
      sub_rec_name: "District",
      rvw_yr: "Review Year",
      rvw_ref_no: "Review Ref. No",
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
      columns: [],
      searchObj: {},
      dropdownPlaceholder: "Please Select",
      reviewType: tabId.toUpperCase().substring(0, 3),
      grantPgmId: 500,
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

    mdeSectionTitle: "MDE Contacts",
    notificationSectionTitle: "Sub-Recipient Contacts",
    documentsSectionTitle: "Schedule Documents",
    datesSectionTitle: "Schedule Dates",
    submissionSectionTitle: "Submission",
    buttonsSectionTitle: "Review Buttons",

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
  { id: "ltclaimexcep", label: "Late Claim Exception" },
  { id: "contrpage", label: "Contracts Page (Rebid)" },
  { id: "10cent", label: "10 Cent Program GANS" },
  { id: "cnpcontr", label: "CNP Contracts" },
  { id: "clswallinv", label: "Class Wallet Invoicing" },
  { id: "psacontrrvw", label: "PSA Contract Review" },
  { id: "section61a", label: "Section 61a(2) Application" },
  { id: "ctepgm", label: "CTE New Program" },
  { id: "emcapp", label: "EMC Application Scoring" },
  { id: "cteexec", label: "CTE Excellence Award Scoring" },
  { id: "psa", label: "PSA (Legacy)" },
  { id: "emcplan", label: "EMC Planning Grant Scoring" },
  { id: "31n6beyondhir", label: "31n(6) Beyond Hiring" },
  { id: "privschconsult", label: "Private Sch Consult" },
  { id: "falseel", label: "False EL" },
  { id: "usdadodcompliant", label: "USDADOD Compliant" },
];

export interface SideMenuGroup {
  groupLabel?: string;
  items: TabId[];
}

export const SIDE_MENU_GROUPS: SideMenuGroup[] = [
  {
    groupLabel: "Fiscal and Admin Services Cust",
    items: ["excessfundbal", "ltclaimexcep", "contrpage", "10cent"],
  },
  {
    groupLabel: "CTE Programs",
    items: ["section61a", "ctepgm", "emcapp", "cteexec", "psa", "emcplan"],
  },
  {
    items: [
      "cnpcontr",
      "clswallinv",
      "psacontrrvw",
      "31n6beyondhir",
      "privschconsult",
      "falseel",
      "usdadodcompliant",
    ],
  },
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
