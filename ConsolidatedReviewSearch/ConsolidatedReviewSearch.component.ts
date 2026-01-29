import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  Input,
  SimpleChanges,
  ChangeDetectorRef,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";

import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { ConsolidatedReviewService } from "./../../../shared/services/consolidated-review.service";
import { SharedService } from "src/app/shared/services/shared.service";
import { ConsolidatedReviewPopupComponent } from "../ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";
import {
  TAB_CONFIGURATIONS,
  TAB_LIST,
  TabId,
  TabConfig,
} from "../consolidated-review-tab-config";
import { AddSubRecipientComponent } from "../AdditionalSupport/components/add-sub-recipient/add-sub-recipient.component";

@Component({
  selector: "app-consolidatedreview-search",
  templateUrl: "./ConsolidatedReviewSearch.component.html",
  styleUrls: ["./ConsolidatedReviewSearch.component.scss"],
})
export class ConsolidatedReviewSearchComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() currentTabId: TabId = "excessfundbal";
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() emitTabData = new EventEmitter();

  public showSpinner: boolean = false;
  public responseData: MatTableDataSource<any>;
  public selectedIndex: number = 0;

  public initialResponseData: any = [];
  public consolidatedReviewList: any = [];
  public selectedConsolidatedReview: any = [];

  programMgmtInfo: any[] = [];
  filteredPrograms: any[] = [];
  programSearch = "";

  public displayedColumns: string[] = [];
  public searchObj: any = {};
  public userDetails: any;

  public columnsHeaders: any[] = [];

  public currentTabConfig: any;
  public selectedTabIndex: number = 0;
  public tabList: TabConfig[] = TAB_LIST;
  private routerSubscription: Subscription;

  public filterValue: string = "";

  private destroy$ = new Subject<void>();
  private isInitialLoad = true;

  constructor(
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {
    this.responseData = new MatTableDataSource([]);
  }

  async ngOnInit() {
    console.log("Consolidated Review Search Initializing...");

    this.userDetails = this.programAdministrationService.getUserDetails();
    this.selectedIndex = 0;

    // Get tabId from parent route params
    this.activatedRoute.parent.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const tabId = params["tabId"] as TabId;
        if (tabId && tabId !== this.currentTabId) {
          console.log("Tab ID from route params:", tabId);
          this.currentTabId = tabId;
          this.loadTabConfiguration(this.currentTabId);
          this.isInitialLoad = true;
        }
      });

    // Listen to route changes
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        console.log("Navigation event in search:", this.router.url);
        this.handleRouteChange();
      });

    // Initial load
    this.getProgramMgmtInfo();

    setTimeout(() => {
      console.log("Performing forced initial load");
      if (!this.currentTabId || !TAB_CONFIGURATIONS[this.currentTabId]) {
        this.currentTabId = "excessfundbal";
      }
      this.loadTabConfiguration(this.currentTabId);
      this.isInitialLoad = false;
      this.cd.detectChanges();
    }, 200);
  }

  ngAfterViewInit() {
    if (this.responseData) {
      this.responseData.sort = this.sort;
    }
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProgramMgmtInfo() {
    const payload = {
      grantPgm: "LCEP",
      grantPgmDesc: "",
      rvwType: "",
      rvwTypeDesc: "",
      meisId: "",
      contactName: "",
      option: "",
    };

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/ProgramMgmtInfo.json")
      .toPromise()
      .then((res: any) => {
        if (res) {
          this.programMgmtInfo = [
            ...new Map(res.map((item: any) => [item.rvw_type, item])).values(),
          ];
          this.filteredPrograms = this.programMgmtInfo;
        }
      });
  }

  onOpen() {
    this.programSearch = "";
    this.filteredPrograms = this.programMgmtInfo;
  }

  filterPrograms() {
    const search = this.programSearch.toLowerCase();
    this.filteredPrograms = this.programMgmtInfo.filter(
      (x) =>
        x.rvw_desc.toLowerCase().includes(search) ||
        x.rvw_type.toLowerCase().includes(search),
    );
  }

  handleRouteChange(): void {
    const urlSegments = this.router.url.split("/");

    // Find consolidatedreview in URL
    const consolidatedReviewIndex = urlSegments.indexOf("consolidatedreview");

    if (
      consolidatedReviewIndex !== -1 &&
      consolidatedReviewIndex + 1 < urlSegments.length
    ) {
      const tabId = urlSegments[consolidatedReviewIndex + 1] as TabId;

      if (tabId && tabId !== this.currentTabId && TAB_CONFIGURATIONS[tabId]) {
        console.log("Route change detected, loading tab:", tabId);
        this.currentTabId = tabId;
        this.loadTabConfiguration(this.currentTabId);
      }
    }
  }

  loadTabConfiguration(tabId: TabId): void {
    console.log("Loading tab configuration for:", tabId);

    this.showSpinner = true;

    // Reset data
    this.responseData.data = [];
    this.consolidatedReviewList = [];
    this.selectedConsolidatedReview = [];
    this.searchObj = {};
    this.filterValue = "";

    // Load configuration
    this.currentTabConfig = TAB_CONFIGURATIONS[tabId];

    if (this.currentTabConfig) {
      // Update columns
      this.columnsHeaders = this.currentTabConfig.columns;
      this.displayedColumns = [];
      this.columnsHeaderForDataTable();

      // Update search object with grantPgmId from config
      this.searchObj = { ...this.currentTabConfig.searchObj };

      // Make sure grantPgmId is set from config
      if (this.currentTabConfig.grantPgmId) {
        this.searchObj.grantPgmId = this.currentTabConfig.grantPgmId;
      }

      // Load data for the tab
      this.loadTabData();
    } else {
      // Default configuration
      this.columnsHeaders = TAB_CONFIGURATIONS["excessfundbal"].columns;
      this.searchObj = { ...TAB_CONFIGURATIONS["excessfundbal"].searchObj };
      this.loadTabData();
    }

    // Update UI
    this.cd.detectChanges();
  }

  loadTabData(): void {
    console.log("Loading tab data for:", this.currentTabId);

    // Load lookup data
    this.getConsolidatedReviewsForLookup();

    // If there's a preselected value, load the chartering agency data
    if (this.searchObj.charteringAgency) {
      setTimeout(() => {
        this.getConsolReviewCharteringAgency();
      }, 500);
    }

    this.showSpinner = false;
  }

  columnsHeaderForDataTable(): void {
    this.displayedColumns = [];
    this.columnsHeaders.forEach((element) => {
      if (element.visible) {
        this.displayedColumns.push(element.fieldName);
      }
    });
    this.displayedColumns.push("action");
  }

  getCurrentTabTitle(): string {
    return this.currentTabConfig?.title || "Excess Fund Balance";
  }

  getDropdownPlaceholder(item?: string): string {
    return item === "rvwType"
      ? this.currentTabConfig?.dropdownRvwTypePlaceholder
      : this.currentTabConfig?.dropdownPlaceholder || "Please Select District";
  }

  onTabChange(event: any): void {
    const selectedTab = this.tabList[event.index];
    if (selectedTab && selectedTab.id !== this.currentTabId) {
      this.changeTab(selectedTab.id);
    }
  }

  changeTab(tabId: TabId): void {
    this.router.navigate(["/consolidatedreview", tabId, "selectVisit"]);
  }

  updatedSelectedValue(selectedList: any, field?: string): void {
    this.responseData.data = [];
    this.responseData._updateChangeSubscription();
    this.selectedConsolidatedReview = selectedList?.selectedItemsValues;

    if (
      this.selectedConsolidatedReview &&
      this.selectedConsolidatedReview.length > 0
    ) {
      this.searchObj.charteringAgency =
        this.selectedConsolidatedReview[0]?.itemCode || null;

      if (this.selectedConsolidatedReview[0]?.rawData) {
        const rawData = this.selectedConsolidatedReview[0].rawData;

        switch (this.currentTabId) {
          case "contrpage":
          case "ltclaimexcep":
            break;
          case "cnpcontr":
            this.searchObj.contractId = rawData.contract_id;
            break;
          case "psacontrrvw":
            this.searchObj.psaId = rawData.psa_id;
            break;
          case "clswallinv":
            this.searchObj.investmentId = rawData.investment_id;
            break;
          case "10cent":
          case "31n6beyondhir":
            this.searchObj.programId = rawData.program_id;
            break;
          case "privschconsult":
            this.searchObj.schoolId = rawData.school_id;
            break;
          case "falseel":
          case "usdadodcompliant":
            break;
        }
      }
    }
  }

  openAddSubRecipientPopup(event: any): void {
    const grantPgmId = this.getGrantPgmIdForCurrentTab();

    const dialogRef = this.dialog.open(AddSubRecipientComponent, {
      width: "600px",
      maxHeight: "90vh",
      panelClass: "add-sub-recipient-dialog",
      data: {
        pageName: "addnewsubrecipient",
        mode: "",
        headerName: "Add for Selected Sub-Recipient",
        subrecData: event,
        grantPgmId: grantPgmId,
        currentTabId: this.currentTabId,
        currentTabTitle: this.getCurrentTabTitle(),
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccessMessage("Sub-recipient added successfully");
        this.getConsolidatedReviewsForLookup();
      }
    });
  }

  private getGrantPgmIdForCurrentTab(): number {
    if (this.currentTabConfig?.grantPgmId) {
      return this.currentTabConfig.grantPgmId;
    }

    switch (this.currentTabId) {
      case "contrpage":
      case "cnpcontr":
        return 571;
      default:
        return 570;
    }
  }

  private showSuccessMessage(message: string): void {
    console.log("Success:", message);
  }

  getConsolidatedReviewsForLookup(): void {
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsolidatedReviews.json")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (res != null) {
            this.initialResponseData = res[0] || [];
            this.consolidatedReviewList = this.initialResponseData.map(
              (element: any) => ({
                id:
                  element.sub_rvw_id ||
                  element.contract_id ||
                  element.psa_id ||
                  element.investment_id ||
                  element.program_id ||
                  element.school_id ||
                  element.id,
                itemName: this.formatItemName(element),
                itemCode:
                  element.sub_rec_cd ||
                  element.contract_number ||
                  element.psa_number ||
                  element.investment_id ||
                  element.program_code ||
                  element.school_code ||
                  element.code,
                rawData: element,
              }),
            );
            this.showSpinner = false;
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
          console.error("Error loading lookup data:", error);
        },
      );
  }

  private formatItemName(element: any): string {
    switch (this.currentTabId) {
      case "psacontrrvw":
        return `${element.program_name || element.name} [${element.program_code || element.id}]`;
      case "31n6beyondhir":
        return `${element.school_name || element.name} [${element.school_code || element.id}]`;
      case "usdadodcompliant":
        return `${element.sub_rec_name || element.name} [${element.sub_rec_cd || element.id}] - Compliance Score: ${element.ComplianceScore || element.score || "N/A"}`;
      default:
        return `${element.sub_rec_name || element.name} [${element.sub_rec_cd || element.id}] - ${element.rvw_yr || ""}`;
    }
  }

  getConsolReviewCharteringAgency(): void {
    if (!this.searchObj.charteringAgency) {
      alert("Please select a district/contract/program first");
      return;
    }

    this.showSpinner = true;

    const payload = {
      grantPgmId: this.searchObj?.grantPgmId,
      rvwType: this.searchObj?.rvwType,
      charteringAgency: this.searchObj["charteringAgency"],
      PSA: this.searchObj["PSA"],
      rvwYear: this.searchObj["rvwYear"],
      contractId: this.searchObj["contractId"],
      psaId: this.searchObj["psaId"],
      investmentId: this.searchObj["investmentId"],
      exceptionType: this.searchObj["exceptionType"],
      contractStatus: this.searchObj["contractStatus"],
    };

    this.httpClient
      .get(
        "assets/api-data/ConsolidatedReview/GetConsolReviewCharteringAgency.json",
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (res != null) {
            this.responseData = new MatTableDataSource(res[0] || []);
            if (this.sort) {
              this.responseData.sort = this.sort;
            }
            setTimeout(() => {
              this.responseData.paginator = this.paginator;
              this.showSpinner = false;
              this.cd.detectChanges();
            });
          }
        },
        (error) => {
          this.showSpinner = false;
          console.error("Error loading chartering agency data:", error);
        },
      );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue;
    this.responseData.filter = filterValue.trim().toLowerCase();
  }

  hasData(): boolean {
    return (
      this.responseData &&
      this.responseData.data &&
      this.responseData.data.length > 0
    );
  }

  resetSearch(): void {
    this.searchObj = {};
    this.selectedConsolidatedReview = [];
    this.responseData.data = [];
    this.filterValue = "";

    // Reset to default configuration
    if (this.currentTabConfig) {
      this.searchObj = { ...this.currentTabConfig.searchObj };
    }

    // Tell container to disable details
    this.emitTabData.emit({
      selectedPage: "selectVisit",
      showDetails: false,
      visitSelectedData: null,
    });

    this.cd.detectChanges();
  }

  // In the openReviewDetails method:
  openReviewDetails(element: any): void {
    console.log("Opening review details for:", element);

    if (!element || !this.currentTabId) {
      console.error("Missing element or currentTabId");
      return;
    }

    // Prepare the data
    const visitData = {
      ...element,
      currentTabId: this.currentTabId,
      currentTabTitle: this.getCurrentTabTitle(),
      grantPgmId:
        this.searchObj?.grantPgmId || this.currentTabConfig?.grantPgmId,
      charteringAgency:
        this.searchObj?.charteringAgency || element.charteringAgency,
      sub_rvw_id: element.sub_rvw_id || element.id || 0,
      agency_id: element.agency_id || 0,
      sub_rec_cd: element.sub_rec_cd || "",
      rvw_type: element.rvw_type || this.currentTabConfig?.reviewType,
      p_c_ind: element.p_c_ind || "P",
      rvw_type_desc: element.rvw_type_desc || this.currentTabConfig?.title,
      sub_rec_name: element.sub_rec_name || element.sub_rec_cd || "",
      rvw_yr: element.rvw_yr || new Date().getFullYear().toString(),
      rvw_ref_no: element.rvw_ref_no || "",
    };

    console.log("Prepared visitData:", visitData);

    // Emit to parent container
    this.emitTabData.emit({
      selectedPage: "visitDetails",
      showDetails: true,
      visitSelectedData: visitData,
    });
  }

  // openReviewDetails(element: any): void {
  //   console.log("Opening review details for:", element);

  //   if (!element || !this.currentTabId) {
  //     console.error("Missing element or currentTabId");
  //     return;
  //   }

  //   // Prepare the data to pass
  //   const visitData = {
  //     ...element,
  //     currentTabId: this.currentTabId,
  //     currentTabTitle: this.getCurrentTabTitle(),
  //     grantPgmId:
  //       this.searchObj?.grantPgmId || this.currentTabConfig?.grantPgmId,
  //     charteringAgency:
  //       this.searchObj?.charteringAgency || element.charteringAgency,
  //     sub_rvw_id: element.sub_rvw_id || element.id || 0,
  //     agency_id: element.agency_id || 0,
  //     sub_rec_cd: element.sub_rec_cd || "",
  //     rvw_type: element.rvw_type || this.currentTabConfig?.reviewType,
  //     p_c_ind: element.p_c_ind || "P",
  //     rvw_type_desc: element.rvw_type_desc || this.currentTabConfig?.title,
  //     sub_rec_name: element.sub_rec_name || element.sub_rec_cd || "",
  //     rvw_yr: element.rvw_yr || new Date().getFullYear().toString(),
  //     rvw_ref_no: element.rvw_ref_no || "",
  //   };

  //   console.log("Prepared visitData:", visitData);

  //   this.router
  //     .navigate(["/consolidatedreview", this.currentTabId, "visitDetails"], {
  //       state: {
  //         visitData: visitData,
  //       },
  //     })
  //     .then((success) => {
  //       if (success) {
  //         console.log("Navigation successful");
  //         // Also emit to container to update its state
  //         this.emitTabData.emit({
  //           selectedPage: "visitDetails",
  //           showDetails: true,
  //           visitSelectedData: visitData,
  //         });
  //       } else {
  //         console.error("Navigation failed");
  //       }
  //     });

  //   // Emit to parent container ONLY - let container handle navigation
  //   // this.emitTabData.emit({
  //   //   selectedPage: "visitDetails",
  //   //   showDetails: true,
  //   //   visitSelectedData: visitData,
  //   // });
  // }

  // openReviewDetails(element: any): void {
  //   console.log(
  //     "Opening review details for:",
  //     element,
  //     "Current Tab:",
  //     this.currentTabId,
  //   );

  //   // Validate we have necessary data
  //   if (!element || !this.currentTabId) {
  //     console.error("Missing element or currentTabId");
  //     return;
  //   }

  //   // Prepare the data to pass
  //   const visitData = {
  //     ...element,
  //     currentTabId: this.currentTabId,
  //     currentTabTitle: this.getCurrentTabTitle(),
  //     grantPgmId:
  //       this.searchObj?.grantPgmId || this.currentTabConfig?.grantPgmId,
  //     charteringAgency:
  //       this.searchObj?.charteringAgency || element.charteringAgency,
  //     sub_rvw_id: element.sub_rvw_id || element.id || 0,
  //     agency_id: element.agency_id || 0,
  //     sub_rec_cd: element.sub_rec_cd || "",
  //     rvw_type: element.rvw_type || this.currentTabConfig?.reviewType,
  //     p_c_ind: element.p_c_ind || "P",
  //     rvw_type_desc: element.rvw_type_desc || this.currentTabConfig?.title,
  //     sub_rec_name: element.sub_rec_name || element.sub_rec_cd || "",
  //     rvw_yr: element.rvw_yr || new Date().getFullYear().toString(),
  //     rvw_ref_no: element.rvw_ref_no || "",
  //   };

  //   console.log("Prepared visitData:", visitData);

  //   // First, emit to parent container
  //   this.emitTabData.emit({
  //     selectedPage: "visitDetails",
  //     showDetails: true,
  //     visitSelectedData: visitData,
  //   });

  //   this.navigateToDetailsWithFallback(visitData);
  // }

  openContactsDetails(element: any): void {
    const dialogRef = this.dialog.open(ConsolidatedReviewPopupComponent, {
      width: "40%",
      height: "40%",
      data: {
        pageName: "directorContact",
        headerName: "Contact Details",
        emitdata: element,
      },
      autoFocus: false,
    });
  }

  formatCellValue(element: any, column: any): string {
    const value = element[column.fieldName];

    if (value === null || value === undefined) return "";

    switch (column.type) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(value));

      case "date":
        if (!value) return "";
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }

      case "datetime":
        if (!value) return "";
        try {
          const date = new Date(value);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const year = date.getFullYear();

          let hours: number = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";

          hours = hours % 12;
          hours = hours ? hours : 12;

          return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        } catch {
          return value;
        }

      case "number":
        return Number(value).toLocaleString();

      default:
        return String(value);
    }
  }

  getCellTitle(element: any, column: any): string {
    const value = element[column.fieldName];

    if (value === null || value === undefined) return "";

    switch (column.type) {
      case "currency":
        return `$${Number(value).toFixed(2)}`;
      case "date":
        if (!value) return "";
        try {
          return new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          return value;
        }
      default:
        return String(value);
    }
  }

  handleActionClick(action: string, element: any): void {
    switch (action) {
      case "view":
        this.openReviewDetails(element);
        break;
      case "edit":
        this.openReviewDetails(element);
        break;
      case "delete":
        this.openContactsDetails(element);
        break;
      default:
        console.warn("Unknown action:", action);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["currentTabId"] && !changes["currentTabId"].firstChange) {
      this.resetSearchState();
    }
  }

  resetSearchState() {
    this.responseData.data = [];
    this.selectedConsolidatedReview = [];
    this.consolidatedReviewList = [];
    this.searchObj = {};
    this.filterValue = "";
    this.programSearch = "";
    this.filteredPrograms = [];
    this.cd.detectChanges();
  }
}
