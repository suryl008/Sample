import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort, Sort } from "@angular/material/sort";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { Subject, Subscription, firstValueFrom } from "rxjs";
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
  SearchFieldId,
  SearchFormConfig,
  getSearchFormConfig,
  getLinkField,
} from "../consolidated-review-tab-config";
import { ToastrService } from "ngx-toastr";
import { AddSubRecipientComponent } from "../AdditionalSupport/components/add-sub-recipient/add-sub-recipient.component";

@Component({
  selector: "app-consolidatedreview-search",
  templateUrl: "./ConsolidatedReviewSearch.component.html",
  styleUrls: ["./ConsolidatedReviewSearch.component.scss"],
  standalone: false
})
export class ConsolidatedReviewSearchComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges {
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

  public charteringAgencyList: any[] = [];
  public selectedCharteringAgencyList: any[] = [];
  public psaList: any[] = [];
  public selectedPSAList: any[] = [];

  public currentTabConfig: any;
  public searchForm: SearchFormConfig = getSearchFormConfig("excessfundbal");
  public selectedTabIndex: number = 0;
  public tabList: TabConfig[] = TAB_LIST;
  private routerSubscription: Subscription;

  public tblActionTitle: string = "";
  public filterValue: string = "";
  public linkField: string | null = "sub_rec_name";

  private destroy$ = new Subject<void>();

  constructor(
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private toastrService: ToastrService,
  ) {
    this.responseData = new MatTableDataSource([]);
  }

  async ngOnInit() {
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.selectedIndex = 0;
    if (this.currentTabId) {
      await this.applyTabConfiguration(this.currentTabId);
    }
    this.getProgramMgmtInfo();
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

  setupTableSorting(): void {
    if (this.responseData && this.sort) {
      this.responseData.sort = this.sort;
      this.responseData.sortingDataAccessor = (
        data: any,
        sortHeaderId: string,
      ) => {
        if (sortHeaderId.includes(".")) {
          const properties = sortHeaderId.split(".");
          let value = data;
          for (const prop of properties) {
            value = value ? value[prop] : null;
          }
          return this.getSortableValue(value);
        }

        const value = data[sortHeaderId];
        return this.getSortableValue(value);
      };
    }
  }

  private getSortableValue(value: any): any {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string" && value.startsWith("$")) {
      const numValue = parseFloat(value.replace(/[$,]/g, ""));
      return isNaN(numValue) ? value : numValue;
    }

    if (typeof value === "string") {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return dateValue;
      }
    }

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
    void this.applyTabConfiguration(tabId);
  }

  private async applyTabConfiguration(tabId: TabId): Promise<void> {
    this.showSpinner = true;
    this.responseData.data = [];
    this.consolidatedReviewList = [];
    this.selectedConsolidatedReview = [];
    this.searchObj = {};
    this.filterValue = "";

    const tabConfig = TAB_CONFIGURATIONS[tabId] || TAB_CONFIGURATIONS["excessfundbal"];
    this.currentTabConfig = { ...tabConfig };
    this.searchForm = getSearchFormConfig(tabId);
    this.linkField = getLinkField(tabId);
    this.columnsHeaders = this.currentTabConfig.columns;
    this.displayedColumns = [];
    this.columnsHeaderForDataTable();
    this.searchObj = { ...this.currentTabConfig.searchObj };
    this.tblActionTitle = this.currentTabConfig.tblActionTitle;

    const grantPgm = this.searchObj?.grantPgm;
    if (grantPgm) {
      try {
        await firstValueFrom(this.consolidatedReviewService.ensurePgmIdMap());
      } catch (error) {
        console.error("Unable to load grant program ids.", error);
        this.toastrService.error(
          "Unable to load grant program identifiers for this environment.",
          "Error",
        );
        this.showSpinner = false;
        this.cd.detectChanges();
        return;
      }

      const grantPgmId = this.consolidatedReviewService.getGrantPgmId(grantPgm);
      if (!grantPgmId) {
        this.toastrService.error(
          `Unable to resolve grant program "${grantPgm}" for this environment.`,
          "Error",
        );
        this.showSpinner = false;
        this.cd.detectChanges();
        return;
      }

      this.searchObj.grantPgmId = grantPgmId;
      this.currentTabConfig.grantPgmId = grantPgmId;
    }

    this.loadTabData();
    this.cd.detectChanges();
  }

  loadTabData(): void {
    this.getConsolidatedReviews();
    this.loadReviewTypeList();

    if (this.showsSearchField("charteringAgency")) {
      this.getCharteringAgencyList();
    }
    if (this.showsSearchField("falseElDistrict")) {
      this.GetELDistrictNames();
    }
    if (this.showsSearchField("elUic")) {
      this.GetELUICs();
    }
    if (this.searchForm?.action === "auto") {
      this.getConsolReviewCharteringAgency();
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
    return this.currentTabConfig?.tblActionTitle || "Review";
  }

  onTabChange(event: any): void {
    const selectedTab = this.tabList[event.index];
    if (selectedTab && selectedTab.id !== this.currentTabId) {
      this.changeTab(selectedTab.id);
    }
  }

  changeTab(tabId: TabId): void {
    this.router.navigate([`/consolidatedreview/${tabId}/selectVisit`]);
  }

  showsSearchField(field: SearchFieldId): boolean {
    return this.searchForm?.fields?.includes(field) ?? false;
  }

  isLinkColumn(column: { fieldName: string }): boolean {
    return !!this.linkField && column?.fieldName === this.linkField;
  }

  getSearchFieldPlaceholder(field: SearchFieldId): string {
    switch (field) {
      case "district":
        return this.currentTabConfig?.dropdownPlaceholder || "Please Select District";
      case "reviewType":
        if (this.showsSearchField("district")) {
          return (
            this.currentTabConfig?.dropdown1Placeholder ||
            this.currentTabConfig?.dropdown2Placeholder ||
            "Please Select Program"
          );
        }
        return (
          this.currentTabConfig?.dropdownPlaceholder ||
          this.currentTabConfig?.dropdown1Placeholder ||
          "Please Select"
        );
      case "reviewTypeAgency":
        return this.currentTabConfig?.dropdown2Placeholder || "Please Select";
      case "charteringAgency":
        return "Chartering Agency";
      case "psa":
        return "PSA";
      case "falseElDistrict":
        return this.currentTabConfig?.dropdownPlaceholder || "District Name(s)";
      case "elUic":
        return "UIC(s)";
      default:
        return "Please Select";
    }
  }

  canSearch(): boolean {
    const required = this.searchForm?.requiredFields || [];
    if (!required.length) {
      return this.searchForm?.action === "auto";
    }
    return required.every((field) => this.hasRequiredSearchValue(field));
  }

  runSearch(): void {
    if (!this.canSearch()) {
      this.toastrService.warning(
        "Select required fields and click Search",
        "Search",
      );
      return;
    }

    switch (this.searchForm?.action) {
      case "charteringAgency":
        this.getConsolReviewCharteringAgency();
        break;
      case "searchResult":
        this.getConsolReviewSearchResult();
        break;
      case "falseEl":
        this.getFalseELInfo();
        break;
      case "auto":
        this.getConsolReviewCharteringAgency();
        break;
      default:
        break;
    }
  }

  private hasRequiredSearchValue(field: SearchFieldId): boolean {
    switch (field) {
      case "district":
        return this.selectedConsolidatedReview?.length > 0;
      case "reviewType":
        return this.selectedReviewTypeList?.length > 0;
      case "reviewTypeAgency":
        return this.selectedReviewTypeAgencyList?.length > 0;
      case "charteringAgency":
        return this.selectedCharteringAgencyList?.length > 0;
      case "psa":
        return this.selectedPSAList?.length > 0;
      case "falseElDistrict":
        return this.selectedDistrictNameList?.length > 0;
      case "elUic":
        return this.selectedELUICList?.length > 0;
      default:
        return false;
    }
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
        this.searchObj["agencyId"] = null;
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
      case "ca":
        this.searchObj["charteringAgency"] = null;
        this.selectedPSAList = [];
        this.selectedCharteringAgencyList = selectedList?.selectedItemsValues;
        this.searchObj["charteringAgency"] =
          this.selectedCharteringAgencyList[0]?.refCode || null;
        this.searchObj["wfCd"] = this.reviewTypeList[0]?.wf_cd || null;
        await this.getPSAList(
          this.selectedCharteringAgencyList[0]?.refCode || null,
        );
        break;
      case "psa":
        this.searchObj["PSA"] = null;
        this.selectedPSAList = selectedList?.selectedItemsValues;
        this.searchObj["PSA"] = this.selectedPSAList[0]?.refDesc || null;
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
          case "psalegacy":
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
    let payload = {
      grantPgmId: this.searchObj?.grantPgmId,
      rvwType: "",
      rvwTypeDesc: "",
      option: "R",
      recStat: "O",
      orderBy: "",
      userId: this.userDetails?.userId,
    };

     this.httpClient.get("assets/api-data/ConsolidatedReview/GetRvwTypeLookUp.json")
    //this.consolidatedReviewService.getProgramReviewTypeInfo(payload)
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
    const grantPgm =
      this.searchObj?.grantPgm || this.currentTabConfig?.searchObj?.grantPgm;

    if (!grantPgmId) {
      this.toastrService.error(
        "Unable to resolve the grant program for this tab in the current environment.",
        "Error",
      );
      return;
    }

    const dialogRef = this.dialog.open(AddSubRecipientComponent, {
      width: "600px",
      maxHeight: "90vh",
      panelClass: ["consolidated-reviews-overlay", "add-sub-recipient-dialog"],
      data: {
        pageName: "addnewsubrecipient",
        mode: "",
        headerName: "Add for Selected Sub-Recipient",
        subrecData: event,
        grantPgmId: grantPgmId,
        reviewType: reviewType,
        grantPgm: grantPgm,
        reviewYear: this.programMgmtInfo[0]?.rvw_start,
        currentTabId: this.currentTabId,
        currentTabTitle: this.getCurrentTabTitle(),
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addConsolidatedReview(result);
        if (this.currentTabId === "ltclaimexcep") {
          const newlyAddedItem = this.reviewTypeList.find(
            (item) => item.id === result?.reviewType,
          );
          this.selectedReviewTypeList = [newlyAddedItem];
        }
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

    let payload1 = {
      grantPgmId: this.searchObj?.grantPgmId,
      rvwType: this.searchObj?.rvwType,
      agencyId: this.searchObj?.agencyId,
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

  private getGrantPgmIdForCurrentTab(): number | null {
    if (this.searchObj?.grantPgmId) {
      return this.searchObj.grantPgmId;
    }

    if (this.currentTabConfig?.grantPgmId) {
      return this.currentTabConfig.grantPgmId;
    }

    return this.consolidatedReviewService.getGrantPgmId(
      this.searchObj?.grantPgm || this.currentTabConfig?.searchObj?.grantPgm,
    );
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
    console.log(this.searchObj);
    const payload = {
      grantPgmId: this.searchObj?.grantPgmId,
      rvwType: this.searchObj?.rvwType || 'DRT',
      agencyId: this.searchObj?.agencyId || 0,
    };

    this.showSpinner = true;
    this.consolidatedReviewService.getConsolidatedReviews(payload)
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
      rvwYear: this.searchObj["rvwYear"]
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
    this.selectedReviewTypeList = [];
    this.selectedReviewTypeAgencyList = [];
    this.selectedDistrictNameList = [];
    this.selectedELUICList = [];
    this.selectedCharteringAgencyList = [];
    this.selectedPSAList = [];
    this.districtName = null;
    this.districtCode = null;
    this.uicCode = null;
    this.responseData.data = [];
    this.filterValue = "";
    this.programSearch = "";
    this.filteredPrograms = this.programMgmtInfo;

    // Reset to default configuration
    if (this.currentTabConfig) {
      this.searchObj = { ...this.currentTabConfig.searchObj };
      if (this.currentTabConfig.grantPgmId) {
        this.searchObj.grantPgmId = this.currentTabConfig.grantPgmId;
      }
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
      panelClass: "consolidated-reviews-overlay",
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
      this.loadTabConfiguration(this.currentTabId);
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

  getCharteringAgencyList(): void {
    this.charteringAgencyList = [];
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetConsolidatedReviews.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            this.charteringAgencyList = res?.map((x) => ({
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

  getPSAList(refSubType: any): void {
    this.psaList = [];
    this.showSpinner = true;
  }

  showEEMAmendmentInfo(element: any): void {
    this.dialog.open(ConsolidatedReviewPopupComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "80%",
      height: "80%",
      panelClass: "consolidated-reviews-overlay",
      data: {
        pageName: "eemAmendment",
        headerName: "EEM Amendment",
        visitSelectedData: {
          ...element,
          programName:
            element?.programName ||
            element?.grant_pgm_desc ||
            element?.grantPgm ||
            "",
          rvw_type_desc: element?.rvw_type_desc || this.currentTabConfig?.title,
          sub_rec_name: element?.sub_rec_name || element?.sub_rec_cd || "",
          rvw_ref_no: element?.rvw_ref_no || "",
          sub_rvw_id: element?.sub_rvw_id || element?.id || 0,
        },
        currentTabId: this.currentTabId,
      },
      autoFocus: false,
    });
  }
}
