import { HttpClient } from "@angular/common/http";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { SharedService } from "src/app/shared/services/shared.service";
import { ConsolidatedReviewPopupComponent } from "../ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";
import { ToastrService } from "ngx-toastr";
import {
  TAB_CONFIGURATIONS,
  TabId,
  ColumnConfig,
  getTabConfig,
  getFieldLabel,
  getSectionTitle,
} from "../consolidated-review-tab-config";
import { Subject, firstValueFrom } from "rxjs";
import { takeUntil, finalize, switchMap } from "rxjs/operators";
import { AdditionalSupportDialogComponent } from "../AdditionalSupport/additional-support-dialog/additional-support-dialog.component";
import { MiscdataConfirmDialogComponent } from "../AdditionalSupport/components/miscdata-confirm-dialog/miscdata-confirm-dialog.component";
import { ActivatedRoute, Router } from "@angular/router";
import { UntypedFormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { environment } from "src/environments/environment";

@Component({
    selector: "app-consolidatedreview-details",
    templateUrl: "./ConsolidatedReviewDetails.component.html",
    styleUrls: ["./ConsolidatedReviewDetails.component.scss"],
    standalone: false
})
export class ConsolidatedReviewDetailsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  submissionDocsInfo: any[] = [];
  constructor(
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private toastrService: ToastrService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  // ViewChild references for paginators
  @ViewChild("reviewTeamPaginator") reviewTeamPaginator: MatPaginator;
  @ViewChild("stageHistoryPaginator") stageHistoryPaginator: MatPaginator;
  @ViewChild("doclistpaginator") doclistpaginator: MatPaginator;
  @ViewChild("docSubmissionpaginator") docSubmissionpaginator: MatPaginator;
  @ViewChild("mdereviewaginator") mdereviewaginator: MatPaginator;
  @ViewChild("notificationpaginator") notificationpaginator: MatPaginator;

  // Input/Output properties
  @Input() visitSelectedData: any = {};
  @Input() currentTabId: TabId = "excessfundbal";
  @Output() emitTabData = new EventEmitter();
  @Output() emitEnhancedData = new EventEmitter();

  // Component state
  public showSpinner: boolean = false;
  public userDetails: any;
  public isAddOrEdit: boolean = true;
  public directorVisitSelectedID: number;

  // Tab-specific properties
  public currentTabConfig: any;
  public detailsTitle: string = "Review Details";

  // Data sources
  public responseMDEContactsData = new MatTableDataSource<any>();
  public responseSubRecContactsData = new MatTableDataSource<any>();
  public responseDocSubmissionData = new MatTableDataSource<any>();
  public notificationInfo = new MatTableDataSource<any>();
  public MDERvwTeamInfo = new MatTableDataSource<any>();
  public responseDocumentData = new MatTableDataSource<any>();
  public reviewTeamList = new MatTableDataSource<any>();
  public stageHistoryList = new MatTableDataSource<any>();

  // Lookup data (shared across tabs)
  public pgmMDERoleTypes: any[] = [];
  public assignSchedUsers: any[] = [];
  public pgmRoleTypes: any[] = [];
  public agyUsers: any[] = [];
  public nextStageList: any[] = [];
  public miscellaneousFields: any[] = [];
  public lceClaimInfo: any[] = [];

  // Other data
  public subRecipientRvwStatusInfo: any = [];
  public schedDocFileData: any = [];
  public selectedDocumentData: any;
  public reviewTypeList: any[] = [];
  public selectedReviewTypeList: any[] = [];

  // UI state
  public isDocSelectAll: boolean = false;
  public isSubmissionSelectAll: boolean = false;
  public selectedStage: any = "";
  public selectedReason: any = 0;

  // Column configurations (dynamically loaded)
  public displayedReviewTeamColumns: string[] = [];
  public displayedstageHistoryColumns: string[] = [];
  public displayedNotificationColumns: string[] = [];
  public displayedMDERvwTeamColumns: string[] = [];
  public documentDisplayedColumns: string[] = [];
  public docSubmissionDisplayedColumns: string[] = [];

  public matNotificationColumnConfig: ColumnConfig[] = [];
  public matMDERvwTeamColumnConfig: ColumnConfig[] = [];
  public documentColumnConfig: ColumnConfig[] = [];
  public docSubmissionColumnConfig: ColumnConfig[] = [];

  displayedColumns: string[] = ["field_name", "field_data"];
  isLCEClaimDateVisible = true;
  lastClaimExceptionUsed: string | null = null;
  isExceptionEligible = false;

  months: { label: string; value: number }[] = [];
  years: number[] = [];
  claimMonthControl = new UntypedFormControl(0);
  claimYearControl = new UntypedFormControl(0);
  lceClaimMonth!: number;
  lceClaimYear!: number;
  lceLastClaimMonth!: number;
  lceLastClaimYear!: number;

  // Default data structure for new rows
  public newInfo = {
    sub_role_id: 0,
    role_id: 0,
    role_type: "",
    role_desc: "",
    user_id: 0,
    role_name: "",
    role_email: "",
    role_phone: "",
    user_status: "0",
    user_role: "",
    notify_fmt: "",
    pri_ind: false,
    chk_ind: false,
    training_info: false,
    select: false,
    isNewContact: true,
  };

  // Contact name functionality
  public contactNameControls = new Map<string, UntypedFormControl>();
  public filteredContactsMap = new Map<string, any[]>();
  public currentSearchTerm = "";

  // Move Review properties (NEW)
  public moveTargetStage: string = "";
  public stageOptions: any[] = [
    { value: "stage1", viewValue: "Initial Review" },
    { value: "stage2", viewValue: "Desk Review" },
    { value: "stage3", viewValue: "Field Review" },
    { value: "stage4", viewValue: "Final Review" },
    { value: "stage5", viewValue: "Closure" },
  ];

  public reasonControl = new UntypedFormControl("");
  public reasonOptions: any[] = [
    "Incomplete Documentation",
    "Additional Information Required",
    "Compliance Issue",
    "Approved for Next Stage",
    "Rejected - Needs Revision",
    "On Hold - Pending Response",
    "Escalated to Supervisor",
  ];
  public filteredReasonOptions: any[] = [...this.reasonOptions];
  public moveSelectedFile: File | null = null;
  public moveSelectedFileName: string = "";

  private destroy$ = new Subject<void>();
  private originalSnapshot = "";

  async ngOnInit() {
    this.showSpinner = true;
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.directorVisitSelectedID = this.visitSelectedData?.sub_rvw_id;

    await this.loadTabConfiguration();
    try {
      await this.bindFormDetails();
      this.setupReasonAutocomplete(); // Initialize reason autocomplete
    } catch (error) {
      this.toastrService.error("Failed to load review details", "Error");
    } finally {
      this.showSpinner = false;
    }
  }

  ngAfterViewInit() {
    this.setPaginators();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.contactNameControls.clear();
    this.filteredContactsMap.clear();
  }

  private setPaginators(): void {
    setTimeout(() => {
      if (this.mdereviewaginator) {
        this.MDERvwTeamInfo.paginator = this.mdereviewaginator;
      }
      if (this.notificationpaginator) {
        this.notificationInfo.paginator = this.notificationpaginator;
      }
      if (this.doclistpaginator) {
        this.responseDocumentData.paginator = this.doclistpaginator;
      }
      if (this.docSubmissionpaginator) {
        this.responseDocSubmissionData.paginator = this.docSubmissionpaginator;
      }
      if (this.reviewTeamPaginator) {
        this.reviewTeamList.paginator = this.reviewTeamPaginator;
      }
      if (this.stageHistoryPaginator) {
        this.stageHistoryList.paginator = this.stageHistoryPaginator;
      }
    });
  }

  async loadTabConfiguration(): Promise<void> {
    this.currentTabConfig = getTabConfig(this.currentTabId);
    this.detailsTitle =
      this.currentTabConfig.detailsTitle ||
      `${this.currentTabConfig.title} Review Details`;
    this.loadColumnConfigurations();

    const grantPgm = this.currentTabConfig?.searchObj?.grantPgm;
    if (grantPgm) {
      try {
        await firstValueFrom(this.consolidatedReviewService.ensurePgmIdMap());
      } catch (error) {
        this.handleError(error, "Failed to load grant program identifiers");
      }
      const grantPgmId = this.getResolvedGrantPgmId();
      if (grantPgmId) {
        this.currentTabConfig.grantPgmId = grantPgmId;
      } else {
        this.toastrService.error(
          `Unable to resolve grant program "${grantPgm}" for this environment.`,
          "Error",
        );
      }
    }

    this.updateVisitDataWithTabContext();
  }

  loadColumnConfigurations(): void {
    this.matNotificationColumnConfig =
      this.currentTabConfig.notificationColumns || [];
    this.displayedNotificationColumns = [
      ...this.matNotificationColumnConfig.map((col) => col.id),
      "Action",
    ];
    this.matMDERvwTeamColumnConfig = this.currentTabConfig.mdeColumns || [];
    this.displayedMDERvwTeamColumns = [
      ...this.matMDERvwTeamColumnConfig.map((col) => col.id),
      "Action",
    ];
    this.documentColumnConfig = this.currentTabConfig.documentColumns || [];
    this.documentDisplayedColumns = [
      ...this.documentColumnConfig.map((col) => col.id),
      "Action",
    ];
    this.docSubmissionColumnConfig =
      this.currentTabConfig.docSubmissionColumns || [];
    this.docSubmissionDisplayedColumns = [
      "position",
      ...this.docSubmissionColumnConfig.map((col) => col.id),
      "View",
      "Errors",
    ];
    this.displayedReviewTeamColumns = ["contact_name", "perm_desc"];
    this.displayedstageHistoryColumns = [
      "rvw_stage",
      "start_dt",
      "end_dt",
      "compl_by",
      "reason",
      "view",
    ];
  }

  updateVisitDataWithTabContext(): void {
    if (this.visitSelectedData) {
      this.visitSelectedData = {
        ...this.visitSelectedData,
        currentTabId: this.currentTabId,
        currentTabTitle: this.currentTabConfig.title,
        reviewType: this.currentTabConfig.reviewType,
        grantPgmId: this.getResolvedGrantPgmId(),
      };
    }
  }

  async bindFormDetails() {
    this.showSpinner = true;

    try {
      await Promise.all([
        this.getWorkflowCd(),
        this.getAgyUserLup(),
        this.getPGMMDERoleTypeLupInfo(),
        this.getPgmRoleTypeLupInfo(),
        this.getAssignSchedUsersLup(),
        this.getLCEClaimInfo(this.directorVisitSelectedID),
        this.getConsMiscData(this.directorVisitSelectedID),
        this.loadReviewTypeList(),
        this.setupClaimMonthDropdown(),
        this.setupClaimYearDropdown(),
      ]);
      await this.loadTabSpecificData();
      await this.getConsNextStageStatus();
    } catch (error) {
      this.handleError(error, "Failed to load form details");
    } finally {
      this.showSpinner = false;
      this.setPaginators();
      this.captureOriginalSnapshot();
    }
  }

  async loadTabSpecificData(): Promise<void> {
    const endpoints = this.currentTabConfig.endpoints || {};
    await Promise.all([
      this.withSpinner(this.getNotificationInfo(endpoints.notificationInfo)),
      this.withSpinner(this.getMDEReviewTeamInfo(endpoints.mdeReviewTeam)),
      this.withSpinner(this.getSchedDocs(endpoints.schedDocs)),
      this.withSpinner(
        this.getConsSubRecipientRvwStatus(endpoints.reviewStatus),
      ),
      this.withSpinner(this.getConsRvwDocInfo(endpoints.reviewDocs)),
      this.withSpinner(this.getReviewTeam(endpoints.reviewTeam)),
      this.withSpinner(this.getStageHistory(endpoints.stageHistory)),
    ]);
  }

  // ========== API METHODS ==========

  getAgyUserLup(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.getResolvedGrantPgmId(),
        agencyId: this.visitSelectedData?.agency_id,
        userName: "",
        flName: "",
        pcRel: "P",
        pcInd: "X",
        orderBy: "f_l_name",
      };

      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsAgyUserLup.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.agyUsers = (res[0] || []).map((user: any) => ({
                ...user,
                displayName: `${user.Name || user.contact_name} (${user.user_name})`,
                searchText: `${user.Name || user.contact_name} ${user.user_name} ${user.user_email || ""}`,
              }));
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load agency users");
            resolve();
          },
        );
    });
  }

  getPGMMDERoleTypeLupInfo(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.getResolvedGrantPgmId(),
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        roleType: "",
        roleName: "",
        rvwStage: "",
        roleCls: "A",
        roleInd: "R",
        subRvwId: "0",
        option: "S",
        orderBy: "role_name",
      };

      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsPgmRoleTypeLup.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.pgmMDERoleTypes = res[0] || [];
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load MDE role types");
            resolve();
          },
        );
    });
  }

  getPgmRoleTypeLupInfo(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.getResolvedGrantPgmId(),
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        roleType: "",
        roleName: "",
        rvwStage: "SCHED",
        roleCls: "G",
        roleInd: "N",
        subRvwId: "0",
        option: "S",
        orderBy: "role_name",
      };

      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsPgmRoleTypeLup-1.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.pgmRoleTypes = res[0] || [];
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load role types");
            resolve();
          },
        );
    });
  }

  getAssignSchedUsersLup(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.getResolvedGrantPgmId(),
        userName: "",
        contactName: "",
        orderBy: "contact_name",
        authInd: "S",
        offCd: "",
      };

      this.httpClient
        .get(
          "assets/api-data/ConsolidatedReview/GetConsAssignSchedUsersLup.json",
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.assignSchedUsers = res[0] || [];
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load scheduled users");
            resolve();
          },
        );
    });
  }

  getNotificationInfo(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint ||
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo.json";

      this.httpClient
        .get(apiEndpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              const notificationData = (res[0] || []).map(
                (x: any, index: number) => {
                  let isNewContact =
                    x.user_id == 0 ||
                    this.agyUsers.filter(
                      (element: any) => element.user_id == x.user_id,
                    )?.length == 0;

                  return {
                    ...x,
                    select: false,
                    pri_ind: x.pri_ind == "P" ? true : false,
                    user_status:
                      x.user_status == "A" && x.user_id != 0 ? true : false,
                    chk_ind: x.chk_ind == "True" ? true : false,
                    training_info: x.training_info == "True" ? true : false,
                    isNewContact: isNewContact,
                    role_name:
                      Object.keys(x.role_name)?.length == 0 ? "" : x.role_name,
                    rowIndex: index,
                    controlId: x.sub_role_id || `new_${index}`,
                  };
                },
              );

              this.notificationInfo.data = notificationData;

              // Initialize form controls for all contacts
              notificationData.forEach((contact: any) => {
                this.initContactControl(contact);
              });
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load notification info");
            resolve();
          },
        );
    });
  }

  getMDEReviewTeamInfo(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint ||
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-1.json";

      this.httpClient
        .get(apiEndpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.MDERvwTeamInfo.data = res[0] || [];
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load MDE review team info");
            resolve();
          },
        );
    });
  }

  getSchedDocs(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.getResolvedGrantPgmId(),
        agencyId: this.visitSelectedData?.agency_id,
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        offCd: "",
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        pcInd: this.visitSelectedData?.p_c_ind,
        option: this.isAddOrEdit ? "S" : "R",
      };

      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.responseDocumentData.data = (res[0] || []).map((x: any) => {
                return {
                  ...x,
                  select: false,
                  previewForm: x.form_id != 0 || x.FlexFormPDFTemplateID != 0,
                  chk_ind: x.chk_ind == "Y" ? true : false,
                  isUserTouched: false,
                };
              });
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load schedule documents");
            resolve();
          },
        );
    });
  }

  getConsSubRecipientRvwStatus(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.getResolvedGrantPgmId(),
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        agencyId: this.visitSelectedData?.agency_id,
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        rvwStage: "SCHED",
        option: "R",
      };

      this.httpClient
        .get(
          "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus.json",
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.subRecipientRvwStatusInfo = res;
              if (
                this.subRecipientRvwStatusInfo?.length > 0 &&
                this.subRecipientRvwStatusInfo[0]?.length > 0
              ) {
                const item = this.subRecipientRvwStatusInfo[0][0];
                item.start_dt = item.start_dt ? new Date(item.start_dt) : null;
                item.end_dt = item.end_dt ? new Date(item.end_dt) : null;
              }
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load review status");
            resolve();
          },
        );
    });
  }

  getConsRvwDocInfo(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        docSrl: 0,
        verNo: 0,
        userId: this.userDetails?.user_id,
        option: "X",
      };

      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsRvwDocInfo.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.responseDocSubmissionData.data = res[0] || [];
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load review documents");
            resolve();
          },
        );
    });
  }

  getReviewTeam(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsReviewTeam.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.reviewTeamList = new MatTableDataSource(
                this.sharedService.updateEmptyObjToNull(res[0] || []),
              );
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load review team");
            resolve();
          },
        );
    });
  }

  getStageHistory(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      this.httpClient
        .get(
          "assets/api-data/ConsolidatedReview/GetConsReviewStageHistory.json",
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.stageHistoryList = new MatTableDataSource(
                this.sharedService.updateEmptyObjToNull(res[0] || []),
              );
              this.cd.detectChanges();
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load stage history");
            resolve();
          },
        );
    });
  }

  getConsNextStageStatus(): Promise<void> {
    return new Promise((resolve) => {
      this.nextStageList = [];
      this.nextStageList.push({ stage_stat: "", stat_desc: "Please Select" });

      const payload = {
        wfcd: "ZEFBR5",
        rvwStage: this.visitSelectedData?.rvw_stage,
        stageStat: "P",
        option: "P",
      };

      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsNextStageStatus.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null && res[0].length > 0) {
              res[0].forEach((element: any) => {
                this.nextStageList.push(element);
              });
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load next stage status");
            resolve();
          },
        );
    });
  }

  getLCEClaimInfo(subRvwId: number): Promise<void> {
    return new Promise((resolve) => {
      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetLCEClaimInfo.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.lceClaimInfo = res[0];
              if (this.lceClaimInfo && this.lceClaimInfo.length > 0) {
                this.lceLastClaimMonth =
                  this.lceClaimInfo[0].lce_last_claim_month;
                this.lceLastClaimYear =
                  this.lceClaimInfo[0].lce_last_claim_year;
              }
              if (this.lceLastClaimMonth > 0 && this.lceLastClaimYear > 0) {
                this.lastClaimExceptionUsed = `${this.lceLastClaimMonth}/${this.lceLastClaimYear}`;
              } else {
                this.lastClaimExceptionUsed = "None";
              }
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load LCE claim info");
            resolve();
          },
        );
    });
  }

  getConsMiscData(subRvwId: number): Promise<void> {
    return new Promise((resolve) => {
      this.httpClient
        .get("assets/api-data/ConsolidatedReview/GetConsRefDataInfo.json")
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              res[0].forEach((item: any) => {
                if (item.field_name === "Claim Submitted Date(s)") {
                  item.field_data = new Date(item.field_data);
                }
              });
              this.miscellaneousFields = res[0];
            }
            resolve();
          },
          (error) => {
            this.handleError(error, "Failed to load miscellaneous data");
            resolve();
          },
        );
    });
  }

  private withSpinner<T>(operation: Promise<T>): Promise<T> {
    this.showSpinner = true;
    return operation.finally(() => {
      this.showSpinner = false;
    });
  }

  private handleError(error: any, message: string) {
    console.error(`${message}:`, error);
    this.toastrService.error(message, "Error");
  }

  // ========== CONTACT NAME HYBRID INPUT FUNCTIONALITY ==========

  // Initialize form control for a contact
  private initContactControl(contact: any): void {
    if (!this.contactNameControls.has(contact.controlId)) {
      // Set initial value
      let initialValue = "";
      if (contact.user_id && contact.user_id > 0) {
        const user = this.findUserById(contact.user_id);
        if (user) {
          initialValue = this.displayContactFn(user);
        } else {
          initialValue = contact.role_name || "";
        }
      } else {
        initialValue = contact.role_name || "";
      }

      const control = new UntypedFormControl(initialValue);
      this.contactNameControls.set(contact.controlId, control);

      // Initialize filtered contacts for this control
      this.filteredContactsMap.set(contact.controlId, [...this.agyUsers]);
    }
  }

  // Get form control for a contact
  getContactControl(element: any): UntypedFormControl {
    const controlId = element.controlId || `new_${element.rowIndex}`;
    if (!this.contactNameControls.has(controlId)) {
      this.initContactControl(element);
    }
    return this.contactNameControls.get(controlId)!;
  }

  // Filter contacts based on input
  filterContacts(event: Event, element: any): any[] {
    const input = (event.target as HTMLInputElement).value;
    const controlId = element.controlId || `new_${element.rowIndex}`;

    if (!input) {
      const allContacts = [...this.agyUsers];
      this.filteredContactsMap.set(controlId, allContacts);
      return allContacts;
    }

    const searchTerm = input.toLowerCase();
    const filtered = this.agyUsers.filter((user) => {
      const displayName = this.displayContactFn(user).toLowerCase();
      const email = (user.user_email || "").toLowerCase();
      const userName = (user.user_name || "").toLowerCase();

      return (
        displayName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        userName.includes(searchTerm)
      );
    });

    this.filteredContactsMap.set(controlId, filtered);
    return filtered;
  }

  // Get filtered contacts for display
  getFilteredContacts(element: any): any[] {
    const controlId = element.controlId || `new_${element.rowIndex}`;
    return this.filteredContactsMap.get(controlId) || [...this.agyUsers];
  }

  // Handle contact selection from autocomplete
  onContactSelected(event: MatAutocompleteSelectedEvent, element: any): void {
    const selectedContact = event.option.value;

    if (selectedContact && selectedContact.user_id) {
      // Update element with selected user data
      element.user_id = selectedContact.user_id;
      element.role_name = selectedContact.Name || selectedContact.contact_name;
      element.role_email = selectedContact.user_email || "";
      element.user_role = selectedContact.role_desc || "Sub-Recipient Contact";
      element.isNewContact = false;

      // Update the form control value
      const control = this.getContactControl(element);
      control.setValue(this.displayContactFn(selectedContact));
    } else if (typeof selectedContact === "string") {
      // Free text input
      element.role_name = selectedContact;
      element.user_id = 0;
      element.role_email = "";
      element.user_role = "Custom Contact";
      element.isNewContact = true;
    }

    // Update the data source
    this.notificationInfo._updateChangeSubscription();
  }

  // Display function for autocomplete
  displayContactFn(contact: any): string {
    if (!contact) return "";
    if (typeof contact === "string") {
      return contact;
    }
    return `${contact.Name || contact.contact_name} (${contact.user_name})`;
  }

  // Handle blur event for free text input
  onContactFieldBlur(element: any): void {
    const control = this.getContactControl(element);
    const inputValue = control.value?.trim();

    if (inputValue && !element.user_id) {
      // Check if the input matches any existing user
      const matchingUser = this.agyUsers.find(
        (user) => this.displayContactFn(user) === inputValue,
      );

      if (!matchingUser) {
        // It's free text - update the element
        element.role_name = inputValue;
        element.user_id = 0;
        element.role_email = "";
        element.user_role = "Custom Contact";
        element.isNewContact = true;
        this.notificationInfo._updateChangeSubscription();
      }
    }
  }

  // Find user by ID
  findUserById(userId: number): any {
    return this.agyUsers.find((user) => user.user_id === userId);
  }

  // ========== MOVE REVIEW FUNCTIONALITY (NEW) ==========

  private setupReasonAutocomplete(): void {
    this.reasonControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (typeof value === "string") {
          this.filterReasons(value);
        }
      });
  }

  private filterReasons(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredReasonOptions = [...this.reasonOptions];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredReasonOptions = this.reasonOptions.filter((option) =>
        option.toLowerCase().includes(term),
      );
    }
  }

  displayReasonFn(reason: any): string {
    return reason ? reason.label || reason : "";
  }

  onReasonSelected(event: MatAutocompleteSelectedEvent): void {
    const selected = event.option.value;
    this.reasonControl.setValue(selected.label || selected);
  }

  onMoveFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.moveSelectedFile = input.files[0];
      this.moveSelectedFileName = this.moveSelectedFile.name;
    }
  }

  canMoveReview(): boolean {
    return (
      !!this.moveTargetStage &&
      !!this.reasonControl.value &&
      !!this.moveSelectedFile
    );
  }

  resetMoveReview(): void {
    this.moveTargetStage = "";
    this.reasonControl.setValue("");
    this.moveSelectedFile = null;
    this.moveSelectedFileName = "";
    this.filteredReasonOptions = [...this.reasonOptions];
  }

  moveReview(): void {
    if (!this.canMoveReview()) {
      this.toastrService.warning("Please complete all fields", "Cannot Move");
      return;
    }

    this.showSpinner = true;

    // Prepare data for move
    const moveData = {
      targetStage: this.moveTargetStage,
      reason: this.reasonControl.value,
      fileName: this.moveSelectedFileName,
      fileSize: this.moveSelectedFile?.size,
      fileType: this.moveSelectedFile?.type,
      // In real app, you'd upload the file here
    };

    console.log("Moving review with data:", moveData);

    // Simulate API call
    setTimeout(() => {
      this.showSpinner = false;
      this.toastrService.success("Review moved successfully!", "Success");
      this.resetMoveReview();

      // Optionally refresh data
      this.bindFormDetails();
    }, 1500);
  }

  // ========== SAVE FUNCTIONALITY ==========

  saveVisitorDetails() {
    this.showSpinner = true;

    // Validate data before saving
    if (!this.validateSaveData()) {
      this.showSpinner = false;
      return;
    }

    // Prepare save payload
    const savePayload = this.prepareSavePayload();

    // Simulate API call (replace with actual API call)
    setTimeout(() => {
      this.showSpinner = false;

      console.log("Saving data:", savePayload);

      // Show success message
      this.toastrService.success(
        `${this.currentTabConfig.title} details saved successfully!`,
        "Success",
      );

      // Emit saved data
      this.emitEnhancedData.emit({
        ...savePayload,
        saved: true,
        timestamp: new Date(),
      });

      // Refresh data
      this.bindFormDetails();
    }, 1500);
  }

  private validateSaveData(): boolean {
    // Validate notification contacts
    const invalidContacts = this.notificationInfo.data.filter(
      (contact: any) => {
        if (!contact.role_id || contact.role_id === 0) {
          return true;
        }
        if (!contact.role_name || contact.role_name.trim() === "") {
          return true;
        }
        return false;
      },
    );

    if (invalidContacts.length > 0) {
      this.toastrService.warning(
        "Please fill all required contact fields",
        "Validation Error",
      );
      return false;
    }

    // Validate MDE team
    const invalidMDEContacts = this.MDERvwTeamInfo.data.filter(
      (contact: any) => {
        return (
          !contact.role_id ||
          contact.role_id === 0 ||
          !contact.user_id ||
          contact.user_id === 0
        );
      },
    );

    if (invalidMDEContacts.length > 0) {
      this.toastrService.warning(
        "Please fill all required MDE contact fields",
        "Validation Error",
      );
      return false;
    }

    // Validate dates
    if (
      this.subRecipientRvwStatusInfo?.length > 0 &&
      this.subRecipientRvwStatusInfo[0]?.length > 0
    ) {
      const statusItem = this.subRecipientRvwStatusInfo[0][0];
      if (
        statusItem.start_dt &&
        statusItem.end_dt &&
        statusItem.start_dt > statusItem.end_dt
      ) {
        this.toastrService.warning(
          "Start date cannot be after end date",
          "Validation Error",
        );
        return false;
      }
    }

    return true;
  }

  private prepareSavePayload(): any {
    // Process notification data for saving
    const processedNotificationData = this.notificationInfo.data.map(
      (contact: any) => ({
        ...contact,
        pri_ind: contact.pri_ind ? "P" : "",
        chk_ind: contact.chk_ind ? "True" : "False",
        user_status: contact.user_id === 0 ? "I" : "A",
        training_info: contact.training_info ? "True" : "False",
      }),
    );

    // Process MDE team data
    const processedMDEData = this.MDERvwTeamInfo.data.map((contact: any) => ({
      ...contact,
      chk_ind: contact.chk_ind ? "True" : "False",
    }));

    // Process document data
    const processedDocumentData = this.responseDocumentData.data.map(
      (doc: any) => ({
        ...doc,
        chk_ind: doc.chk_ind ? "Y" : "N",
      }),
    );

    // Process submission data
    const processedSubmissionData = this.responseDocSubmissionData.data.map(
      (doc: any) => ({
        ...doc,
        doc_completed: doc.doc_completed ? "Y" : "N",
      }),
    );

    // Process dates
    let processedDates = null;
    if (
      this.subRecipientRvwStatusInfo?.length > 0 &&
      this.subRecipientRvwStatusInfo[0]?.length > 0
    ) {
      const statusItem = this.subRecipientRvwStatusInfo[0][0];
      processedDates = {
        start_dt: statusItem.start_dt,
        end_dt: statusItem.end_dt,
      };
    }

    return {
      tabId: this.currentTabId,
      tabTitle: this.currentTabConfig.title,
      reviewType: this.currentTabConfig.reviewType,
      grantPgmId: this.getResolvedGrantPgmId(),
      subRvwId: this.directorVisitSelectedID,
      userId: this.userDetails?.user_id,

      // Main data sections
      notificationData: processedNotificationData,
      mdeReviewData: processedMDEData,
      documentData: processedDocumentData,
      submissionData: processedSubmissionData,
      reviewStatus: processedDates,

      // LCE data if applicable
      lceData:
        this.currentTabId === "ltclaimexcep"
          ? {
              claimMonth: this.claimMonthControl.value,
              claimYear: this.claimYearControl.value,
              miscellaneousFields: this.miscellaneousFields,
            }
          : null,

      // Review type change if applicable
      reviewTypeChange:
        (this.currentTabId === "ltclaimexcep" ||
          this.currentTabId === "psacontrrvw") &&
        this.selectedReviewTypeList.length > 0
          ? {
              newReviewType: this.selectedReviewTypeList[0],
            }
          : null,

      // Stage promotion if selected
      stagePromotion: this.selectedStage
        ? {
            newStage: this.selectedStage,
            reason: this.selectedReason,
          }
        : null,
    };
  }

  // ========== OTHER FUNCTIONALITY ==========

  // Field label and section title helpers
  getFieldLabel(fieldName: string): string {
    return getFieldLabel(this.currentTabId, fieldName);
  }

  private getResolvedGrantPgmId(): number | null {
    const fromVisit = Number(this.visitSelectedData?.grantPgmId);
    if (fromVisit > 0) {
      return fromVisit;
    }

    const fromConfig = Number(this.currentTabConfig?.grantPgmId);
    if (fromConfig > 0) {
      return fromConfig;
    }

    return this.consolidatedReviewService.getGrantPgmId(
      this.currentTabConfig?.searchObj?.grantPgm,
    );
  }

  getSectionTitle(section: string): string {
    return getSectionTitle(this.currentTabId, section);
  }

  // Add new rows
  addNewNotify() {
    let newNotify = JSON.parse(JSON.stringify(this.newInfo));
    newNotify.rowIndex = this.notificationInfo.data.length;
    newNotify.controlId = `new_${newNotify.rowIndex}`;
    this.notificationInfo.data.push(newNotify);

    // Initialize form control for the new row
    this.initContactControl(newNotify);

    this.notificationInfo._updateChangeSubscription();
  }

  addNewMDERvw() {
    let newInfo = JSON.parse(JSON.stringify(this.newInfo));
    this.MDERvwTeamInfo.data.push(newInfo);
    this.MDERvwTeamInfo._updateChangeSubscription();
  }

  // Role and user change handlers
  onChangeRvwRole(e: any, element: any) {
    const index = this.MDERvwTeamInfo.data.findIndex((r: any) => r === element);
    if (index > -1) {
      let roleId = e.value;
      let selectedRole = this.pgmMDERoleTypes.filter(
        (x: any) => x.role_id === roleId,
      )[0];
      this.MDERvwTeamInfo.data[index]["role_id"] = roleId;
      this.MDERvwTeamInfo.data[index]["role_type"] =
        selectedRole?.roleType || "";
      this.MDERvwTeamInfo.data[index]["role_desc"] =
        selectedRole?.roleTypeDescription || "";
      this.MDERvwTeamInfo._updateChangeSubscription();
    }
  }

  onChangeReviewer(e: any, element: any) {
    const index = this.MDERvwTeamInfo.data.findIndex((r: any) => r === element);
    if (index > -1) {
      let userId = e.value;
      let selectedUser = this.assignSchedUsers.filter(
        (x: any) => x.user_id === userId,
      )[0];
      this.MDERvwTeamInfo.data[index]["user_id"] = userId;
      this.MDERvwTeamInfo.data[index]["role_name"] =
        selectedUser?.contact_name || "";
      this.MDERvwTeamInfo.data[index]["role_email"] =
        selectedUser?.user_email || "";
      this.MDERvwTeamInfo._updateChangeSubscription();
    }
  }

  onChangeRoleType(e: any, element: any) {
    const index = this.notificationInfo.data.findIndex(
      (r: any) => r === element,
    );
    if (index > -1) {
      let roleId = e.value;
      let selectedRole = this.pgmRoleTypes.filter(
        (x: any) => x.role_id === roleId,
      )[0];
      this.notificationInfo.data[index]["role_id"] = roleId;
      this.notificationInfo.data[index]["role_type"] =
        selectedRole?.roleType || "";
      this.notificationInfo.data[index]["role_name"] =
        selectedRole?.roleTypeDescription || "";
      this.notificationInfo._updateChangeSubscription();
    }
  }

  changePrimaryContact(event: any, element: any) {
    const index = this.notificationInfo.data.findIndex(
      (r: any) => r === element,
    );
    if (index > -1) {
      this.notificationInfo.data.forEach((ele: any, i: number) => {
        if (event == "pri_ind") {
          ele.pri_ind = i === index ? ele.pri_ind : false;
        }
      });
      this.notificationInfo._updateChangeSubscription();
    }
  }

  // Checkbox selection handlers
  selectAllCheckBox(event: any, gridName: any, isSelectAll: boolean) {
    if (gridName == "docSearch") {
      if (isSelectAll) {
        this.responseDocumentData.data.forEach((element: any) => {
          element.chk_ind = event.checked;
          element.isUserTouched = true;
        });
      } else {
        this.isDocSelectAll =
          this.responseDocumentData?.data?.length ==
          this.responseDocumentData?.data?.filter((ele: any) => ele.chk_ind)
            ?.length;
      }
      this.responseDocumentData._updateChangeSubscription();
    } else if (gridName == "docSubmission") {
      if (isSelectAll) {
        this.responseDocSubmissionData.data.forEach((element: any) => {
          element.doc_completed = event.checked;
          element.isUserTouched = true;
        });
      } else {
        this.isSubmissionSelectAll =
          this.responseDocSubmissionData?.data?.length ==
          this.responseDocSubmissionData?.data?.filter(
            (ele: any) => ele.doc_completed,
          )?.length;
      }
      this.responseDocSubmissionData._updateChangeSubscription();
    }
  }

  // File download and preview
  downloadPreviewForm(element: any) {
    this.downloadFile(element.PDFFileName || element.file_name);
  }

  downloadFile(file: any) {
    this.showSpinner = true;
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/ViewSchedDocFile.json")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (res: any) => {
          if (res != null) {
            this.schedDocFileData = res;
            this.sharedService.byteArrayToExportExcel(
              this.schedDocFileData,
              file,
            );
            this.showSpinner = false;
          } else {
            this.toastrService.error(
              "No File to download",
              "Document File preview not successful.",
            );
            this.showSpinner = false;
          }
        },
        (error) => {
          this.showSpinner = false;
          this.handleError(error, "Failed to download file");
        },
      );
  }

  // Stage selection
  onSelectionStageChanged(event: any, data: any) {
    if (event?.isUserInput) {
      this.selectedReason = data.id;
    }
  }

  // Dialog popups
  openConsolidatedReviewPopup(element: any, Mode: any, pageName: any) {
    let filteredDocData = [];
    let documentName: '';
    if(pageName == 'viewDoc') {
      filteredDocData = this.submissionDocsInfo?.filter((x: any) => x.doc_list_id === element?.doc_list_id);
      documentName = element?.doc_name;
    }

    const dialogRef = this.dialog.open(ConsolidatedReviewPopupComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "80%",
      height: "80%",
      panelClass: "consolidated-reviews-overlay",
      data: {
        pageName: pageName,
        mode: Mode,
        headerName: pageName == "overallComments" ? "Global Comments"
          : pageName == "viewdoc" ? "Attachments"
          : pageName == "editemail" ? "Edit Email"
          : pageName == "eemAmendment" ? "EEM Amendment"
          : "Email Log",
        emailData: element,
        subRvwId: this.directorVisitSelectedID,
        visitSelectedData: this.visitSelectedData,
        currentTabId: this.currentTabId,
        currentTabTitle: this.currentTabConfig.title,
        submissionDocsInfo: filteredDocData,
        documentName: documentName,
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.data == "submit") {
        this.toastrService.success(
          "Operation completed successfully",
          "Success",
        );
      }
    });
  }

  async openConfirmDeletePopup(rowData: any, gridName: any, rowIndex?: number) {
    const itemLabel = this.getDeleteItemLabel(rowData, gridName);
    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "420px",
      panelClass: "consolidated-reviews-overlay",
      autoFocus: "dialog",
      data: {
        title: "Confirm deletion",
        message: `Are you sure you want to delete ${itemLabel}?`,
        subMessage: "This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "delete",
      },
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (confirmed) {
      this.deleteRow(gridName, rowIndex, rowData);
    }
  }

  private getDeleteItemLabel(rowData: any, gridName: string): string {
    if (gridName === "mdervwTeam" || gridName === "notification") {
      const name = rowData?.role_name || rowData?.role_desc;
      return name ? `"${name}"` : "this contact";
    }

    const documentName =
      rowData?.doc_name || rowData?.docName || rowData?.file_name;
    return documentName ? `"${documentName}"` : "this document";
  }

  private deleteRow(gridName: string, index?: number, rowData?: any) {
    switch (gridName) {
      case "mdervwTeam":
        if (index !== undefined) {
          const data = this.MDERvwTeamInfo.data as any[];
          data.splice(index, 1);
          this.MDERvwTeamInfo.data = [...data];
        }
        break;

      case "notification":
        if (index !== undefined) {
          const data = this.notificationInfo.data as any[];
          // Remove the form control
          const controlId = rowData.controlId || `new_${rowData.rowIndex}`;
          this.contactNameControls.delete(controlId);
          this.filteredContactsMap.delete(controlId);

          data.splice(index, 1);
          this.notificationInfo.data = [...data];
        }
        break;

      case "document":
        this.toastrService.info(
          "Document deletion would be implemented here",
          "Info",
        );
        break;
    }
  }

  // Promote to next stage
  promoteNextStage() {
    if (this.selectedStage) {
      this.showSpinner = true;

      setTimeout(() => {
        this.showSpinner = false;

        this.toastrService.success(
          `${this.currentTabConfig.title} promoted to next stage!`,
          "Success",
        );
        this.bindFormDetails();
      }, 1000);
    } else {
      this.toastrService.warning(
        "Please select a stage to promote to",
        "Warning",
      );
    }
  }

  // Navigation and tab switching
  hasUnsavedChanges(): boolean {
    return this.captureSnapshot() !== this.originalSnapshot;
  }

  async confirmDiscard(): Promise<boolean> {
    if (!this.hasUnsavedChanges()) {
      return true;
    }

    const dialogRef = this.dialog.open(MiscdataConfirmDialogComponent, {
      width: "420px",
      panelClass: "consolidated-reviews-overlay",
      autoFocus: "dialog",
      data: {
        title: "Unsaved changes",
        message: "You have unsaved changes on this review. Close without saving?",
        subMessage: "Edits to contacts, documents, dates, and stage will be lost.",
        confirmText: "Close",
        cancelText: "Stay",
        type: "warning",
      },
    });

    return !!(await firstValueFrom(dialogRef.afterClosed()));
  }

  async close(): Promise<void> {
    try {
      const canLeave = await this.confirmDiscard();
      if (!canLeave) {
        return;
      }
      this.cancelEnhancedForm();
    } catch (error) {
      console.error("Failed to close review details", error);
    }
  }

  cancelEnhancedForm() {
    this.originalSnapshot = this.captureSnapshot();
    this.emitTabData.emit({
      selectedPage: "selectVisit",
      showDetails: false,
      tabId: this.currentTabId,
    });
  }

  @HostListener("window:beforeunload", ["$event"])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedChanges()) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  }

  private captureOriginalSnapshot(): void {
    this.originalSnapshot = this.captureSnapshot();
  }

  private captureSnapshot(): string {
    try {
      return JSON.stringify({
        notifications: this.notificationInfo?.data || [],
        mde: this.MDERvwTeamInfo?.data || [],
        status: this.subRecipientRvwStatusInfo || [],
        docs: this.responseDocumentData?.data || [],
        submissions: this.responseDocSubmissionData?.data || [],
        selectedStage: this.selectedStage || "",
        claimMonth: this.claimMonthControl?.value ?? null,
        claimYear: this.claimYearControl?.value ?? null,
        misc: this.miscellaneousFields || [],
      });
    } catch (error) {
      console.error("Failed to capture review details snapshot", error);
      return "";
    }
  }

  switchTab(tabId: TabId): void {
    this.currentTabId = tabId;
    this.loadTabConfiguration();
    this.bindFormDetails();
  }

  getCurrentTabTitle(): string {
    return this.currentTabConfig?.title || "Review";
  }

  // LCE Claim functionality
  checkLCEExceptionEligible(): void {
    let lastUsedMonth = 0;
    let lastUsedYear = 0;
    if (this.lastClaimExceptionUsed && this.lastClaimExceptionUsed !== "None") {
      const parts = this.lastClaimExceptionUsed.split("/");
      lastUsedMonth = Number(parts[0]);
      lastUsedYear = Number(parts[1]);
    }
    const selectedMonth = Number(this.claimMonthControl.value);
    const selectedYear = Number(this.claimYearControl.value);

    if (!selectedMonth || !selectedYear) {
      this.isExceptionEligible = false;
      return;
    }

    const monthsSinceLastUsed =
      selectedYear * 12 + selectedMonth - (lastUsedYear * 12 + lastUsedMonth);
    this.isExceptionEligible = monthsSinceLastUsed > 36;
  }

  clearLCEClaimMonth(): void {
    this.claimMonthControl.setValue(null);
    this.claimYearControl.setValue(null);
    this.checkLCEExceptionEligible();
  }

  setupClaimMonthDropdown(): void {
    this.months = [];
    this.months.push({ label: "", value: 0 });
    for (let i = 1; i <= 12; i++) {
      this.months.push({ label: i.toString(), value: i });
    }
    this.claimMonthControl.setValue(this.lceClaimMonth ?? 0);
  }

  setupClaimYearDropdown(): void {
    this.years = [];
    this.years.push(0);
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 6; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
    this.claimYearControl.setValue(this.lceClaimYear ?? 0);
  }

  // Review type list
  loadReviewTypeList() {
    this.reviewTypeList = [];
    let payload = {
      grantPgmId: this.getResolvedGrantPgmId(),
      rvwType: "",
      rvwTypeDesc: "",
      option: "R",
      recStat: "O",
      orderBy: "",
      userId: this.userDetails?.userId,
    };
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetRvwTypeLookUp.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.reviewTypeList =
              res[0]?.map((x: any) => {
                return {
                  id: x["rvw_type"],
                  itemName: x["rvw_desc"] + " (" + x["rvw_type"] + ")",
                  ...x,
                };
              }) || [];
            this.showSpinner = false;
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
          this.handleError(error, "Failed to load review types");
        },
      );
  }

  async updatedSelectedValue(selectedList: any): Promise<void> {
    this.selectedReviewTypeList = selectedList?.selectedItemsValues || [];
  }

  // Additional support dialog
  showAdditionalSupport() {
    let data = {
      documentCategoryList: null,
      docTypeList: null,
      entityList: null,
      defaultList: null,
      offCd: "",
      subCat: "",
      grantPgmId: this.getResolvedGrantPgmId() ?? 0,
      rvwType: "",
      subRvwId: 0,
      directorVisitSelectedData: "",
    };
    data.subRvwId = this.directorVisitSelectedID;
    data.directorVisitSelectedData = this.visitSelectedData;

    const dialogRef = this.dialog.open(AdditionalSupportDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "80%",
      height: "80%",
      panelClass: ["consolidated-reviews-overlay", "full-screen-modal"],
      data: data,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.data == "submit") {
        this.toastrService.success(
          "Operation completed successfully",
          "Success",
        );
      }
    });
  }

  // Workflow CD
  async getWorkflowCd() {
    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetWorkFlowCd.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then((res: any) => {
        if (res != null) {
          this.visitSelectedData.programName = res[0].item1;
          this.visitSelectedData.workFlowCd = res[0].item2;
        }
      })
      .catch((error) => {
        this.handleError(error, "Failed to load workflow");
      });
  }

  // Submission section functionality
  getSubmissionProgress(): number {
    if (
      !this.responseDocSubmissionData?.data ||
      this.responseDocSubmissionData.data.length === 0
    ) {
      return 0;
    }
    const completedCount = this.responseDocSubmissionData.data.filter(
      (item: any) => item.doc_completed,
    ).length;
    return Math.round(
      (completedCount / this.responseDocSubmissionData.data.length) * 100,
    );
  }

  viewSubmissionDocument(element: any): void {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
      this.toastrService.info(
        `Viewing document: ${element.document_name || "Document"}`,
        "Info",
      );
    }, 500);
  }

  showSubmissionErrors(element: any): void {
    if (this.hasErrors(element)) {
      this.toastrService.warning(
        `Errors found in document: ${element.document_name || "Document"}`,
        "Validation Errors",
      );
    } else {
      this.toastrService.info("No errors found", "Info");
    }
  }

  hasErrors(element: any): boolean {
    // Mock logic - in real app, check element.error_count or similar property
    return Math.random() > 0.7; // 30% chance of having errors for demo
  }

  showHelpInfo(element: any): void {
    this.toastrService.info(
      `Help information for: ${element.document_name || "Document"}`,
      "Help",
    );
  }

  validateAllSubmissions(): void {
    if (this.responseDocSubmissionData?.data?.length === 0) {
      this.toastrService.warning("No documents to validate", "Warning");
      return;
    }

    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
      const errorCount = Math.floor(Math.random() * 3); // Random 0-2 errors
      if (errorCount > 0) {
        this.toastrService.warning(
          `Found ${errorCount} validation error(s)`,
          "Validation Complete",
        );
      } else {
        this.toastrService.success(
          "All documents validated successfully",
          "Success",
        );
      }
    }, 1500);
  }

  submitAllDocuments(): void {
    if (!this.canSubmitAll()) {
      this.toastrService.warning(
        "Cannot submit. Please complete all required documents first.",
        "Warning",
      );
      return;
    }

    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
      this.toastrService.success(
        "All documents submitted successfully",
        "Success",
      );
    }, 2000);
  }

  canSubmitAll(): boolean {
    if (
      !this.responseDocSubmissionData?.data ||
      this.responseDocSubmissionData.data.length === 0
    ) {
      return false;
    }
    const allCompleted = this.responseDocSubmissionData.data.every(
      (item: any) => item.doc_completed === true,
    );
    return allCompleted;
  }

  exportSubmissionReport(): void {
    if (this.responseDocSubmissionData?.data?.length === 0) {
      this.toastrService.warning("No data to export", "Warning");
      return;
    }

    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
      this.toastrService.success("Report exported successfully", "Success");
    }, 1000);
  }

  previewApplication(): void {
    this.toastrService.info("Application preview functionality", "Info");
  }

  onDocumentClick(element: any) {
    let subdocType = element?.doc_type;
    let URL = '';
    if (subdocType == 'A') {
      let filteredDocData = [];
      let documentName = '';
      filteredDocData = this.submissionDocsInfo?.filter(item => item.doc_list_id === element?.doc_list_id);
      documentName = element?.doc_name;
      const dialogRef = this.dialog.open(ConsolidatedReviewPopupComponent, {
        maxWidth: "100vw",
        maxHeight: "100vh",
        width: "80%",
        height: "80%",
        data: {
          pageName: 'viewdoc',
          mode: 'edit',
          headerName: "Attachments",
          emailData: element,
          subRvwId: this.directorVisitSelectedID,
          visitSelectedData: this.visitSelectedData,
          currentTabId: this.currentTabId,
          currentTabTitle: this.currentTabConfig.title,
          submissionDocsInfo: filteredDocData,
          documentName: documentName,
          docListId: element?.doc_list_id,
        },
        autoFocus: false,
      });
  
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result?.data == "submit") {
          this.toastrService.success(
            "Operation completed successfully",
            "Success",
          );
        }
      });
    } else if (subdocType == 'Q') {
      let payload = {
        userID: this.userDetails.userId,
        targetKey: '',
        xmlStr: ''
      }
      let questPayload = {
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        doclistid: element?.doc_list_id
      }
      this.showSpinner = true;
      this.consolidatedReviewService.questionnaireResponseBySubReviewAndDocListId(questPayload)
        .pipe(
          switchMap((firstResult: any) => {
            let questResponseID = firstResult[0][0]?.QuestionnaireResponseID || -1;
            const params = {
              code: element?.QuestionnaireCode ?? '',
              isPopup: true,
              isFromGems: true,
              questionnaireResponseID: element?.QuestionnaireID ?? '',
              action: questResponseID == -1 ? 'edit' : 'respond',
              response: questResponseID,
              subRvwId: this.visitSelectedData?.sub_rvw_id,
              doclistid: element?.doc_list_id ?? '',
              docName: element?.doc_name ?? '',
              mode: 'upload',
              pgmid: this.visitSelectedData?.grantPgmId ?? '',
              pgmcode: this.visitSelectedData?.grantPgm ?? '',
              pgmdesc: this.visitSelectedData?.programName ?? '',
              agencyid: 0,
              subrecipientcode: this.visitSelectedData?.sub_rec_cd ?? '',
              remap: 'False',
              questionnaireFieldID: element?.QuestionnaireFieldID ?? '',
            };
  
            if (element?.allow_multiple_Questionnaire_instances == true) {
              const paramXml = `
                                <params>
                                  <p name="code" value="${params.code}"/> 
                                  <p name="qid" value="${params.questionnaireResponseID}"/>
                                  <p name="subRvwId" value="${params.subRvwId}"/> 
                                  <p name="doclistid" value="${params.doclistid}"/>
                                  <p name="docName" value="${params.docName}"/> 
                                  <p name="pgmid" value="${params.pgmid}"/>
                                  <p name="pgmcode" value="${params.pgmcode}"/> 
                                  <p name="pgmdesc" value="${params.pgmdesc}"/>
                                  <p name="mode" value="${params.mode}"/> 
                                  <p name="agencyid" value="${params.agencyid}"/>
                                  <p name="subrecipientcode" value="${params.subrecipientcode}"/> 
                                  <p name="remap" value="${params.remap}"/>
                                  <p name="questionnaireFieldID" value="${params.questionnaireFieldID}"/>
                                </params>`;
              payload = {
                userID: this.userDetails.userId,
                targetKey: 'QUESTIONNAIRE_RESPONSE_DOCLIST_UPLOAD',
                xmlStr: paramXml
              }
            } else {
              const paramXml = `
                              <params>
                                <p name="code" value="${params.code}"/> 
                                <p name="isPopup" value="${params.isPopup}"/>
                                <p name="isFromGems" value="${params.isFromGems}"/> 
                                <p name="questionnaireResponseID" value="${params.questionnaireResponseID}"/>
                                <p name="action" value="${params.action}"/> 
                                <p name="response" value="${params.response}"/>
                                <p name="subRvwId" value="${params.subRvwId}"/> 
                                <p name="doclistid" value="${params.doclistid}"/>
                                <p name="docName" value="${params.docName}"/> 
                                <p name="mode" value="${params.mode}"/>
                                <p name="remap" value="${params.remap}"/>
                              </params>`;
              payload = {
                userID: this.userDetails.userId,
                targetKey: 'QUESTIONNAIRE_EDIT_UPLOAD',
                xmlStr: paramXml
              }
            }
            return this.consolidatedReviewService.getNavigationID(payload);
          })
        ).subscribe({
          next: (result) => {
            URL = environment.gems_url + '/user/ssologin.aspx?frmAngularNavid=' + result[0][0].id;
            this.openCenteredPopup(URL, 'DocumentSubmission');
            this.showSpinner = false;
          },
          error: (err) => {
            console.error('Error:', err);
            this.showSpinner = false;
          }
        })
    }
  }

  openCenteredPopup(url: string, title: string): void {
  }

 
}
