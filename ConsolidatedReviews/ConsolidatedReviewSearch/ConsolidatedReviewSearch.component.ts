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
import { MatSort, Sort } from "@angular/material/sort";
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

  public reviewTypeList: any[] = [];
  public selectedReviewTypeList: any[] = [];
  public reviewTypeAgencyList: any[] = [];
  public selectedReviewTypeAgencyList: any[] = [];

  public districtNameList: any[] = [];
  public selectedDistrictNameList: any[] = [];
  public elUICList: any[] = [];
  public selectedELUICList: any[] = [];
  public districtName: string | null;
  public districtCode: string | null;
  public uicCode: string | null;

  public currentTabConfig: any;
  public selectedTabIndex: number = 0;
  public tabList: TabConfig[] = TAB_LIST;
  private routerSubscription: Subscription;

  public tblActionTitle: string = "";
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
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.selectedIndex = 0;

    // Subscribe to router events for tab changes
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.handleRouteChange();
      });

    // Load initial tab configuration
    if (this.currentTabId) {
      this.loadTabConfiguration(this.currentTabId);
    } else {
      this.handleRouteChange();
    }

    // Load program management info
    this.getProgramMgmtInfo();

    // Force initial load after delay
    setTimeout(() => {
      if (!this.currentTabId || !TAB_CONFIGURATIONS[this.currentTabId]) {
        this.currentTabId = "excessfundbal";
      }
      this.loadTabConfiguration(this.currentTabId);
      this.isInitialLoad = false;
      this.cd.detectChanges();
    }, 200);
  }

  ngAfterViewInit() {
    this.setupTableSorting();
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Setup table sorting
  setupTableSorting(): void {
    if (this.responseData && this.sort) {
      this.responseData.sort = this.sort;
      this.responseData.sortingDataAccessor = (
        data: any,
        sortHeaderId: string,
      ) => {
        // Handle nested properties or special cases
        if (sortHeaderId.includes(".")) {
          const properties = sortHeaderId.split(".");
          let value = data;
          for (const prop of properties) {
            value = value ? value[prop] : null;
          }
          return this.getSortableValue(value);
        }

        // Handle direct properties
        const value = data[sortHeaderId];
        return this.getSortableValue(value);
      };
    }
  }

  // Convert values for proper sorting
  private getSortableValue(value: any): any {
    if (value === null || value === undefined) {
      return "";
    }

    // Check if it's a currency string (starts with $)
    if (typeof value === "string" && value.startsWith("$")) {
      const numValue = parseFloat(value.replace(/[$,]/g, ""));
      return isNaN(numValue) ? value : numValue;
    }

    // Check if it's a date string
    if (typeof value === "string") {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return dateValue;
      }
    }

    // Check if it's a number string
    if (
      typeof value === "string" &&
      !isNaN(Number(value)) &&
      value.trim() !== ""
    ) {
      return Number(value);
    }

    return value;
  }

  handleRouteChange(): void {
    const urlSegments = this.router.url.split("/");
    let tabSegment = urlSegments[urlSegments.length - 1];

    if (tabSegment === "selectVisit" || tabSegment === "visitDetails") {
      tabSegment = urlSegments[urlSegments.length - 2];
    }

    if (tabSegment && TAB_CONFIGURATIONS[tabSegment as TabId]) {
      this.currentTabId = tabSegment as TabId;
    } else {
      this.currentTabId = "excessfundbal";
    }

    const tabIndex = this.tabList.findIndex(
      (tab) => tab.id === this.currentTabId,
    );
    if (tabIndex > -1) {
      this.selectedTabIndex = tabIndex;
    }

    this.loadTabConfiguration(this.currentTabId);
  }

  getProgramMgmtInfo() {
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

  loadTabConfiguration(tabId: TabId): void {
    this.showSpinner = true;
    this.responseData.data = [];
    this.consolidatedReviewList = [];
    this.selectedConsolidatedReview = [];
    this.searchObj = {};
    this.filterValue = "";

    this.currentTabConfig = TAB_CONFIGURATIONS[tabId];

    if (this.currentTabConfig) {
      this.columnsHeaders = this.currentTabConfig.columns;
      this.displayedColumns = [];
      this.columnsHeaderForDataTable();
      this.searchObj = { ...this.currentTabConfig.searchObj };
      this.tblActionTitle = this.currentTabConfig.tblActionTitle;

      if (this.currentTabConfig.grantPgmId) {
        this.searchObj.grantPgmId = this.currentTabConfig.grantPgmId;
      }
      this.loadTabData();
    } else {
      this.columnsHeaders = TAB_CONFIGURATIONS["excessfundbal"].columns;
      this.searchObj = { ...TAB_CONFIGURATIONS["excessfundbal"].searchObj };
      this.tblActionTitle = TAB_CONFIGURATIONS["excessfundbal"].tblActionTitle;
      this.loadTabData();
    }
    this.cd.detectChanges();
  }

  loadTabData(): void {
    this.getConsolidatedReviews();

    // Load chartering agency data if preselected
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

  getDropdownPlaceholder(): string {
    return (
      this.currentTabConfig?.dropdownPlaceholder || "Please Select District"
    );
  }

  getDropdown1Placeholder(): string {
    return (
      this.currentTabConfig?.dropdown1Placeholder || "Please Select District"
    );
  }

  getDropdown2Placeholder(): string {
    return this.currentTabConfig?.dropdown2Placeholder || "Please Select";
  }

  getCurrentTabActionTitle(): string {
    return this.currentTabConfig?.tblActionTitle || "Select Review";
  }

  onTabChange(event: any): void {
    const selectedTab = this.tabList[event.index];
    if (selectedTab && selectedTab.id !== this.currentTabId) {
      this.changeTab(selectedTab.id);
    }
  }

  changeTab(tabId: TabId): void {
    this.router.navigate([`/consolidated-review/${tabId}`]);
  }

  async updatedSelectedValue(selectedList: any, field?: string): Promise<void> {
    this.responseData.data = [];
    this.responseData._updateChangeSubscription();

    switch (field) {
      case "district":
        this.searchObj["rvwType"] = null;
        this.selectedConsolidatedReview = selectedList?.selectedItemsValues;
        await this.loadReviewTypeList();
        break;
      case "reviewType":
        this.searchObj["rvwType"] = null;
        this.searchObj["wfCd"] = null;
        this.selectedReviewTypeList = selectedList?.selectedItemsValues;
        this.searchObj["rvwType"] =
          this.selectedReviewTypeList[0]?.rvw_type || null;
        this.searchObj["wfCd"] = this.selectedReviewTypeList[0]?.wf_cd || null;
        await this.loadReviewTypeAgencyList();
        break;
      case "reviewTypeAgency":
        this.searchObj["agencyId"] = null;
        this.selectedReviewTypeAgencyList = selectedList?.selectedItemsValues;
        this.searchObj["agencyId"] =
          this.selectedReviewTypeAgencyList[0]?.agency_id || null;
        break;
      case "falseeldistrict":
        this.districtName = null;
        this.districtCode = null;
        this.selectedDistrictNameList = selectedList?.selectedItemsValues;
        this.districtName =
          this.selectedDistrictNameList[0]?.subRecName || null;
        this.districtCode = this.selectedDistrictNameList[0]?.subRecCd || null;
        break;
      case "elUIC":
        this.uicCode = null;
        this.selectedELUICList = selectedList?.selectedItemsValues;
        this.uicCode = this.selectedELUICList[0]?.uicCode || null;
        break;
    }

    if (
      this.selectedConsolidatedReview &&
      this.selectedConsolidatedReview.length > 0
    ) {
      this.searchObj.charteringAgency =
        this.selectedConsolidatedReview[0]?.itemCode || null;

      if (this.selectedConsolidatedReview[0]?.rawData) {
        const rawData = this.selectedConsolidatedReview[0].rawData;

        switch (this.currentTabId) {
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
        }
      }
    }
  }

  loadReviewTypeList() {
    this.reviewTypeList = [];
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetRvwTypeLookUp.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.reviewTypeList = res[0]?.map((x) => ({
              id: x["rvw_type"],
              itemName: x["rvw_desc"] + " (" + x["rvw_type"] + ")",
              ...x,
            }));
            this.showSpinner = false;
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }

  loadReviewTypeAgencyList() {
    this.reviewTypeAgencyList = [];
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsolidatedReviews.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.reviewTypeAgencyList = res[0]?.map((x) => ({
              id: x["sub_rec_cd"],
              itemName: this.formatItemName(x),
              ...x,
            }));
            this.showSpinner = false;
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }

  openAddSubRecipientPopup(event: any): void {
    const grantPgmId = this.getGrantPgmIdForCurrentTab();
    const reviewType = this.getReviewTypeForCurrentTab();

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
        reviewType: reviewType,
        grantPgm: this.programMgmtInfo[0]?.grant_pgm,
        reviewYear: this.programMgmtInfo[0]?.rvw_start,
        currentTabId: this.currentTabId,
        currentTabTitle: this.getCurrentTabTitle(),
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addConsolidatedReview(result);
      }
    });
  }

  private addConsolidatedReview(data: any) {
    const payload = {
      grantPgmId: data.grantPgmId,
      rvwType: data.reviewType,
      subRecCd: data.sub_rec_cd,
      rvwYear: data.reviewYear.toString(),
      rvwStage: data.reviewStage,
      userId: this.userDetails?.userId,
    };

    this.showSpinner = true;

    this.consolidatedReviewService
      .addConsolidatedReview(payload)
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.getConsolidatedReviews();
            this.showSpinner = false;
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
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

  private getReviewTypeForCurrentTab(): string {
    if (this.currentTabConfig?.reviewType) {
      return this.currentTabConfig.reviewType;
    }

    switch (this.currentTabId) {
      case "contrpage":
      case "cnpcontr":
        return "";
      default:
        return "";
    }
  }

  getConsolidatedReviews(): void {
    const payload = {
      grantPgmId: this.searchObj?.grantPgmId,
      rvwType: this.searchObj?.rvwType,
      agencyId: this.searchObj?.agencyId,
    };

    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsolidatedReviews.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
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
        },
      );
  }

  private formatItemName(element: any): string {
    switch (this.currentTabId) {
      case "newTest":
        return `${element.program_name || element.name} [${element.program_code || element.id}]`;
      default:
        return `${element.sub_rec_name || element.name} [${element.sub_rec_cd || element.id}] - ${element.rvw_yr || ""} - [${element.rvw_ref_no || ""}]`;
    }
  }

  getConsolReviewCharteringAgency(): void {
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
            this.setupTableSorting();
            setTimeout(() => {
              this.responseData.paginator = this.paginator;
              this.showSpinner = false;
              this.cd.detectChanges();
            });
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }

  getConsolReviewSearchResult(): void {
    this.showSpinner = true;
    const payload = {
      grantPgmId: this.searchObj?.grantPgmId,
      rvwType: this.searchObj?.rvwType,
      agencyId: this.searchObj?.agencyId,
    };

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsolidatedReviews.json")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (res != null) {
            this.responseData = new MatTableDataSource(res[0] || []);
            this.setupTableSorting();
            setTimeout(() => {
              this.responseData.paginator = this.paginator;
              this.showSpinner = false;
              this.cd.detectChanges();
            });
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }

  getFalseELInfo(): void {
    this.showSpinner = true;
    const payload = {
      districtName: this.districtName || null,
      districtCode: this.districtCode || null,
      uicCode: this.uicCode || null,
    };

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetFalseELInfo.json")
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (res != null) {
            this.responseData = new MatTableDataSource(res[0] || []);
            this.setupTableSorting();
            setTimeout(() => {
              this.responseData.paginator = this.paginator;
              this.showSpinner = false;
              this.cd.detectChanges();
            });
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }

  // Handle sorting manually if needed
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === "") {
      return;
    }

    const data = this.responseData.data.slice();
    const isAsc = sort.direction === "asc";

    this.responseData.data = data.sort((a, b) => {
      const aValue = this.getSortableValue(a[sort.active]);
      const bValue = this.getSortableValue(b[sort.active]);

      if (aValue < bValue) {
        return isAsc ? -1 : 1;
      }
      if (aValue > bValue) {
        return isAsc ? 1 : -1;
      }
      return 0;
    });
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
    this.programSearch = "";
    this.filteredPrograms = this.programMgmtInfo;

    // Reset to default configuration
    if (this.currentTabConfig) {
      this.searchObj = { ...this.currentTabConfig.searchObj };
    }

    // Notify parent container
    this.emitTabData.emit({
      selectedPage: "selectVisit",
      showDetails: false,
      visitSelectedData: null,
    });

    this.cd.detectChanges();
  }

  openReviewDetails(element: any): void {
    if (!element || !this.currentTabId) {
      return;
    }

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

    this.emitTabData.emit({
      selectedPage: "visitDetails",
      showDetails: true,
      visitSelectedData: visitData,
    });
  }

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
    this.programSearch = "";
    this.filteredPrograms = this.programMgmtInfo;
    this.cd.detectChanges();
  }

  GetELDistrictNames(): void {
    this.districtNameList = [];
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsolidatedReviews.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.districtNameList = res?.map((x) => ({
              id: x["subRecCd"],
              itemName: x["subRecName"] + " (" + x["subRecCd"] + ")",
              ...x,
            }));
            this.showSpinner = false;
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }

  GetELUICs(): void {
    this.elUICList = [];
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsolidatedReviews.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.elUICList = res?.map((x) => ({
              id: x["uicCode"],
              itemName: x["uicCode"],
              ...x,
            }));
            this.showSpinner = false;
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }
}
