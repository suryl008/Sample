import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { SharedService } from "src/app/shared/services/shared.service";
import { ConsolidatedReviewPopupComponent } from "../ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";
import { ToastrService } from "ngx-toastr";
import { PopUpComponent } from "src/app/shared/PopUp/PopUp.component";
import {
  TAB_CONFIGURATIONS,
  TabId,
  ColumnConfig,
  getTabConfig,
  getFieldLabel,
  getSectionTitle,
} from "../consolidated-review-tab-config";
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { AdditionalSupportDialogComponent } from "../AdditionalSupport/additional-support-dialog/additional-support-dialog.component";

@Component({
  selector: "app-consolidatedreview-details",
  templateUrl: "./ConsolidatedReviewDetails.component.html",
  styleUrls: ["./ConsolidatedReviewDetails.component.scss"],
})
export class ConsolidatedReviewDetailsComponent implements OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private toastrService: ToastrService,
    private cd: ChangeDetectorRef,
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
  public responseMDEContactsData = new MatTableDataSource();
  public responseSubRecContactsData = new MatTableDataSource();
  public responseDocSubmissionData = new MatTableDataSource();
  public notificationInfo = new MatTableDataSource();
  public MDERvwTeamInfo = new MatTableDataSource();
  public responseDocumentData = new MatTableDataSource();
  public reviewTeamList = new MatTableDataSource();
  public stageHistoryList = new MatTableDataSource();

  // Lookup data (shared across tabs)
  public pgmMDERoleTypes: any[] = [];
  public assignSchedUsers: any[] = [];
  public pgmRoleTypes: any[] = [];
  public agyUsers: any[] = [];
  public nextStageList: any[] = [];

  // Other data
  public subRecipientRvwStatusInfo: any = [];
  public schedDocFileData: any = [];
  public selectedDocumentData: any;

  // UI state
  public isDocSelectAll: boolean = false;
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
  };

  private destroy$ = new Subject<void>();

  async ngOnInit() {
    this.showSpinner = true;
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.directorVisitSelectedID = this.visitSelectedData?.sub_rvw_id;

    console.log(this.userDetails);

    // Load tab configuration
    this.loadTabConfiguration();

    // Bind form details
    await this.bindFormDetails();

    this.showSpinner = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load configuration for current tab
   */
  loadTabConfiguration(): void {
    this.currentTabConfig = getTabConfig(this.currentTabId);

    // Set component title
    this.detailsTitle =
      this.currentTabConfig.detailsTitle ||
      `${this.currentTabConfig.title} Review Details`;

    // Load column configurations
    this.loadColumnConfigurations();

    // Update visitSelectedData with tab-specific data if needed
    this.updateVisitDataWithTabContext();
  }

  /**
   * Load dynamic column configurations based on tab
   */
  loadColumnConfigurations(): void {
    // Notification columns
    this.matNotificationColumnConfig =
      this.currentTabConfig.notificationColumns || [];
    this.displayedNotificationColumns = [
      ...this.matNotificationColumnConfig.map((col) => col.id),
      "Action",
    ];

    // MDE Review Team columns
    this.matMDERvwTeamColumnConfig = this.currentTabConfig.mdeColumns || [];
    this.displayedMDERvwTeamColumns = [
      ...this.matMDERvwTeamColumnConfig.map((col) => col.id),
      "Action",
    ];

    // Document columns
    this.documentColumnConfig = this.currentTabConfig.documentColumns || [];
    this.documentDisplayedColumns = [
      ...this.documentColumnConfig.map((col) => col.id),
      "Action",
    ];

    // Document Submission columns
    this.docSubmissionColumnConfig =
      this.currentTabConfig.docSubmissionColumns || [];
    this.docSubmissionDisplayedColumns = [
      "position",
      ...this.docSubmissionColumnConfig.map((col) => col.id),
      "View",
      "Errors",
      "Action",
    ];

    // Standard columns (same for all tabs)
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

  /**
   * Update visit data with tab-specific context
   */
  updateVisitDataWithTabContext(): void {
    if (this.visitSelectedData) {
      this.visitSelectedData = {
        ...this.visitSelectedData,
        currentTabId: this.currentTabId,
        currentTabTitle: this.currentTabConfig.title,
        reviewType: this.currentTabConfig.reviewType,
        grantPgmId: this.currentTabConfig.grantPgmId,
      };
    }
  }

  /**
   * Initialize and load all form data
   */
  async bindFormDetails() {
    this.showSpinner = true;

    try {
      // Load shared lookup data
      await Promise.all([
        this.getAgyUserLup(),
        this.getPGMMDERoleTypeLupInfo(),
        this.getPgmRoleTypeLupInfo(),
        this.getAssignSchedUsersLup(),
      ]);

      // Load tab-specific data
      await this.loadTabSpecificData();

      // Load common UI data
      await this.getConsNextStageStatus();
    } catch (error) {
      this.handleError(error, "Failed to load form details");
    } finally {
      this.showSpinner = false;
    }
  }

  /**
   * Load data specific to current tab
   */
  async loadTabSpecificData(): Promise<void> {
    const endpoints = this.currentTabConfig.endpoints || {};

    // Load all tab-specific data in parallel
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

  /**
   * Load Agency Users lookup
   */
  getAgyUserLup(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
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
              this.agyUsers = res[0] || [];
            }
            resolve();
          },
          () => resolve(),
        );
    });
  }

  /**
   * Load MDE Role Types lookup
   */
  getPGMMDERoleTypeLupInfo(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
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
          () => resolve(),
        );
    });
  }

  /**
   * Load Program Role Types lookup
   */
  getPgmRoleTypeLupInfo(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
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
          () => resolve(),
        );
    });
  }

  /**
   * Load Assigned Scheduled Users lookup
   */
  getAssignSchedUsersLup(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
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
          () => resolve(),
        );
    });
  }

  /**
   * Load Notification Info
   */
  getNotificationInfo(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint ||
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo.json";

      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        agencyId: this.visitSelectedData?.agency_id,
        grantPgm: "",
        subRecCd: this.visitSelectedData?.sub_rec_cd,
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        rvwStage: "SCHED",
        roleCls: "G",
        roleInd: "N",
        authSrc: "S",
        option: "S",
      };

      this.httpClient
        .get(apiEndpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.notificationInfo.data = (res[0] || []).map((x: any) => {
                let isNewContact =
                  this.agyUsers.filter(
                    (element: any) => element.user_id == x.user_id,
                  )?.length == 0 || x.user_id == 0;
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
                };
              });
              setTimeout(
                () =>
                  (this.notificationInfo.paginator =
                    this.notificationpaginator),
              );
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

  /**
   * Load MDE Review Team Info
   */
  getMDEReviewTeamInfo(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint ||
        "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-1.json";

      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        agencyId: this.visitSelectedData?.agency_id,
        grantPgm: "",
        subRecCd: this.visitSelectedData?.sub_rec_cd,
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        rvwStage: "SCHED",
        roleCls: "A",
        roleInd: "R",
        authSrc: "S",
        option: "S",
      };

      this.httpClient
        .get(apiEndpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.MDERvwTeamInfo.data = res[0] || [];
              setTimeout(
                () => (this.MDERvwTeamInfo.paginator = this.mdereviewaginator),
              );
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

  /**
   * Load Scheduled Documents
   */
  getSchedDocs(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint ||
        "assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo.json";

      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
        agencyId: this.visitSelectedData?.agency_id,
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        offCd: "",
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        pcInd: this.visitSelectedData?.p_c_ind,
        option: this.isAddOrEdit ? "S" : "R",
      };

      this.httpClient
        .get(apiEndpoint)
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
              setTimeout(
                () =>
                  (this.responseDocumentData.paginator = this.doclistpaginator),
              );
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

  /**
   * Load Sub-Recipient Review Status
   */
  getConsSubRecipientRvwStatus(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint ||
        "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus.json";

      const payload = {
        grantPgmId: this.currentTabConfig.grantPgmId || 570,
        rvwType:
          this.currentTabConfig.reviewType || this.visitSelectedData?.rvw_type,
        agencyId: this.visitSelectedData?.agency_id,
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        rvwStage: "SCHED",
        option: "R",
      };

      this.httpClient
        .get(apiEndpoint)
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

  /**
   * Load Review Document Info
   */
  getConsRvwDocInfo(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint || "assets/api-data/ConsolidatedReview/GetConsRvwDocInfo.json";

      const payload = {
        subRvwId: this.visitSelectedData?.sub_rvw_id,
        docSrl: 0,
        verNo: 0,
        userId: this.userDetails?.user_id,
        option: "X",
      };

      this.httpClient
        .get(apiEndpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.responseDocSubmissionData.data = res[0] || [];
              setTimeout(
                () =>
                  (this.responseDocSubmissionData.paginator =
                    this.docSubmissionpaginator),
              );
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

  /**
   * Load Review Team
   */
  getReviewTeam(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint || "assets/api-data/ConsolidatedReview/GetConsReviewTeam.json";

      this.httpClient
        .get(apiEndpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.reviewTeamList = new MatTableDataSource(
                this.sharedService.updateEmptyObjToNull(res[0] || []),
              );
              setTimeout(
                () =>
                  (this.reviewTeamList.paginator = this.reviewTeamPaginator),
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

  /**
   * Load Stage History
   */
  getStageHistory(endpoint?: string): Promise<void> {
    return new Promise((resolve) => {
      const apiEndpoint =
        endpoint ||
        "assets/api-data/ConsolidatedReview/GetConsReviewStageHistory.json";

      this.httpClient
        .get(apiEndpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res != null) {
              this.stageHistoryList = new MatTableDataSource(
                this.sharedService.updateEmptyObjToNull(res[0] || []),
              );
              setTimeout(
                () =>
                  (this.stageHistoryList.paginator =
                    this.stageHistoryPaginator),
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

  /**
   * Load Next Stage Status
   */
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

  /**
   * Helper method to wrap operations with spinner
   */
  private withSpinner<T>(operation: Promise<T>): Promise<T> {
    this.showSpinner = true;
    return operation.finally(() => {
      this.showSpinner = false;
    });
  }

  /**
   * Error handling helper
   */
  private handleError(error: any, message: string) {
    console.error(`${message}:`, error);
    this.toastrService.error(message, "Error");
  }

  // =================== UI Interaction Methods ===================

  /**
   * Get field label for current tab
   */
  getFieldLabel(fieldName: string): string {
    return getFieldLabel(this.currentTabId, fieldName);
  }

  /**
   * Get section title for current tab
   */
  getSectionTitle(section: string): string {
    return getSectionTitle(this.currentTabId, section);
  }

  /**
   * Add new notification row
   */
  addNewNotify() {
    let newNotify = JSON.parse(JSON.stringify(this.newInfo));
    this.notificationInfo.data.push(newNotify);
    this.notificationInfo._updateChangeSubscription();
  }

  /**
   * Add new MDE review row
   */
  addNewMDERvw() {
    let newInfo = JSON.parse(JSON.stringify(this.newInfo));
    this.MDERvwTeamInfo.data.push(newInfo);
    this.MDERvwTeamInfo._updateChangeSubscription();
  }

  /**
   * Update notification datasource
   */
  updateDatasource() {
    this.notificationInfo._updateChangeSubscription();
  }

  /**
   * Handle role change in MDE contacts
   */
  onChangeRvwRole(e: any, element: any) {
    const index = this.responseMDEContactsData?.data?.findIndex(
      (r) => r === element,
    );
    let roleId = e.value;
    let selectedRole = this.pgmMDERoleTypes.filter(
      (x) => x.role_id === roleId,
    )[0];
    this.responseMDEContactsData.data[index]["role_id"] = roleId;
    this.responseMDEContactsData.data[index]["role_type"] =
      selectedRole?.roleType;
    this.responseMDEContactsData.data[index]["role_desc"] =
      selectedRole?.roleTypeDescription;
    this.responseMDEContactsData._updateChangeSubscription();
  }

  /**
   * Handle reviewer change in MDE contacts
   */
  onChangeReviewer(e: any, element: any) {
    const index = this.responseMDEContactsData?.data?.findIndex(
      (r) => r === element,
    );
    let userId = e.value;
    let selectedUser = this.agyUsers.filter((x) => x.user_id === userId)[0];
    this.responseMDEContactsData.data[index]["user_id"] = userId;
    this.responseMDEContactsData.data[index]["role_name"] =
      selectedUser?.role_name;
    this.responseMDEContactsData.data[index]["role_email"] =
      selectedUser?.user_email;
    this.responseMDEContactsData.data[index]["user_role"] =
      selectedUser?.role_desc;
    this.responseMDEContactsData._updateChangeSubscription();
  }

  /**
   * Handle role type change in sub-recipient contacts
   */
  onChangeRoleType(e: any, element: any) {
    const index = this.responseSubRecContactsData?.data?.findIndex(
      (r) => r === element,
    );
    let roleId = e.value;
    let selectedRole = this.pgmRoleTypes.filter((x) => x.role_id === roleId)[0];
    this.responseSubRecContactsData.data[index]["role_id"] = roleId;
    this.responseSubRecContactsData.data[index]["role_type"] =
      selectedRole?.roleType;
    this.responseSubRecContactsData.data[index]["role_name"] =
      selectedRole?.roleTypeDescription;
    this.responseMDEContactsData._updateChangeSubscription();
  }

  /**
   * Handle user change in sub-recipient contacts
   */
  onChangeUser(e: any, element: any) {
    const index = this.responseSubRecContactsData?.data?.findIndex(
      (r) => r === element,
    );
    let userId = e.value;
    let selectedUser = this.agyUsers.filter((x) => x.user_id === userId)[0];
    this.responseSubRecContactsData.data[index]["user_id"] = userId;
    this.responseSubRecContactsData.data[index]["role_name"] =
      selectedUser?.role_name;
    this.responseSubRecContactsData.data[index]["role_email"] =
      selectedUser?.user_email;
    this.responseSubRecContactsData._updateChangeSubscription();
  }

  /**
   * Change primary contact
   */
  changePrimaryContact(event: any, element: any) {
    const index = this.notificationInfo?.data?.findIndex((r) => r === element);
    this.notificationInfo?.data?.forEach((ele: any, i: number) => {
      if (event == "pri_ind") {
        ele.pri_ind = i = index ? ele.pri_ind : false;
      }
    });
    this.notificationInfo._updateChangeSubscription();
  }

  /**
   * Select all checkbox handler
   */
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
    }
  }

  /**
   * Download preview form
   */
  downloadPreviewForm(element: any) {
    this.downloadFile(element.PDFFileName);
  }

  /**
   * Download file
   */
  downloadFile(file: any) {
    this.showSpinner = true;
    try {
      this.consolidatedReviewService
        .viewSchedDocFile(file)
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
    } catch (error) {
      this.showSpinner = false;
      this.handleError(error, "Failed to download file");
    }
  }

  /**
   * Handle stage selection change
   */
  onSelectionStageChanged(event: any, data: any) {
    if (event?.isUserInput) {
      this.selectedReason = data.id;
    }
  }

  // =================== Popup/Dialog Methods ===================

  /**
   * Open Consolidated Review Popup
   */
  openConsolidatedReviewPopup(event: any, Mode: any, pageName: any) {
    const dialogRef = this.dialog.open(ConsolidatedReviewPopupComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "80%",
      height: "80%",
      data: {
        pageName: pageName,
        mode: Mode,
        headerName: pageName == "viewEmails" ? "Email Log" : "Global Comments",
        emailData: event,
        subRvwId: this.directorVisitSelectedID,
        visitSelectedData: this.visitSelectedData,
        currentTabId: this.currentTabId,
        currentTabTitle: this.currentTabConfig.title,
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.data == "submit") {
        // Handle successful submission
        this.toastrService.success(
          "Operation completed successfully",
          "Success",
        );
      }
    });
  }

  /**
   * Open confirmation delete popup
   */
  openConfirmDeletePopup(rowData: any, gridName: any, rowIndex?: number) {
    const dialogRef = this.dialog.open(PopUpComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "30%",
      height: "25%",
      data: {
        pageName: "consolReview",
        headerName: "Confirmation",
        emitdata: rowData?.subRecName + " (" + rowData?.subRecCd + ")",
        tabId: this.currentTabId,
        tabTitle: this.currentTabConfig.title,
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.data === "ok") {
        // Perform delete operation
        this.deleteRow(gridName, rowIndex, rowData);
      }
    });
  }

  /**
   * Delete row from specified grid
   */
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
          data.splice(index, 1);
          this.notificationInfo.data = [...data];
        }
        break;

      case "document":
        // Handle document deletion
        this.toastrService.info(
          "Document deletion would be implemented here",
          "Info",
        );
        break;
    }
  }

  // =================== Save & Navigation Methods ===================

  /**
   * Save visitor details
   */
  saveVisitorDetails() {
    this.showSpinner = true;

    // Prepare save payload with tab context
    const savePayload = {
      tabId: this.currentTabId,
      tabTitle: this.currentTabConfig.title,
      reviewType: this.currentTabConfig.reviewType,
      grantPgmId: this.currentTabConfig.grantPgmId,
      visitData: this.visitSelectedData,
      notificationData: this.notificationInfo.data,
      mdeReviewData: this.MDERvwTeamInfo.data,
      documentData: this.responseDocumentData.data,
      submissionData: this.responseDocSubmissionData.data,
      reviewStatus: this.subRecipientRvwStatusInfo,
      reviewTeam: this.reviewTeamList.data,
      stageHistory: this.stageHistoryList.data,
    };

    // Simulate API call (replace with actual service call)
    setTimeout(() => {
      this.showSpinner = false;

      // Log for debugging
      console.log(
        `Saving ${this.currentTabConfig.title} details:`,
        savePayload,
      );

      // Emit enhanced data
      this.emitEnhancedData.emit({
        ...savePayload,
        saved: true,
        timestamp: new Date(),
      });

      // Show success message
      this.toastrService.success(
        `${this.currentTabConfig.title} details saved successfully!`,
        "Success",
      );
    }, 1000);
  }

  /**
   * Promote to next stage
   */
  promoteNextStage() {
    if (this.selectedStage) {
      this.showSpinner = true;

      // Simulate API call
      setTimeout(() => {
        this.showSpinner = false;

        this.toastrService.success(
          `${this.currentTabConfig.title} promoted to next stage!`,
          "Success",
        );

        // Refresh data after promotion
        this.bindFormDetails();
      }, 1000);
    } else {
      this.toastrService.warning(
        "Please select a stage to promote to",
        "Warning",
      );
    }
  }

  /**
   * Cancel and go back to search
   */
  cancelEnhancedForm() {
    this.emitTabData.emit({
      selectedPage: "selectVisit",
      showDetails: false,
      tabId: this.currentTabId,
    });
  }

  /**
   * Switch to different tab
   */
  switchTab(tabId: TabId): void {
    this.currentTabId = tabId;
    this.loadTabConfiguration();
    this.bindFormDetails();
  }

  /**
   * Get current tab title
   */
  getCurrentTabTitle(): string {
    return this.currentTabConfig?.title || "Review";
  }

  // Empty methods that need implementation
  saveVisitorDetailsOriginal() {}
  addNewMDEContactRow() {}
  addNewSubRecipientContactRow() {}
  getReasonForDelete() {}
  promoteNextStageOriginal() {}

  async getWorkflowCd() {
    this.consolidatedReviewService
      .getWorkflowCd(570, this.visitSelectedData?.rvw_type)
      .toPromise()
      .then((res: any) => {
        if (res != null) {
          this.visitSelectedData.programName = res.item1;
          this.visitSelectedData.workFlowCd = res.item2;
        }
      });
  }

  showAdditionalSupport() {
    let data = {
      documentCategoryList: null,
      docTypeList: null,
      entityList: null,
      defaultList: null,
      offCd: "",
      subCat: "",
      grantPgmId: 0,
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
      panelClass: "full-screen-modal",
      data: data,
    });
    //dialogRef.componentInstance.emitService.subscribe((emitedValue) => {});

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.data == "submit") {
        this.toastrService.success(
          "Operation completed successfully",
          "Success",
        );
      }
    });
  }
}
// import { HttpClient } from "@angular/common/http";
// import {
//   ChangeDetectorRef,
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
//   ViewChild,
//   OnDestroy,
// } from "@angular/core";
// import { MatDialog } from "@angular/material/dialog";
// import { MatPaginator } from "@angular/material/paginator";
// import { MatTableDataSource } from "@angular/material/table";
// import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
// import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
// import { SharedService } from "src/app/shared/services/shared.service";
// import { ConsolidatedReviewPopupcomponent } from "../ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";
// import { ToastrService } from "ngx-toastr";
// import { PopUpComponent } from "src/app/shared/PopUp/PopUp.component";
// import {
//   TAB_CONFIGURATIONS,
//   TabId,
//   ColumnConfig,
// } from "../consolidated-review-tab-config";
// import { Subject } from "rxjs";
// import { takeUntil } from "rxjs/operators";

// @Component({
//   selector: "app-consolidatedreview-details",
//   templateUrl: "./ConsolidatedReviewDetails.component.html",
//   styleUrls: ["./ConsolidatedReviewDetails.component.scss"],
// })
// export class ConsolidatedReviewDetailsComponent implements OnInit, OnDestroy {
//   constructor(
//     public dialog: MatDialog,
//     private httpClient: HttpClient,
//     private programAdministrationService: ProgramAdministrationService,
//     private consolidatedReviewService: ConsolidatedReviewService,
//     private sharedService: SharedService,
//     private toastrService: ToastrService,
//     private cd: ChangeDetectorRef
//   ) {}

//   @ViewChild("reviewTeamPaginator") reviewTeamPaginator: MatPaginator;
//   @ViewChild("stageHistoryPaginator") stageHistoryPaginator: MatPaginator;
//   @ViewChild("doclistpaginator") doclistpaginator: MatPaginator;
//   @ViewChild("docSubmissionpaginator") docSubmissionpaginator: MatPaginator;
//   @ViewChild("mdereviewaginator") mdereviewaginator: MatPaginator;
//   @ViewChild("notificationpaginator") notificationpaginator: MatPaginator;

//   @Input() visitSelectedData: any = {};
//   @Input() currentTabId: TabId = "excessfundbal";
//   @Output() emitTabData = new EventEmitter();
//   @Output() emitEnhancedData = new EventEmitter();

//   public showSpinner: boolean;
//   public userDetails: any;
//   public isAddOrEdit: boolean = true;
//   public directorVisitSelectedID: number;

//   // Tab-specific properties
//   public currentTabConfig: any;
//   public detailsTitle: string = "Review Details";

//   // Data sources
//   public responseMDEContactsData = new MatTableDataSource();
//   public responseSubRecContactsData = new MatTableDataSource();
//   public responseDocSubmissionData = new MatTableDataSource();
//   public notificationInfo = new MatTableDataSource();
//   public MDERvwTeamInfo = new MatTableDataSource();
//   public responseDocumentData = new MatTableDataSource();
//   public reviewTeamList = new MatTableDataSource();
//   public stageHistoryList = new MatTableDataSource();

//   // Lookup data
//   public pgmMDERoleTypes: any[] = [];
//   public assignSchedUsers: any[] = [];
//   public pgmRoleTypes: any[] = [];
//   public agyUsers: any[] = [];
//   public nextStageList: any[] = [];

//   // Other data
//   public subRecipientRvwStatusInfo: any = [];
//   public schedDocFileData: any = [];
//   public selectedDocumentData: any;

//   // UI state
//   public isDocSelectAll: boolean = false;
//   public selectedStage: any = "";
//   public selectedReason: any = 0;

//   // Column configurations (will be set dynamically)
//   public displayedReviewTeamColumns: string[] = [];
//   public displayedstageHistoryColumns: string[] = [];
//   public displayedNotificationColumns: string[] = [];
//   public displayedMDERvwTeamColumns: string[] = [];
//   public documentDisplayedColumns: string[] = [];
//   public docSubmissionDisplayedColumns: string[] = [];

//   public matNotificationColumnConfig: ColumnConfig[] = [];
//   public matMDERvwTeamColumnConfig: ColumnConfig[] = [];
//   public documentColumnConfig: ColumnConfig[] = [];
//   public docSubmissionColumnConfig: ColumnConfig[] = [];

//   // Default data structure for new rows
//   public newInfo = {
//     sub_role_id: 0,
//     role_id: 0,
//     role_type: "",
//     role_desc: "",
//     user_id: 0,
//     role_name: "",
//     role_email: "",
//     role_phone: "",
//     user_status: "0",
//     user_role: "",
//     notify_fmt: "",
//     pri_ind: false,
//     chk_ind: false,
//     training_info: false,
//     select: false,
//   };

//   private destroy$ = new Subject<void>();

//   async ngOnInit() {
//     this.showSpinner = true;
//     this.userDetails = this.programAdministrationService.getUserDetails();
//     this.directorVisitSelectedID = this.visitSelectedData?.sub_rvw_id;

//     // Load tab configuration
//     this.loadTabConfiguration();

//     await this.bindFormDetails();
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   loadTabConfiguration(): void {
//     this.currentTabConfig = TAB_CONFIGURATIONS[this.currentTabId];

//     if (this.currentTabConfig) {
//       // Update component title based on tab
//       this.detailsTitle = `${this.currentTabConfig.title} Review Details`;

//       // Load tab-specific column configurations
//       this.loadColumnConfigurations();

//       // Update field labels in visitSelectedData for display
//       this.updateFieldLabels();
//     }
//   }

//   loadColumnConfigurations(): void {
//     // Use tab-specific configurations or defaults
//     this.matNotificationColumnConfig = this.currentTabConfig
//       ?.notificationColumns || [
//       { id: "role_id", name: "Contact Type" },
//       { id: "user_id", name: "Contact Name" },
//       { id: "role_email", name: "Email" },
//       { id: "pri_ind", name: "Primary" },
//       { id: "chk_ind", name: "Sel." },
//     ];

//     this.displayedNotificationColumns = [
//       ...this.matNotificationColumnConfig.map((col) => col.id),
//       "Action",
//     ];

//     this.matMDERvwTeamColumnConfig = this.currentTabConfig?.mdeColumns || [
//       { id: "role_id", name: "Review Role" },
//       { id: "user_id", name: "Reviewer Name" },
//       { id: "chk_ind", name: "Sel." },
//     ];

//     this.displayedMDERvwTeamColumns = [
//       ...this.matMDERvwTeamColumnConfig.map((col) => col.id),
//       "Action",
//     ];

//     this.documentColumnConfig = this.currentTabConfig?.documentColumns || [
//       { id: "sub_desc", name: "Submission Category" },
//       { id: "rec_desc", name: "Document Type" },
//       { id: "doc_name", name: "Document Name" },
//       { id: "doc_cat_desc", name: "Document Category" },
//       { id: "chk_ind", name: "Select" },
//       { id: "previewForm", name: "Preview Form" },
//     ];

//     this.documentDisplayedColumns = [
//       ...this.documentColumnConfig.map((col) => col.id),
//       "Action",
//     ];

//     this.docSubmissionColumnConfig = this.currentTabConfig
//       ?.docSubmissionColumns || [
//       { id: "rec_desc", name: "Document Type" },
//       { id: "doc_name", name: "Document Name" },
//       { id: "doc_cat_desc", name: "Document Category" },
//       { id: "help_txt", name: "Instructions" },
//       { id: "doc_completed", name: "Status" },
//     ];

//     this.docSubmissionDisplayedColumns = [
//       "position",
//       ...this.docSubmissionColumnConfig.map((col) => col.id),
//       "View",
//       "Errors",
//       "Action",
//     ];

//     // Standard columns (same for all tabs)
//     this.displayedReviewTeamColumns = ["contact_name", "perm_desc"];
//     this.displayedstageHistoryColumns = [
//       "rvw_stage",
//       "start_dt",
//       "end_dt",
//       "compl_by",
//       "reason",
//       "view",
//     ];
//   }

//   updateFieldLabels(): void {
//     // Update field labels based on tab configuration
//     if (this.currentTabConfig?.fieldLabels) {
//       // Create a copy of visitSelectedData with updated labels
//       this.visitSelectedData = {
//         ...this.visitSelectedData,
//         _displayLabels: this.currentTabConfig.fieldLabels,
//       };
//     }
//   }

//   async bindFormDetails() {
//     // Load common data
//     await this.getAgyUserLup();
//     await this.getPGMMDERoleTypeLupInfo();
//     await this.getPgmRoleTypeLupInfo();
//     await this.getAssignSchedUsersLup();

//     // Load tab-specific data
//     await this.getTabSpecificData();

//     // Load common UI data
//     await this.getConsNextStageStatus();

//     this.showSpinner = false;
//   }

//   async getTabSpecificData(): Promise<void> {
//     // Use tab-specific API endpoints or defaults
//     const endpoints = this.currentTabConfig?.endpoints || {};

//     // Load tab-specific data
//     await Promise.all([
//       this.getNotificationInfo(endpoints.notificationInfo),
//       this.getMDEReviewTeamInfo(endpoints.mdeReviewTeam),
//       this.getSchedDocs(endpoints.schedDocs),
//       this.getConsSubRecipientRvwStatus(endpoints.reviewStatus),
//       this.getConsRvwDocInfo(endpoints.reviewDocs),
//       this.getReviewTeam(endpoints.reviewTeam),
//       this.getStageHistory(endpoints.stageHistory),
//     ]);
//   }

//   getNotificationInfo(endpoint?: string) {
//     const apiEndpoint =
//       endpoint ||
//       "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo.json";

//     const payload = {
//       grantPgmId: 570,
//       rvwType: this.visitSelectedData?.rvw_type,
//       agencyId: this.visitSelectedData?.agency_id,
//       grantPgm: "",
//       subRecCd: this.visitSelectedData?.sub_rec_cd,
//       subRvwId: this.visitSelectedData?.sub_rvw_id,
//       rvwStage: "SCHED",
//       roleCls: "G",
//       roleInd: "N",
//       authSrc: "S",
//       option: "S",
//     };

//     this.showSpinner = true;

//     this.httpClient
//       .get(apiEndpoint)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.notificationInfo.data = res[0].map((x: any) => {
//               let isNewContact =
//                 this.agyUsers.filter(
//                   (element: any) => element.user_id == x.user_id
//                 )?.length == 0 || x.user_id == 0;
//               return {
//                 ...x,
//                 select: false,
//                 pri_ind: x.pri_ind == "P" ? true : false,
//                 user_status:
//                   x.user_status == "A" && x.user_id != 0 ? true : false,
//                 chk_ind: x.chk_ind == "True" ? true : false,
//                 training_info: x.training_info == "True" ? true : false,
//                 isNewContact: isNewContact,
//                 role_name:
//                   Object.keys(x.role_name)?.length == 0 ? "" : x.role_name,
//               };
//             });
//             setTimeout(
//               () =>
//                 (this.notificationInfo.paginator = this.notificationpaginator)
//             );
//           }
//           this.showSpinner = false;
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load notification info");
//         }
//       );
//   }

//   getMDEReviewTeamInfo(endpoint?: string) {
//     const apiEndpoint =
//       endpoint ||
//       "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-1.json";

//     const payload = {
//       grantPgmId: 570,
//       rvwType: this.visitSelectedData?.rvw_type,
//       agencyId: this.visitSelectedData?.agency_id,
//       grantPgm: "",
//       subRecCd: this.visitSelectedData?.sub_rec_cd,
//       subRvwId: this.visitSelectedData?.sub_rvw_id,
//       rvwStage: "SCHED",
//       roleCls: "A",
//       roleInd: "R",
//       authSrc: "S",
//       option: "S",
//     };

//     this.showSpinner = true;
//     this.httpClient
//       .get(apiEndpoint)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.MDERvwTeamInfo.data = res[0];
//             setTimeout(
//               () => (this.MDERvwTeamInfo.paginator = this.mdereviewaginator)
//             );
//             this.showSpinner = false;
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load MDE review team info");
//         }
//       );
//   }

//   getSchedDocs(endpoint?: string) {
//     const apiEndpoint =
//       endpoint ||
//       "assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo.json";

//     const payload = {
//       grantPgmId: 570,
//       agencyId: this.visitSelectedData?.agency_id,
//       subRvwId: this.visitSelectedData?.sub_rvw_id,
//       offCd: "",
//       rvwType: this.visitSelectedData?.rvw_type,
//       pcInd: this.visitSelectedData?.p_c_ind,
//       option: this.isAddOrEdit ? "S" : "R",
//     };

//     this.showSpinner = true;
//     this.httpClient
//       .get(apiEndpoint)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.responseDocumentData.data = res[0].map((x: any) => {
//               return {
//                 ...x,
//                 select: false,
//                 previewForm: x.form_id != 0 || x.FlexFormPDFTemplateID != 0,
//                 chk_ind: x.chk_ind == "Y" ? true : false,
//                 isUserTouched: false,
//               };
//             });
//             setTimeout(
//               () =>
//                 (this.responseDocumentData.paginator = this.doclistpaginator)
//             );
//           }
//           this.showSpinner = false;
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load schedule documents");
//         }
//       );
//   }

//   // Update other methods to accept optional endpoint parameters
//   getConsSubRecipientRvwStatus(endpoint?: string) {
//     const apiEndpoint =
//       endpoint ||
//       "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus.json";

//     // ... existing implementation with apiEndpoint
//   }

//   getConsRvwDocInfo(endpoint?: string) {
//     const apiEndpoint =
//       endpoint || "assets/api-data/ConsolidatedReview/GetConsRvwDocInfo.json";

//     // ... existing implementation with apiEndpoint
//   }

//   getReviewTeam(endpoint?: string) {
//     const apiEndpoint =
//       endpoint || "assets/api-data/ConsolidatedReview/GetConsReviewTeam.json";

//     this.showSpinner = true;
//     this.httpClient
//       .get(apiEndpoint)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.reviewTeamList = new MatTableDataSource(
//               this.sharedService.updateEmptyObjToNull(res[0])
//             );
//             setTimeout(
//               () => (this.reviewTeamList.paginator = this.reviewTeamPaginator)
//             );
//             this.showSpinner = false;
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load review team");
//         }
//       );
//   }

//   getStageHistory(endpoint?: string) {
//     const apiEndpoint =
//       endpoint ||
//       "assets/api-data/ConsolidatedReview/GetConsReviewStageHistory.json";

//     this.showSpinner = true;
//     this.httpClient
//       .get(apiEndpoint)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.stageHistoryList = new MatTableDataSource(
//               this.sharedService.updateEmptyObjToNull(res[0])
//             );
//             setTimeout(
//               () =>
//                 (this.stageHistoryList.paginator = this.stageHistoryPaginator)
//             );
//             this.cd.detectChanges();
//             this.showSpinner = false;
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load stage history");
//         }
//       );
//   }

//   // Keep existing common lookup methods
//   getAgyUserLup(element?: any) {
//     let payload = {
//       grantPgmId: 570,
//       agencyId: this.visitSelectedData?.agency_id,
//       userName: "",
//       flName: "",
//       pcRel: "P",
//       pcInd: "X",
//       orderBy: "f_l_name",
//     };
//     this.showSpinner = true;
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/GetConsAgyUserLup.json")
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((res: any) => {
//         if (res != null) {
//           this.agyUsers = res[0];
//           this.showSpinner = false;
//         }
//       });
//   }

//   getPGMMDERoleTypeLupInfo() {
//     let payload = {
//       grantPgmId: 570,
//       rvwType: this.visitSelectedData?.rvw_type,
//       roleType: "",
//       roleName: "",
//       rvwStage: "",
//       roleCls: "A",
//       roleInd: "R",
//       subRvwId: "0",
//       option: "S",
//       orderBy: "role_name",
//     };
//     this.showSpinner = true;
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/GetConsPgmRoleTypeLup.json")
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.pgmMDERoleTypes = res[0];
//             this.showSpinner = false;
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load MDE role types");
//         }
//       );
//   }

//   getPgmRoleTypeLupInfo() {
//     let payload = {
//       grantPgmId: 570,
//       rvwType: this.visitSelectedData?.rvw_type,
//       roleType: "",
//       roleName: "",
//       rvwStage: "SCHED",
//       roleCls: "G",
//       roleInd: "N",
//       subRvwId: "0",
//       option: "S",
//       orderBy: "role_name",
//     };
//     this.showSpinner = true;
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/GetConsPgmRoleTypeLup-1.json")
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.pgmRoleTypes = res[0];
//             this.showSpinner = false;
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load program role types");
//         }
//       );
//   }

//   getAssignSchedUsersLup() {
//     let payload = {
//       grantPgmId: 570,
//       userName: "",
//       contactName: "",
//       orderBy: "contact_name",
//       authInd: "S",
//       offCd: "",
//     };
//     this.showSpinner = true;
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/GetConsAssignSchedUsersLup.json")
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             this.assignSchedUsers = res[0];
//             this.showSpinner = false;
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load scheduled users");
//         }
//       );
//   }

//   getConsNextStageStatus() {
//     this.nextStageList = [];
//     this.nextStageList.push({ stage_stat: "", stat_desc: "Please Select" });
//     let payload = {
//       wfcd: "ZEFBR5",
//       rvwStage: this.visitSelectedData?.rvw_stage,
//       stageStat: "P",
//       option: "P",
//     };

//     this.showSpinner = true;
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/GetConsNextStageStatus.json")
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (res: any) => {
//           if (res != null && res[0].length > 0) {
//             res[0].forEach((element) => {
//               this.nextStageList.push(element);
//             });
//             this.showSpinner = false;
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//           this.handleError(error, "Failed to load next stage status");
//         }
//       );
//   }

//   // Helper method for error handling
//   private handleError(error: any, message: string) {
//     this.showSpinner = false;
//     console.error(`${message}:`, error);
//     this.toastrService.error(message, "Error");
//   }

//   // Update existing methods to include tab context
//   saveVisitorDetails() {
//     // Include tab ID in save payload
//     const saveData = {
//       tabId: this.currentTabId,
//       tabTitle: this.currentTabConfig?.title,
//       ...this.visitSelectedData,
//       // Include other data as needed
//     };

//     // Implement save logic
//     console.log("Saving data for tab:", this.currentTabId, saveData);
//   }

//   // Add methods for tab switching if needed
//   switchTab(tabId: TabId): void {
//     this.currentTabId = tabId;
//     this.loadTabConfiguration();
//     this.getTabSpecificData();
//   }

//   // Keep all other existing methods (addNewNotify, addNewMDERvw, etc.)
//   addNewNotify() {
//     let newNotify = JSON.parse(JSON.stringify(this.newInfo));
//     this.notificationInfo.data.push(newNotify);
//     this.notificationInfo._updateChangeSubscription();
//   }

//   addNewMDERvw() {
//     let newInfo = JSON.parse(JSON.stringify(this.newInfo));
//     this.MDERvwTeamInfo.data.push(newInfo);
//     this.MDERvwTeamInfo._updateChangeSubscription();
//   }

//   // ... (keep all other existing methods from your original code)
//   // Make sure to add tab context where appropriate

//   // Example: Update popup methods to include tab context
//   openConsolidatedReviewPopup(event: any, Mode: any, pageName: any) {
//     const dialogRef = this.dialog.open(ConsolidatedReviewPopupcomponent, {
//       maxWidth: "100vw",
//       maxHeight: "100vh",
//       width: "80%",
//       height: "80%",
//       data: {
//         pageName: pageName,
//         mode: Mode,
//         headerName: pageName == "viewEmails" ? "Email Log" : "Global Comments",
//         emailData: event,
//         subRvwId: this.directorVisitSelectedID,
//         visitSelectedData: this.visitSelectedData,
//         currentTabId: this.currentTabId,
//         currentTabTitle: this.currentTabConfig?.title,
//       },
//       autoFocus: false,
//     });
//     dialogRef.afterClosed().subscribe(async (result) => {
//       if (result?.data == "submit") {
//         // Handle result with tab context
//       }
//     });
//   }

//   // Get field label for current tab
//   getFieldLabel(fieldName: string): string {
//     return (
//       this.currentTabConfig?.fieldLabels?.[fieldName] ||
//       this.getDefaultFieldLabel(fieldName)
//     );
//   }

//   private getDefaultFieldLabel(fieldName: string): string {
//     const defaultLabels: { [key: string]: string } = {
//       rvw_type_desc: "Review Type",
//       sub_rec_name: "District",
//       rvw_yr: "Review Year",
//       rvw_ref_no: "Review Ref. No",
//     };
//     return defaultLabels[fieldName] || fieldName;
//   }
// }

// // // ConsolidatedReviewDetails.component.ts
// // import {
// //   Component,
// //   OnInit,
// //   Input,
// //   Output,
// //   EventEmitter,
// //   ViewChild,
// //   OnDestroy,
// // } from "@angular/core";
// // import { MatDialog } from "@angular/material/dialog";
// // import { MatPaginator } from "@angular/material/paginator";
// // import { MatTableDataSource } from "@angular/material/table";
// // import { HttpClient } from "@angular/common/http";
// // import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
// // import { filter } from "rxjs/operators";
// // import { Subscription } from "rxjs";
// // import { TAB_CONFIGURATIONS, TabId } from "../consolidated-review-tab-config";

// // @Component({
// //   selector: "app-consolidatedreview-details",
// //   templateUrl: "./ConsolidatedReviewDetails.component.html",
// //   styleUrls: ["./ConsolidatedReviewDetails.component.scss"],
// // })
// // export class ConsolidatedReviewDetailsComponent implements OnInit, OnDestroy {
// //   @ViewChild("doclistpaginator") doclistpaginator: MatPaginator;
// //   @ViewChild("docSubmissionpaginator") docSubmissionpaginator: MatPaginator;
// //   @ViewChild("reviewTeamPaginator") reviewTeamPaginator: MatPaginator;
// //   @ViewChild("stageHistoryPaginator") stageHistoryPaginator: MatPaginator;

// //   @Input() visitSelectedData: any;
// //   @Input() currentTabId: TabId = "excessfundbal";
// //   @Output() emitTabData = new EventEmitter();
// //   @Output() emitEnhancedData = new EventEmitter();

// //   public showSpinner: boolean = false;
// //   public currentTabConfig: any;
// //   public detailsTitle: string = "Review Details";

// //   // Existing properties from your code
// //   public isAddOrEdit: boolean = false;
// //   public MDERvwTeamInfo: any = [];
// //   public notificationInfo: any = [];
// //   public responseDocumentData: any = [];
// //   public responseDocSubmissionData: any = [];
// //   public subRecipientRvwStatusInfo: any = [];
// //   public reviewTeamList: any = [];
// //   public stageHistoryList: any = [];

// //   // Column configurations
// //   public matMDERvwTeamColumnConfig: any[] = [];
// //   public displayedMDERvwTeamColumns: string[] = [];
// //   public matNotificationColumnConfig: any[] = [];
// //   public displayedNotificationColumns: string[] = [];
// //   public documentColumnConfig: any[] = [];
// //   public documentDisplayedColumns: string[] = [];
// //   public docSubmissionColumnConfig: any[] = [];
// //   public docSubmissionDisplayedColumns: string[] = [];
// //   public displayedReviewTeamColumns: string[] = ["contact_name", "perm_desc"];
// //   public displayedstageHistoryColumns: string[] = [
// //     "rvw_stage",
// //     "start_dt",
// //     "end_dt",
// //     "compl_by",
// //     "reason",
// //     "view",
// //   ];

// //   // Data sources
// //   public MDERvwTeamDataSource = new MatTableDataSource<any>([]);
// //   public notificationDataSource = new MatTableDataSource<any>([]);
// //   public documentDataSource = new MatTableDataSource<any>([]);
// //   public docSubmissionDataSource = new MatTableDataSource<any>([]);
// //   public reviewTeamDataSource = new MatTableDataSource<any>([]);
// //   public stageHistoryDataSource = new MatTableDataSource<any>([]);

// //   // Form data
// //   public pgmMDERoleTypes: any[] = [];
// //   public assignSchedUsers: any[] = [];
// //   public pgmRoleTypes: any[] = [];
// //   public agyUsers: any[] = [];
// //   public nextStageList: any[] = [];
// //   public selectedStage: string = "";

// //   // UI state
// //   public isDocSelectAll: boolean = false;

// //   private routerSubscription: Subscription;

// //   constructor(
// //     private httpClient: HttpClient,
// //     private router: Router,
// //     private activatedRoute: ActivatedRoute,
// //     public dialog: MatDialog
// //   ) {}

// //   ngOnInit() {
// //     this.loadTabConfiguration();
// //     this.initializeComponent();

// //     // Subscribe to route changes to handle tab context
// //     this.routerSubscription = this.router.events
// //       .pipe(filter((event) => event instanceof NavigationEnd))
// //       .subscribe(() => {
// //         this.handleRouteChange();
// //       });

// //     // Initial route handling
// //     this.handleRouteChange();
// //   }

// //   ngOnDestroy() {
// //     if (this.routerSubscription) {
// //       this.routerSubscription.unsubscribe();
// //     }
// //   }

// //   handleRouteChange(): void {
// //     // Get current tab ID from URL
// //     const urlSegments = this.router.url.split("/");

// //     // Find the consolidated review segment
// //     const consolidatedIndex = urlSegments.findIndex(
// //       (segment) => segment === "consolidatedreview"
// //     );

// //     if (consolidatedIndex !== -1) {
// //       // Look for tab ID after the consolidatedreview segment
// //       for (let i = consolidatedIndex + 1; i < urlSegments.length; i++) {
// //         const segment = urlSegments[i];
// //         if (segment && TAB_CONFIGURATIONS[segment as TabId]) {
// //           this.currentTabId = segment as TabId;
// //           this.loadTabConfiguration();
// //           this.loadTabSpecificData();
// //           break;
// //         }
// //       }
// //     }

// //     // Set default if not found
// //     if (!this.currentTabId || !TAB_CONFIGURATIONS[this.currentTabId]) {
// //       this.currentTabId = "excessfundbal";
// //       this.loadTabConfiguration();
// //       this.loadTabSpecificData();
// //     }
// //   }

// //   loadTabConfiguration(): void {
// //     this.currentTabConfig = TAB_CONFIGURATIONS[this.currentTabId];
// //     if (this.currentTabConfig) {
// //       this.detailsTitle = `${this.currentTabConfig.title} Review Details`;
// //       this.updateColumnConfigurations();
// //     }
// //   }

// //   updateColumnConfigurations(): void {
// //     // Update column configurations based on tab
// //     switch (this.currentTabId) {
// //       case "excessfundbal":
// //         this.matMDERvwTeamColumnConfig = [
// //           { id: "role_id", name: "MDE Role" },
// //           { id: "user_id", name: "MDE User" },
// //           { id: "chk_ind", name: "Check" },
// //         ];
// //         this.displayedMDERvwTeamColumns = [
// //           "role_id",
// //           "user_id",
// //           "chk_ind",
// //           "Action",
// //         ];

// //         this.matNotificationColumnConfig = [
// //           { id: "role_id", name: "Sub-Recipient Role" },
// //           { id: "user_id", name: "Sub-Recipient User" },
// //           { id: "role_email", name: "Email" },
// //           { id: "user_role", name: "User Role" },
// //           { id: "pri_ind", name: "Primary" },
// //           { id: "chk_ind", name: "Check" },
// //         ];
// //         this.displayedNotificationColumns = [
// //           "role_id",
// //           "user_id",
// //           "role_email",
// //           "user_role",
// //           "pri_ind",
// //           "chk_ind",
// //           "Action",
// //         ];
// //         break;

// //       case "ltclaimexcep":
// //         this.matMDERvwTeamColumnConfig = [
// //           { id: "role_id", name: "LT Claim Role" },
// //           { id: "user_id", name: "Claim Reviewer" },
// //           { id: "chk_ind", name: "Active" },
// //         ];
// //         this.displayedMDERvwTeamColumns = [
// //           "role_id",
// //           "user_id",
// //           "chk_ind",
// //           "Action",
// //         ];

// //         this.matNotificationColumnConfig = [
// //           { id: "role_id", name: "District Role" },
// //           { id: "user_id", name: "District Contact" },
// //           { id: "role_email", name: "Contact Email" },
// //           { id: "user_role", name: "Contact Type" },
// //           { id: "pri_ind", name: "Primary Contact" },
// //           { id: "chk_ind", name: "Notification" },
// //         ];
// //         this.displayedNotificationColumns = [
// //           "role_id",
// //           "user_id",
// //           "role_email",
// //           "user_role",
// //           "pri_ind",
// //           "chk_ind",
// //           "Action",
// //         ];
// //         break;

// //       // Add configurations for other tabs...
// //       default:
// //         // Default configuration
// //         this.matMDERvwTeamColumnConfig = [
// //           { id: "role_id", name: "Role" },
// //           { id: "user_id", name: "User" },
// //           { id: "chk_ind", name: "Check" },
// //         ];
// //         this.displayedMDERvwTeamColumns = [
// //           "role_id",
// //           "user_id",
// //           "chk_ind",
// //           "Action",
// //         ];

// //         this.matNotificationColumnConfig = [
// //           { id: "role_id", name: "Role" },
// //           { id: "user_id", name: "User" },
// //           { id: "role_email", name: "Email" },
// //           { id: "user_role", name: "Role Type" },
// //           { id: "pri_ind", name: "Primary" },
// //           { id: "chk_ind", name: "Check" },
// //         ];
// //         this.displayedNotificationColumns = [
// //           "role_id",
// //           "user_id",
// //           "role_email",
// //           "user_role",
// //           "pri_ind",
// //           "chk_ind",
// //           "Action",
// //         ];
// //     }

// //     // Document configurations (common for all tabs)
// //     this.documentColumnConfig = [
// //       { id: "doc_name", name: "Document Name" },
// //       { id: "doc_type", name: "Document Type" },
// //       { id: "upload_date", name: "Upload Date" },
// //       { id: "uploaded_by", name: "Uploaded By" },
// //       { id: "chk_ind", name: "Select" },
// //       { id: "previewForm", name: "Preview" },
// //     ];
// //     this.documentDisplayedColumns = [
// //       "doc_name",
// //       "doc_type",
// //       "upload_date",
// //       "uploaded_by",
// //       "chk_ind",
// //       "previewForm",
// //       "Action",
// //     ];

// //     this.docSubmissionColumnConfig = [
// //       { id: "doc_name", name: "Document Name" },
// //       { id: "submission_date", name: "Submission Date" },
// //       { id: "status", name: "Status" },
// //       { id: "doc_completed", name: "Completed" },
// //       { id: "help_txt", name: "Help" },
// //     ];
// //     this.docSubmissionDisplayedColumns = [
// //       "position",
// //       "doc_name",
// //       "submission_date",
// //       "status",
// //       "doc_completed",
// //       "help_txt",
// //       "View",
// //       "Errors",
// //       "Action",
// //     ];
// //   }

// //   initializeComponent(): void {
// //     if (!this.visitSelectedData) {
// //       this.visitSelectedData = {};
// //     }

// //     // Set isAddOrEdit based on user permissions
// //     this.isAddOrEdit = true; // You can implement actual permission checking

// //     this.loadInitialData();
// //   }

// //   loadInitialData(): void {
// //     this.showSpinner = true;

// //     // Load MDE Role Types
// //     this.httpClient
// //       .get("assets/api-data/ConsolidatedReview/MDERoleTypes.json")
// //       .subscribe((res: any) => {
// //         this.pgmMDERoleTypes = res || [];
// //       });

// //     // Load Scheduled Users
// //     this.httpClient
// //       .get("assets/api-data/ConsolidatedReview/AssignSchedUsers.json")
// //       .subscribe((res: any) => {
// //         this.assignSchedUsers = res || [];
// //       });

// //     // Load PGM Role Types
// //     this.httpClient
// //       .get("assets/api-data/ConsolidatedReview/PgmRoleTypes.json")
// //       .subscribe((res: any) => {
// //         this.pgmRoleTypes = res || [];
// //       });

// //     // Load Agency Users
// //     this.httpClient
// //       .get("assets/api-data/ConsolidatedReview/AgencyUsers.json")
// //       .subscribe((res: any) => {
// //         this.agyUsers = res || [];
// //       });

// //     // Load Next Stage List
// //     this.httpClient
// //       .get("assets/api-data/ConsolidatedReview/NextStageList.json")
// //       .subscribe((res: any) => {
// //         this.nextStageList = res || [];
// //       });

// //     // Load tab-specific data
// //     this.loadTabSpecificData();
// //   }

// //   loadTabSpecificData(): void {
// //     // Load data specific to current tab
// //     const tabEndpoint = this.getTabSpecificEndpoint();

// //     if (tabEndpoint) {
// //       this.httpClient.get(tabEndpoint).subscribe(
// //         (res: any) => {
// //           this.processTabData(res);
// //           this.showSpinner = false;
// //         },
// //         (error) => {
// //           this.showSpinner = false;
// //           console.error(`Error loading ${this.currentTabId} data:`, error);
// //         }
// //       );
// //     } else {
// //       // Load default data
// //       this.loadDefaultData();
// //     }
// //   }

// //   getTabSpecificEndpoint(): string {
// //     switch (this.currentTabId) {
// //       case "excessfundbal":
// //         return "assets/api-data/ConsolidatedReview/ExcessFundBalDetails.json";
// //       case "ltclaimexcep":
// //         return "assets/api-data/ConsolidatedReview/LTClaimDetails.json";
// //       case "contrpage":
// //         return "assets/api-data/ConsolidatedReview/ContractDetails.json";
// //       case "10cent":
// //         return "assets/api-data/ConsolidatedReview/TenCentDetails.json";
// //       case "cnpcontr":
// //         return "assets/api-data/ConsolidatedReview/CNPContractDetails.json";
// //       case "clswallinv":
// //         return "assets/api-data/ConsolidatedReview/ClosedWallDetails.json";
// //       case "psacontrrvw":
// //         return "assets/api-data/ConsolidatedReview/PSAContractDetails.json";
// //       case "31n6beyondhir":
// //         return "assets/api-data/ConsolidatedReview/ThirtyOneN6Details.json";
// //       case "privschconsult":
// //         return "assets/api-data/ConsolidatedReview/PrivateSchoolDetails.json";
// //       case "falseel":
// //         return "assets/api-data/ConsolidatedReview/FalseELDetails.json";
// //       default:
// //         return "assets/api-data/ConsolidatedReview/DefaultDetails.json";
// //     }
// //   }

// //   processTabData(data: any): void {
// //     if (data) {
// //       // Process MDE Review Team Info
// //       if (data.MDERvwTeamInfo) {
// //         this.MDERvwTeamInfo = data.MDERvwTeamInfo;
// //         this.MDERvwTeamDataSource = new MatTableDataSource(this.MDERvwTeamInfo);
// //       }

// //       // Process Notification Info
// //       if (data.notificationInfo) {
// //         this.notificationInfo = data.notificationInfo;
// //         this.notificationDataSource = new MatTableDataSource(
// //           this.notificationInfo
// //         );
// //       }

// //       // Process Document Data
// //       if (data.documents) {
// //         this.responseDocumentData = data.documents;
// //         this.documentDataSource = new MatTableDataSource(
// //           this.responseDocumentData
// //         );
// //         setTimeout(() => {
// //           this.documentDataSource.paginator = this.doclistpaginator;
// //         });
// //       }

// //       // Process Document Submission Data
// //       if (data.docSubmissions) {
// //         this.responseDocSubmissionData = data.docSubmissions;
// //         this.docSubmissionDataSource = new MatTableDataSource(
// //           this.responseDocSubmissionData
// //         );
// //         setTimeout(() => {
// //           this.docSubmissionDataSource.paginator = this.docSubmissionpaginator;
// //         });
// //       }

// //       // Process Review Status Info
// //       if (data.reviewStatus) {
// //         this.subRecipientRvwStatusInfo = data.reviewStatus;
// //       }

// //       // Process Review Team List
// //       if (data.reviewTeam) {
// //         this.reviewTeamList = data.reviewTeam;
// //         this.reviewTeamDataSource = new MatTableDataSource(this.reviewTeamList);
// //         setTimeout(() => {
// //           this.reviewTeamDataSource.paginator = this.reviewTeamPaginator;
// //         });
// //       }

// //       // Process Stage History
// //       if (data.stageHistory) {
// //         this.stageHistoryList = data.stageHistory;
// //         this.stageHistoryDataSource = new MatTableDataSource(
// //           this.stageHistoryList
// //         );
// //         setTimeout(() => {
// //           this.stageHistoryDataSource.paginator = this.stageHistoryPaginator;
// //         });
// //       }

// //       // Update visitSelectedData with tab-specific data
// //       if (data.reviewInfo) {
// //         this.visitSelectedData = {
// //           ...this.visitSelectedData,
// //           ...data.reviewInfo,
// //           currentTabId: this.currentTabId,
// //           currentTabTitle: this.currentTabConfig?.title || "Review",
// //         };
// //       }
// //     }
// //   }

// //   loadDefaultData(): void {
// //     // Load default JSON data
// //     const defaultEndpoints = [
// //       "assets/api-data/ConsolidatedReview/MDERvwTeamInfo.json",
// //       "assets/api-data/ConsolidatedReview/NotificationInfo.json",
// //       "assets/api-data/ConsolidatedReview/Documents.json",
// //       "assets/api-data/ConsolidatedReview/DocSubmissions.json",
// //       "assets/api-data/ConsolidatedReview/ReviewStatus.json",
// //       "assets/api-data/ConsolidatedReview/ReviewTeam.json",
// //       "assets/api-data/ConsolidatedReview/StageHistory.json",
// //     ];

// //     this.httpClient.get(defaultEndpoints[0]).subscribe((res1: any) => {
// //       this.MDERvwTeamInfo = res1 || [];
// //       this.MDERvwTeamDataSource = new MatTableDataSource(this.MDERvwTeamInfo);
// //     });

// //     this.httpClient.get(defaultEndpoints[1]).subscribe((res2: any) => {
// //       this.notificationInfo = res2 || [];
// //       this.notificationDataSource = new MatTableDataSource(
// //         this.notificationInfo
// //       );
// //     });

// //     this.httpClient.get(defaultEndpoints[2]).subscribe((res3: any) => {
// //       this.responseDocumentData = res3 || [];
// //       this.documentDataSource = new MatTableDataSource(
// //         this.responseDocumentData
// //       );
// //       setTimeout(() => {
// //         this.documentDataSource.paginator = this.doclistpaginator;
// //       });
// //     });

// //     this.httpClient.get(defaultEndpoints[3]).subscribe((res4: any) => {
// //       this.responseDocSubmissionData = res4 || [];
// //       this.docSubmissionDataSource = new MatTableDataSource(
// //         this.responseDocSubmissionData
// //       );
// //       setTimeout(() => {
// //         this.docSubmissionDataSource.paginator = this.docSubmissionpaginator;
// //       });
// //     });

// //     this.httpClient.get(defaultEndpoints[4]).subscribe((res5: any) => {
// //       this.subRecipientRvwStatusInfo = res5 || [];
// //     });

// //     this.httpClient.get(defaultEndpoints[5]).subscribe((res6: any) => {
// //       this.reviewTeamList = res6 || [];
// //       this.reviewTeamDataSource = new MatTableDataSource(this.reviewTeamList);
// //       setTimeout(() => {
// //         this.reviewTeamDataSource.paginator = this.reviewTeamPaginator;
// //       });
// //     });

// //     this.httpClient.get(defaultEndpoints[6]).subscribe((res7: any) => {
// //       this.stageHistoryList = res7 || [];
// //       this.stageHistoryDataSource = new MatTableDataSource(
// //         this.stageHistoryList
// //       );
// //       setTimeout(() => {
// //         this.stageHistoryDataSource.paginator = this.stageHistoryPaginator;
// //       });
// //       this.showSpinner = false;
// //     });
// //   }

// //   // Existing methods from your code (adapted for tab context)
// //   saveVisitorDetails(): void {
// //     this.showSpinner = true;

// //     const payload = {
// //       tabId: this.currentTabId,
// //       visitData: this.visitSelectedData,
// //       MDEInfo: this.MDERvwTeamInfo,
// //       notificationInfo: this.notificationInfo,
// //       documents: this.responseDocumentData,
// //       docSubmissions: this.responseDocSubmissionData,
// //       reviewStatus: this.subRecipientRvwStatusInfo,
// //     };

// //     // Simulate API call
// //     setTimeout(() => {
// //       this.showSpinner = false;
// //       console.log(`Saving ${this.currentTabId} details:`, payload);

// //       // Emit enhanced data
// //       this.emitEnhancedData.emit({
// //         ...payload,
// //         saved: true,
// //         timestamp: new Date(),
// //         tabTitle: this.currentTabConfig?.title,
// //       });

// //       // Show success message
// //       alert(
// //         `${
// //           this.currentTabConfig?.title || "Review"
// //         } details saved successfully!`
// //       );
// //     }, 1000);
// //   }

// //   addNewMDERvw(): void {
// //     const newMDE = {
// //       role_id: "",
// //       user_id: "",
// //       chk_ind: false,
// //       isNew: true,
// //     };

// //     this.MDERvwTeamInfo.push(newMDE);
// //     this.MDERvwTeamDataSource.data = [...this.MDERvwTeamInfo];
// //   }

// //   addNewNotify(): void {
// //     const newNotification = {
// //       role_id: "",
// //       user_id: "",
// //       role_email: "",
// //       user_role: "",
// //       pri_ind: false,
// //       chk_ind: false,
// //       isNewContact: false,
// //       isNew: true,
// //     };

// //     this.notificationInfo.push(newNotification);
// //     this.notificationDataSource.data = [...this.notificationInfo];
// //   }

// //   onChangeRvwRole(event: any, element: any): void {
// //     element.role_id = event.value;
// //   }

// //   onChangeReviewer(event: any, element: any): void {
// //     element.user_id = event.value;
// //   }

// //   onChangeRoleType(event: any, element: any): void {
// //     element.role_id = event.value;
// //   }

// //   onChangeUser(event: any, element: any): void {
// //     element.user_id = event.value;
// //   }

// //   changePrimaryContact(fieldId: string, element: any): void {
// //     if (fieldId === "pri_ind" && element.pri_ind) {
// //       // If setting as primary, unset all others
// //       this.notificationInfo.forEach((item: any) => {
// //         if (item !== element) {
// //           item.pri_ind = false;
// //         }
// //       });
// //       this.notificationDataSource.data = [...this.notificationInfo];
// //     }
// //   }

// //   updateDatasource(): void {
// //     this.notificationDataSource.data = [...this.notificationInfo];
// //   }

// //   selectAllCheckBox(event: any, type: string, isSelectAll: boolean): void {
// //     if (type === "docSearch") {
// //       if (isSelectAll) {
// //         this.responseDocumentData.forEach((item: any) => {
// //           item.chk_ind = event.checked;
// //         });
// //         this.documentDataSource.data = [...this.responseDocumentData];
// //       }
// //     }
// //   }

// //   downloadPreviewForm(element: any): void {
// //     console.log("Download preview form:", element);
// //     // Implement download logic
// //   }

// //   onSelectionStageChanged(event: any, data: any): void {
// //     this.selectedStage = data.stage_stat;
// //   }

// //   promoteNextStage(): void {
// //     if (this.selectedStage) {
// //       this.showSpinner = true;

// //       // Simulate API call
// //       setTimeout(() => {
// //         this.showSpinner = false;
// //         console.log(
// //           `Promoting ${this.currentTabId} to stage:`,
// //           this.selectedStage
// //         );
// //         alert(
// //           `${this.currentTabConfig?.title || "Review"} promoted to next stage!`
// //         );
// //       }, 1000);
// //     }
// //   }

// //   openConsolidatedReviewPopup(
// //     event: any,
// //     mode: string,
// //     pageName: string
// //   ): void {
// //     // This would open a dialog - implementation depends on your dialog service
// //     console.log(`Opening ${pageName} popup for ${this.currentTabId}`);
// //   }

// //   openConfirmDeletePopup(element: any, type: string, index?: number): void {
// //     if (confirm(`Are you sure you want to delete this ${type}?`)) {
// //       switch (type) {
// //         case "mdervwTeam":
// //           this.MDERvwTeamInfo.splice(index, 1);
// //           this.MDERvwTeamDataSource.data = [...this.MDERvwTeamInfo];
// //           break;
// //         case "notification":
// //           this.notificationInfo.splice(index, 1);
// //           this.notificationDataSource.data = [...this.notificationInfo];
// //           break;
// //         case "document":
// //           // Handle document deletion
// //           break;
// //       }
// //     }
// //   }

// //   goBackToSearch(): void {
// //     this.emitTabData.emit({
// //       selectedPage: "selectVisit",
// //       showDetails: false,
// //     });
// //   }

// //   getCurrentTabTitle(): string {
// //     return this.currentTabConfig?.title || "Review";
// //   }

// //   getTabSpecificFieldLabel(field: string): string {
// //     const fieldLabels: any = {
// //       excessfundbal: {
// //         rvw_type_desc: "Excess Fund Balance Review Type",
// //         sub_rec_name: "District",
// //         rvw_yr: "Review Year",
// //       },
// //       ltclaimexcep: {
// //         rvw_type_desc: "LT Claim Exception Type",
// //         sub_rec_name: "Claim District",
// //         rvw_yr: "Claim Year",
// //       },
// //       contrpage: {
// //         rvw_type_desc: "Contract Review Type",
// //         sub_rec_name: "Contract Entity",
// //         rvw_yr: "Contract Year",
// //       },
// //       // Add other tabs...
// //     };

// //     return fieldLabels[this.currentTabId]?.[field] || field;
// //   }
// // }

// // // import { HttpClient } from "@angular/common/http";
// // // import {
// // //   ChangeDetectorRef,
// // //   Component,
// // //   EventEmitter,
// // //   Input,
// // //   OnInit,
// // //   Output,
// // //   ViewChild,
// // // } from "@angular/core";
// // // import { MatDialog } from "@angular/material/dialog";
// // // import { MatPaginator } from "@angular/material/paginator";
// // // import { MatTable, MatTableDataSource } from "@angular/material/table";
// // // import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
// // // import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
// // // import { SharedService } from "src/app/shared/services/shared.service";
// // // import { ConsolidatedReviewPopupcomponent } from "../ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";
// // // import { ToastrService } from "ngx-toastr";
// // // import { PopUpComponent } from "src/app/shared/PopUp/PopUp.component";
// // // import { TAB_CONFIGURATIONS, TabId } from "../consolidated-review-tab-config";

// // // @Component({
// // //   selector: "app-consolidatedreview-details",
// // //   templateUrl: "./ConsolidatedReviewDetails.component.html",
// // //   styleUrls: ["./ConsolidatedReviewDetails.component.scss"],
// // // })
// // // export class ConsolidatedReviewDetailsComponent implements OnInit {
// // //   constructor(
// // //     public dialog: MatDialog,
// // //     private httpClient: HttpClient,
// // //     private programAdministrationService: ProgramAdministrationService,
// // //     private consolidatedReviewService: ConsolidatedReviewService,
// // //     private sharedService: SharedService,
// // //     private toastrService: ToastrService,
// // //     private cd: ChangeDetectorRef
// // //   ) {}

// // //   @ViewChild("reviewTeamPaginator") reviewTeamPaginator: MatPaginator;
// // //   @ViewChild("stageHistoryPaginator") stageHistoryPaginator: MatPaginator;
// // //   @ViewChild("table") table: MatTable<any>;
// // //   @ViewChild("contactTable") contactTable: MatTable<any>;
// // //   @ViewChild("paginator") paginator: MatPaginator;
// // //   @ViewChild("mdereviewaginator") mdereviewaginator: MatPaginator;
// // //   @ViewChild("notificationpaginator") notificationpaginator: MatPaginator;
// // //   @ViewChild("doclistpaginator") doclistpaginator: MatPaginator;
// // //   @ViewChild("docSubmissionpaginator") docSubmissionpaginator: MatPaginator;

// // //   @Input() visitSelectedData: any = {};
// // //   @Input() currentTabId: TabId = "excessfundbal";
// // //   @Output() emitTabData = new EventEmitter();
// // //   @Output() emitEnhancedData = new EventEmitter();

// // //   public showSpinner: boolean;
// // //   public initialResponseData: any;

// // //   public userDetails: any;
// // //   public responseMDEContactsData = new MatTableDataSource();
// // //   public responseSubRecContactsData = new MatTableDataSource();
// // //   public responseDocSubmissionData = new MatTableDataSource();
// // //   // public pgmMDERoleTypes: any[] = [];
// // //   // public assignSchedUsers: any[] = [];
// // //   // public pgmRoleTypes: any[] = [];
// // //   // public agyUsers: any[] = [];

// // //   public reviewTeamList: any = [];
// // //   public stageHistoryList: any = [];
// // //   public scheduleContactsList: any = [];
// // //   public scheduleRoleTypeList: any = [];
// // //   public initialScheduleRoleTypeList: any = [];
// // //   public scheduleUsersList: any = [];
// // //   public initialScheduleUsersList: any = [];
// // //   public directorVisitSelectedID: number;

// // //   public notificationInfo = new MatTableDataSource();
// // //   public MDERvwTeamInfo = new MatTableDataSource();
// // //   public pgmMDERoleTypes: any[] = [];
// // //   public assignSchedUsers: any[] = [];
// // //   public pgmRoleTypes: any[] = [];
// // //   public agyUsers: any[] = [];
// // //   public nextStageStatusList: any[] = [];
// // //   public selectedDocumentData: any;
// // //   public responseDocumentData = new MatTableDataSource();
// // //   public subRecipientRvwStatusInfo: any = [];

// // //   public schedDocFileData: any = [];
// // //   public isDocSelectAll: boolean = false;
// // //   public selectedStage: any = "";
// // //   public selectedReason: any = 0;

// // //   public reasonForDeleteList: any = [{ id: 0, itemName: "Please Select" }];
// // //   public satusList: any = [{ id: 0, itemName: "Please Select" }];
// // //   public nextStageList: any = [];
// // //   public isAddOrEdit: boolean = false;

// // //   public displayedReviewTeamColumns = ["contact_name", "perm_desc"];
// // //   public displayedstageHistoryColumns = [
// // //     "rvw_stage",
// // //     "start_dt",
// // //     "end_dt",
// // //     "compl_by",
// // //     "reason",
// // //     "view",
// // //   ];
// // //   public displayedColumnsScheduleContacts = [
// // //     "role_desc",
// // //     "role_name",
// // //     "delete",
// // //   ];

// // //   public matNotificationColumnConfig = [
// // //     { id: "role_id", name: "Contact Type" },
// // //     { id: "user_id", name: "Contact Name" },
// // //     { id: "role_email", name: "Email" },
// // //     { id: "pri_ind", name: "Primary" },
// // //     { id: "chk_ind", name: "Sel." },
// // //   ];

// // //   public displayedNotificationColumns = [
// // //     "role_id",
// // //     "user_id",
// // //     "role_email",
// // //     "pri_ind",
// // //     "chk_ind",
// // //     "Action",
// // //   ];

// // //   public matMDERvwTeamColumnConfig = [
// // //     { id: "role_id", name: "Review Role" },
// // //     { id: "user_id", name: "Reviewer Name" },
// // //     { id: "chk_ind", name: "Sel." },
// // //   ];
// // //   public displayedMDERvwTeamColumns = [
// // //     "role_id",
// // //     "user_id",
// // //     "chk_ind",
// // //     "Action",
// // //   ];

// // //   public newInfo = {
// // //     sub_role_id: 0,
// // //     role_id: 0,
// // //     role_type: "",
// // //     role_desc: "",
// // //     user_id: 0,
// // //     role_name: "",
// // //     role_email: "",
// // //     role_phone: "",
// // //     user_status: "0",
// // //     user_role: "",
// // //     notify_fmt: "",
// // //     pri_ind: false,
// // //     chk_ind: false,
// // //     training_info: false,
// // //     select: false,
// // //   };

// // //   public documentColumnConfig = [
// // //     {
// // //       id: "sub_desc",
// // //       name: "Submission Category",
// // //     },
// // //     {
// // //       id: "rec_desc",
// // //       name: "Document Type",
// // //     },
// // //     {
// // //       id: "doc_name",
// // //       name: "Document Name",
// // //     },
// // //     {
// // //       id: "doc_cat_desc",
// // //       name: "Document Category",
// // //     },
// // //     {
// // //       id: "chk_ind",
// // //       name: "Select",
// // //     },
// // //     {
// // //       id: "previewForm",
// // //       name: "Preview Form",
// // //     },
// // //   ];

// // //   public documentDisplayedColumns = [
// // //     "sub_desc",
// // //     "rec_desc",
// // //     "doc_name",
// // //     "doc_cat_desc",
// // //     "chk_ind",
// // //     "previewForm",
// // //     "Action",
// // //   ];

// // //   public docSubmissionColumnConfig = [
// // //     { id: "rec_desc", name: "Document Type" },
// // //     { id: "doc_name", name: "Document Name" },
// // //     { id: "doc_cat_desc", name: "Document Category" },
// // //     { id: "help_txt", name: "Instructions" },
// // //     { id: "doc_completed", name: "Status" },
// // //   ];

// // //   public docSubmissionDisplayedColumns = [
// // //     "position",
// // //     "rec_desc",
// // //     "doc_name",
// // //     "doc_cat_desc",
// // //     "help_txt",
// // //     "doc_completed",
// // //     "View",
// // //     "Errors",
// // //     "Action",
// // //   ];

// // //   public matSubRecContactColumnConfig = [
// // //     { id: "role_id", name: "Contact Type" },
// // //     { id: "user_id", name: "Contact Name" },
// // //     { id: "role_email", name: "Email" },
// // //     { id: "pri_ind", name: "Primary" },
// // //     { id: "select", name: "Sel." },
// // //   ];
// // //   public displayedSubRecContactsColumns = [
// // //     "role_id",
// // //     "user_id",
// // //     "role_email",
// // //     "pri_ind",
// // //     "select",
// // //   ];

// // //   public matSchdDocColumnConfig = [
// // //     { id: "role_id", name: "Submission Category" },
// // //     { id: "user_id", name: "Document Type" },
// // //     { id: "role_email", name: "Document Name" },
// // //     { id: "pri_ind", name: "Document Category" },
// // //     { id: "select", name: "Sel." },
// // //     { id: "pri_ind", name: "Preview Form" },
// // //   ];
// // //   public displayedSchdDocContactsColumns = [
// // //     "role_id",
// // //     "user_id",
// // //     "role_email",
// // //     "pri_ind",
// // //     "select",
// // //   ];

// // //   public matSchdSubColumnConfig = [
// // //     { id: "user_id", name: "Document Type" },
// // //     { id: "role_email", name: "Document Name" },
// // //     { id: "pri_ind", name: "Document Category" },
// // //     { id: "select", name: "Instructions" },
// // //     { id: "pri_ind", name: "Status" },
// // //     { id: "select", name: "View" },
// // //     { id: "pri_ind", name: "Errors" },
// // //   ];
// // //   public displayedSchdSubContactsColumns = [
// // //     "role_id",
// // //     "user_id",
// // //     "role_email",
// // //     "pri_ind",
// // //     "select",
// // //   ];

// // //   async ngOnInit() {
// // //     this.showSpinner = true;
// // //     this.userDetails = this.programAdministrationService.getUserDetails();
// // //     //this.isAddOrEdit = this.sharedService.checkIsAddOrEdit('ConsolRvw');
// // //     this.isAddOrEdit = true;
// // //     console.log(this.visitSelectedData);
// // //     this.directorVisitSelectedID = this.visitSelectedData?.sub_rvw_id;
// // //     this.bindFormDetails();
// // //   }

// // //   async bindFormDetails() {
// // //     this.getAgyUserLup();
// // //     this.getPGMMDERoleTypeLupInfo();
// // //     this.getPgmRoleTypeLupInfo();
// // //     this.getAssignSchedUsersLup();
// // //     this.getNotificationInfo();
// // //     this.getMDEReviewTeamInfo();
// // //     this.getSchedDocs();
// // //     this.getConsSubRecipientRvwStatus();
// // //     this.getConsRvwDocInfo();
// // //     this.getReviewTeam();
// // //     this.getStageHistory();
// // //     this.getConsNextStageStatus();
// // //     this.showSpinner = false;
// // //   }

// // //   addNewNotify() {
// // //     let newNotify = JSON.parse(JSON.stringify(this.newInfo));
// // //     this.notificationInfo.data.push(newNotify);
// // //     this.notificationInfo._updateChangeSubscription();
// // //   }

// // //   addNewMDERvw() {
// // //     let newInfo = JSON.parse(JSON.stringify(this.newInfo));
// // //     this.MDERvwTeamInfo.data.push(newInfo);
// // //     this.MDERvwTeamInfo._updateChangeSubscription();
// // //   }

// // //   getAgyUserLup(element?: any) {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       agencyId: this.visitSelectedData?.agency_id,
// // //       userName: "",
// // //       flName: "",
// // //       pcRel: "P",
// // //       pcInd: "X",
// // //       orderBy: "f_l_name",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService
// // //     //   .getConsAgyUserLup(payload)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsAgyUserLup.json")
// // //       .subscribe((res: any) => {
// // //         if (res != null) {
// // //           this.agyUsers = res[0];
// // //           this.showSpinner = false;
// // //         }
// // //       });
// // //   }

// // //   getPGMMDERoleTypeLupInfo() {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       rvwType: this.visitSelectedData?.rvw_type,
// // //       roleType: "",
// // //       roleName: "",
// // //       rvwStage: "",
// // //       roleCls: "A",
// // //       roleInd: "R",
// // //       subRvwId: "0",
// // //       option: "S",
// // //       orderBy: "role_name",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService.getConsPgmRoleTypeLup(payload)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsPgmRoleTypeLup.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.pgmMDERoleTypes = res[0];
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getPgmRoleTypeLupInfo() {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       rvwType: this.visitSelectedData?.rvw_type,
// // //       roleType: "",
// // //       roleName: "",
// // //       rvwStage: "SCHED",
// // //       roleCls: "G",
// // //       roleInd: "N",
// // //       subRvwId: "0",
// // //       option: "S",
// // //       orderBy: "role_name",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService.getConsPgmRoleTypeLup(payload)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsPgmRoleTypeLup-1.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.pgmRoleTypes = res[0];
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getMDEReviewTeamInfo() {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       rvwType: this.visitSelectedData?.rvw_type,
// // //       agencyId: this.visitSelectedData?.agency_id,
// // //       grantPgm: "",
// // //       subRecCd: this.visitSelectedData?.sub_rec_cd,
// // //       subRvwId: this.visitSelectedData?.sub_rvw_id,
// // //       rvwStage: "SCHED",
// // //       roleCls: "A",
// // //       roleInd: "R",
// // //       authSrc: "S",
// // //       option: "S",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService
// // //     //   .getConsPreSelectionRoleInfo(payload)
// // //     this.httpClient
// // //       .get(
// // //         "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo-1.json"
// // //       )
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.MDERvwTeamInfo.data = res[0];
// // //             setTimeout(
// // //               () => (this.MDERvwTeamInfo.paginator = this.mdereviewaginator)
// // //             );
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getNotificationInfo(element?: any) {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       rvwType: this.visitSelectedData?.rvw_type,
// // //       agencyId: this.visitSelectedData?.agency_id,
// // //       grantPgm: "",
// // //       subRecCd: this.visitSelectedData?.sub_rec_cd,
// // //       subRvwId: this.visitSelectedData?.sub_rvw_id,
// // //       rvwStage: "SCHED",
// // //       roleCls: "G",
// // //       roleInd: "N",
// // //       authSrc: "S",
// // //       option: "S",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService
// // //     //   .getConsPreSelectionRoleInfo(payload)
// // //     this.httpClient
// // //       .get(
// // //         "assets/api-data/ConsolidatedReview/GetConsPreSelectionRoleInfo.json"
// // //       )
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.notificationInfo.data = res[0].map((x: any) => {
// // //               let isNewContact =
// // //                 this.agyUsers.filter(
// // //                   (element: any) => element.user_id == x.user_id
// // //                 )?.length == 0 || x.user_id == 0;
// // //               return {
// // //                 ...x,
// // //                 select: false,
// // //                 pri_ind: x.pri_ind == "P" ? true : false,
// // //                 user_status:
// // //                   x.user_status == "A" && x.user_id != 0 ? true : false,
// // //                 chk_ind: x.chk_ind == "True" ? true : false,
// // //                 training_info: x.training_info == "True" ? true : false,
// // //                 isNewContact: isNewContact,
// // //                 role_name:
// // //                   Object.keys(x.role_name)?.length == 0 ? "" : x.role_name,
// // //               };
// // //             });
// // //             setTimeout(
// // //               () =>
// // //                 (this.notificationInfo.paginator = this.notificationpaginator)
// // //             );
// // //           }
// // //           this.showSpinner = false;
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getAssignSchedUsersLup() {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       userName: "",
// // //       contactName: "",
// // //       orderBy: "contact_name",
// // //       authInd: "S",
// // //       offCd: "",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService
// // //     //   .getConsAssignSchedUsersLup(payload)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsAssignSchedUsersLup.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.assignSchedUsers = res[0];
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getConsRvwDocInfo() {
// // //     let payload = {
// // //       subRvwId: this.visitSelectedData?.sub_rvw_id,
// // //       docSrl: 0,
// // //       verNo: 0,
// // //       userId: this.userDetails?.user_id,
// // //       option: "X",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService.getConsRvwDocInfo(payload)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsRvwDocInfo.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.responseDocSubmissionData.data = res[0];
// // //             setTimeout(
// // //               () =>
// // //                 (this.responseDocSubmissionData.paginator =
// // //                   this.docSubmissionpaginator)
// // //             );
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getConsSubRecipientRvwStatus() {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       rvwType: this.visitSelectedData?.rvw_type,
// // //       agencyId: this.visitSelectedData?.agency_id,
// // //       subRvwId: this.visitSelectedData?.sub_rvw_id,
// // //       rvwStage: "SCHED",
// // //       option: "R",
// // //     };
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService
// // //     //   .getConsSubRecipientRvwStatus(payload)
// // //     this.httpClient
// // //       .get(
// // //         "assets/api-data/ConsolidatedReview/GetConsSubRecipientRvwStatus.json"
// // //       )
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.subRecipientRvwStatusInfo = res;
// // //             if (
// // //               this.subRecipientRvwStatusInfo?.length > 0 &&
// // //               this.subRecipientRvwStatusInfo[0]?.length > 0
// // //             ) {
// // //               const item = this.subRecipientRvwStatusInfo[0][0];
// // //               item.start_dt = item.start_dt ? new Date(item.start_dt) : null;
// // //               item.end_dt = item.end_dt ? new Date(item.end_dt) : null;
// // //             }
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getConsNextStageStatus() {
// // //     this.nextStageList = [];
// // //     this.nextStageList.push({ stage_stat: "", stat_desc: "Please Select" });
// // //     let payload = {
// // //       wfcd: "ZEFBR5",
// // //       rvwStage: this.visitSelectedData?.rvw_stage,
// // //       stageStat: "P",
// // //       option: "P",
// // //     };

// // //     this.showSpinner = true;
// // //     //this.consolidatedReviewService.getConsNextStageStatus(payload)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsNextStageStatus.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null && res[0].length > 0) {
// // //             res[0].forEach((element) => {
// // //               this.nextStageList.push(element);
// // //             });
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getSchedDocs() {
// // //     let payload = {
// // //       grantPgmId: 570,
// // //       agencyId: this.visitSelectedData?.agency_id,
// // //       subRvwId: this.visitSelectedData?.sub_rvw_id,
// // //       offCd: "",
// // //       rvwType: this.visitSelectedData?.rvw_type,
// // //       pcInd: this.visitSelectedData?.p_c_ind,
// // //       option: this.isAddOrEdit ? "S" : "R",
// // //     };
// // //     this.showSpinner = true;
// // //     //this.consolidatedReviewService.getConsSchedulingDocInfo(payload)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsSchedulingDocInfo.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.responseDocumentData.data = res[0].map((x: any) => {
// // //               return {
// // //                 ...x,
// // //                 select: false,
// // //                 previewForm: x.form_id != 0 || x.FlexFormPDFTemplateID != 0,
// // //                 chk_ind: x.chk_ind == "Y" ? true : false,
// // //                 isUserTouched: false,
// // //               };
// // //             });
// // //             setTimeout(
// // //               () =>
// // //                 (this.responseDocumentData.paginator = this.doclistpaginator)
// // //             );
// // //           }
// // //           this.showSpinner = false;
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getReasonForDelete() {}

// // //   // getReviewTeam() {
// // //   //   //PAYLOAD this.directorVisitSelectedID
// // //   //   let data = [
// // //   //     [
// // //   //       {
// // //   //         contact_name: "TEST_1",
// // //   //         prog_desc: "Test Desc",
// // //   //       },
// // //   //       {
// // //   //         contact_name: "TEST_1",
// // //   //         prog_desc: "Test Desc",
// // //   //       },
// // //   //     ],
// // //   //   ];

// // //   //   this.reviewTeamList = new MatTableDataSource(data[0]);
// // //   //   setTimeout(
// // //   //     () => (this.reviewTeamList.paginator = this.reviewTeamPaginator)
// // //   //   );
// // //   // }

// // //   getReviewTeam() {
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService
// // //     //   .getConsReviewTeam(this.directorVisitSelectedID, "R")
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsReviewTeam.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.reviewTeamList = new MatTableDataSource(
// // //               this.sharedService.updateEmptyObjToNull(res[0])
// // //             );
// // //             setTimeout(
// // //               () => (this.reviewTeamList.paginator = this.reviewTeamPaginator)
// // //             );
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   getStageHistory() {
// // //     this.showSpinner = true;
// // //     // this.consolidatedReviewService
// // //     //   .getConsReviewStageHistory(this.directorVisitSelectedID)
// // //     this.httpClient
// // //       .get("assets/api-data/ConsolidatedReview/GetConsReviewStageHistory.json")
// // //       .subscribe(
// // //         (res: any) => {
// // //           if (res != null) {
// // //             this.stageHistoryList = new MatTableDataSource(
// // //               this.sharedService.updateEmptyObjToNull(res[0])
// // //             );
// // //             setTimeout(
// // //               () =>
// // //                 (this.stageHistoryList.paginator = this.stageHistoryPaginator)
// // //             );
// // //             this.cd.detectChanges();
// // //             this.showSpinner = false;
// // //           }
// // //         },
// // //         (error) => {
// // //           this.showSpinner = false;
// // //         }
// // //       );
// // //   }

// // //   // getStageHistory() {
// // //   //   //PAYLOAD this.directorVisitSelectedID
// // //   //   let data = [
// // //   //     [
// // //   //       {
// // //   //         rvw_stage: "TEST_1",
// // //   //         start_dt: "06/10/2019",
// // //   //         end_dt: "06/10/2019",
// // //   //         compl_by: null,
// // //   //         reason: null,
// // //   //       },
// // //   //       {
// // //   //         rvw_stage: "TEST_2",
// // //   //         start_dt: "06/10/2019",
// // //   //         end_dt: null,
// // //   //         compl_by: null,
// // //   //         reason: null,
// // //   //       },
// // //   //       {
// // //   //         rvw_stage: "TEST_3",
// // //   //         start_dt: "06/10/2019",
// // //   //         end_dt: null,
// // //   //         compl_by: null,
// // //   //         reason: null,
// // //   //       },
// // //   //     ],
// // //   //   ];

// // //   //   this.stageHistoryList = new MatTableDataSource(data[0]);
// // //   //   setTimeout(
// // //   //     () => (this.stageHistoryList.paginator = this.stageHistoryPaginator)
// // //   //   );
// // //   // }

// // //   saveVisitorDetails() {}

// // //   cancelEnhancedForm() {
// // //     this.emitTabData.emit({ selectedPage: "selectVisit", showDetails: false });
// // //   }

// // //   addNewMDEContactRow() {}
// // //   addNewSubRecipientContactRow() {}

// // //   updateDatasource() {
// // //     this.notificationInfo._updateChangeSubscription();
// // //   }

// // //   onChangeRvwRole(e: any, element: any) {
// // //     const index = this.responseMDEContactsData?.data?.findIndex(
// // //       (r) => r === element
// // //     );
// // //     let roleId = e.value;
// // //     let selectedRole = this.pgmMDERoleTypes.filter(
// // //       (x) => x.role_id === roleId
// // //     )[0];
// // //     this.responseMDEContactsData.data[index]["role_id"] = roleId;
// // //     this.responseMDEContactsData.data[index]["role_type"] =
// // //       selectedRole?.roleType;
// // //     this.responseMDEContactsData.data[index]["role_desc"] =
// // //       selectedRole?.roleTypeDescription;
// // //     this.responseMDEContactsData._updateChangeSubscription();
// // //   }

// // //   onChangeReviewer(e: any, element: any) {
// // //     const index = this.responseMDEContactsData?.data?.findIndex(
// // //       (r) => r === element
// // //     );
// // //     let userId = e.value;
// // //     let selectedUser = this.agyUsers.filter((x) => x.user_id === userId)[0];
// // //     this.responseMDEContactsData.data[index]["user_id"] = userId;
// // //     this.responseMDEContactsData.data[index]["role_name"] =
// // //       selectedUser?.role_name;
// // //     this.responseMDEContactsData.data[index]["role_email"] =
// // //       selectedUser?.user_email;
// // //     this.responseMDEContactsData.data[index]["user_role"] =
// // //       selectedUser?.role_desc;
// // //     this.responseMDEContactsData._updateChangeSubscription();
// // //   }

// // //   onChangeRoleType(e: any, element: any) {
// // //     const index = this.responseSubRecContactsData?.data?.findIndex(
// // //       (r) => r === element
// // //     );
// // //     let roleId = e.value;
// // //     let selectedRole = this.pgmRoleTypes.filter((x) => x.role_id === roleId)[0];
// // //     this.responseSubRecContactsData.data[index]["role_id"] = roleId;
// // //     this.responseSubRecContactsData.data[index]["role_type"] =
// // //       selectedRole?.roleType;
// // //     this.responseSubRecContactsData.data[index]["role_name"] =
// // //       selectedRole?.roleTypeDescription;
// // //     this.responseMDEContactsData._updateChangeSubscription();
// // //   }

// // //   onChangeUser(e: any, element: any) {
// // //     const index = this.responseSubRecContactsData?.data?.findIndex(
// // //       (r) => r === element
// // //     );
// // //     let userId = e.value;
// // //     let selectedUser = this.agyUsers.filter((x) => x.user_id === userId)[0];
// // //     this.responseSubRecContactsData.data[index]["user_id"] = userId;
// // //     this.responseSubRecContactsData.data[index]["role_name"] =
// // //       selectedUser?.role_name;
// // //     this.responseSubRecContactsData.data[index]["role_email"] =
// // //       selectedUser?.user_email;
// // //     this.responseSubRecContactsData._updateChangeSubscription();
// // //   }

// // //   downloadPreviewForm(element: any) {
// // //     this.downloadFile(element.PDFFileName);
// // //   }

// // //   downloadFile(file: any) {
// // //     this.showSpinner = true;
// // //     try {
// // //       this.consolidatedReviewService
// // //         .viewSchedDocFile(file)
// // //         .subscribe(async (res: any) => {
// // //           if (res != null) {
// // //             this.schedDocFileData = res;
// // //             this.sharedService.byteArrayToExportExcel(
// // //               this.schedDocFileData,
// // //               file
// // //             );
// // //             this.showSpinner = false;
// // //           } else {
// // //             this.toastrService.error(
// // //               "No File to download",
// // //               "Document File preview not successful."
// // //             );
// // //           }
// // //         });
// // //     } catch (error) {
// // //       this.showSpinner = false;
// // //     }
// // //   }

// // //   openConsolidatedReviewPopup(event: any, Mode: any, pageName: any) {
// // //     const dialogRef = this.dialog.open(ConsolidatedReviewPopupcomponent, {
// // //       maxWidth: "100vw",
// // //       maxHeight: "100vh",

// // //       width: "80%",
// // //       height: "80%",
// // //       data: {
// // //         pageName: pageName,
// // //         mode: Mode,
// // //         headerName: pageName == "viewEmails" ? "Email Log" : "Global Comments",
// // //         emailData: event,
// // //         subRvwId: this.directorVisitSelectedID,
// // //         visitSelectedData: this.visitSelectedData,
// // //       },
// // //       autoFocus: false,
// // //     });
// // //     dialogRef.afterClosed().subscribe(async (result) => {
// // //       if (result?.data == "submit") {
// // //       }
// // //     });
// // //   }

// // //   changePrimaryContact(event: any, element: any) {
// // //     const index = this.notificationInfo?.data?.findIndex((r) => r === element);
// // //     this.notificationInfo?.data?.forEach((ele: any, i: number) => {
// // //       if (event == "pri_ind") {
// // //         ele.pri_ind = i = index ? ele.pri_ind : false;
// // //       }
// // //     });
// // //     this.notificationInfo._updateChangeSubscription();
// // //   }

// // //   openConfirmDeletePopup(rowData: any, gridName: any, rowIndex?: number) {
// // //     const dialogRef = this.dialog.open(PopUpComponent, {
// // //       maxWidth: "100vw",
// // //       maxHeight: "100vh",

// // //       width: "30%",
// // //       height: "25%",
// // //       data: {
// // //         pageName: "consolReview",
// // //         headerName: "Confirmation",
// // //         emitdata: rowData?.subRecName + " (" + rowData?.subRecCd + ")",
// // //       },
// // //       autoFocus: false,
// // //     });
// // //     dialogRef.afterClosed().subscribe(async (result) => {
// // //       if (result?.data === "ok") {
// // //         //this.deleteSubRecipientData(rowData);
// // //       }
// // //     });
// // //   }

// // //   selectAllCheckBox(event: any, gridName: any, isSelectAll: boolean) {
// // //     if (gridName == "docSearch") {
// // //       if (isSelectAll) {
// // //         this.responseDocumentData.data.forEach((element: any) => {
// // //           element.chk_ind = event.checked;
// // //           element.isUserTouched = true;
// // //         });
// // //       } else {
// // //         this.isDocSelectAll =
// // //           this.responseDocumentData?.data?.length ==
// // //           this.responseDocumentData?.data?.filter((ele: any) => ele.chk_ind)
// // //             ?.length;
// // //       }
// // //       this.responseDocumentData._updateChangeSubscription();
// // //     }
// // //   }

// // //   promoteNextStage() {}

// // //   onSelectionStageChanged(event: any, data: any) {
// // //     if (event?.isUserInput) {
// // //       this.selectedReason = data.id;
// // //     }
// // //   }
// // // }
