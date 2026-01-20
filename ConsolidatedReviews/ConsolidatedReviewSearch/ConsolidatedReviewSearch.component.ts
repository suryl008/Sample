import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  Input,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

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
  @ViewChild("paginator1") paginator1: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() emitTabData = new EventEmitter();

  public showSpinner: boolean = false;
  public activeStatus: any;
  public responseData: MatTableDataSource<any>;
  public selectedIndex: number = 0;

  public initialResponseData: any = [];
  public consolidatedReviewList: any = [];
  public selectedConsolidatedReview: any = [];
  public displayedColumns: string[] = [];
  public searchObj: any = {};
  public userDetails: any;
  public isAddOrEdit: boolean = false;

  public directorList: any = [];
  public subRecipientList: any = [];
  public initialdirectorList: any = [];
  public initialSubRecipientList: any = [];
  public filterEntities: any = [];
  public directorSearchResult: MatTableDataSource<any>;
  public directorResult: MatTableDataSource<any>;

  public addNewVisitorCode: string = "";
  public columnsHeaders: any[] = [];

  //public currentTabId: TabId = "excessfundbal";
  public currentTabConfig: any;
  public selectedTabIndex: number = 0;
  public tabList: TabConfig[] = TAB_LIST;
  private routerSubscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.responseData = new MatTableDataSource([]);
    this.directorSearchResult = new MatTableDataSource([]);
    this.directorResult = new MatTableDataSource([]);
  }

  async ngOnInit() {
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.selectedIndex = 0;

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleRouteChange();
      });

    // Load configuration based on input or route
    if (this.currentTabId) {
      this.loadTabConfiguration(this.currentTabId);
    } else {
      this.handleRouteChange();
    }

    this.getDirectorDropdown();
    this.getSubRecipientList();
    this.getDirectorList();
  }

  ngAfterViewInit() {
    if (this.responseData) {
      this.responseData.sort = this.sort;
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  handleRouteChange(): void {
    // Get current tab ID from URL
    const urlSegments = this.router.url.split("/");
    let tabSegment = urlSegments[urlSegments.length - 1];

    // If we're in a details page, get the previous segment
    if (tabSegment === "selectVisit" || tabSegment === "visitDetails") {
      tabSegment = urlSegments[urlSegments.length - 2];
    }

    // Check if the segment is a valid tab ID
    if (tabSegment && TAB_CONFIGURATIONS[tabSegment as TabId]) {
      this.currentTabId = tabSegment as TabId;
    } else {
      this.currentTabId = "excessfundbal"; // Default tab
    }

    // Update selected tab index
    const tabIndex = this.tabList.findIndex(
      (tab) => tab.id === this.currentTabId,
    );
    if (tabIndex > -1) {
      this.selectedTabIndex = tabIndex;
    }

    // Load configuration for current tab
    this.loadTabConfiguration(this.currentTabId);
  }

  loadTabConfiguration(tabId: TabId): void {
    this.showSpinner = true;

    // Reset data
    this.responseData.data = [];
    this.consolidatedReviewList = [];
    this.selectedConsolidatedReview = [];

    // Load configuration
    this.currentTabConfig = TAB_CONFIGURATIONS[tabId];

    if (this.currentTabConfig) {
      // Update columns
      this.columnsHeaders = this.currentTabConfig.columns;
      this.displayedColumns = [];
      this.columnsHeaderForDataTable();

      // Update search object
      this.searchObj = { ...this.currentTabConfig.searchObj };

      // Load data for the tab
      this.loadTabData();
    } else {
      // Default configuration
      this.columnsHeaders = TAB_CONFIGURATIONS["excessfundbal"].columns;
      this.searchObj = { ...TAB_CONFIGURATIONS["excessfundbal"].searchObj };
      this.loadTabData();
    }
  }

  loadTabData(): void {
    // Load lookup data for the current tab
    this.getConsolidatedReviewsForLookup();

    // If there's a preselected value, load the chartering agency data
    if (this.searchObj.charteringAgency) {
      setTimeout(() => {
        this.getConsolReviewCharteringAgency();
      }, 500);
    }
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

  onTabChange(event: any): void {
    const selectedTab = this.tabList[event.index];
    if (selectedTab && selectedTab.id !== this.currentTabId) {
      this.changeTab(selectedTab.id);
    }
  }

  changeTab(tabId: TabId): void {
    // Navigate to the tab route
    this.router.navigate([`/consolidated-review/${tabId}`]);
  }

  updatedSelectedValue(selectedList: any): void {
    this.selectedConsolidatedReview = selectedList?.selectedItemsValues;

    if (
      this.selectedConsolidatedReview &&
      this.selectedConsolidatedReview.length > 0
    ) {
      // Update search object based on selected item
      this.searchObj.charteringAgency =
        this.selectedConsolidatedReview[0]?.itemCode || null;

      // For some tabs, we might need additional data
      if (this.selectedConsolidatedReview[0]?.rawData) {
        const rawData = this.selectedConsolidatedReview[0].rawData;

        switch (this.currentTabId) {
          case "contrpage":
            this.searchObj.contractId = rawData.contract_id;
            break;
          case "psacontrrvw":
            this.searchObj.psaId = rawData.psa_id;
            break;
          // Add other cases as needed
        }
      }
    }
  }

  openAddorEditEmailTemplatePopup(event: any, Mode: any): void {
    const dialogRef = this.dialog.open(ConsolidatedReviewPopupComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "80%",
      height: "80%",
      data: {
        pageName: "emailTemplate",
        mode: Mode,
        headerName:
          Mode == "add" ? "Add Email Template" : "Edit Email Template",
        emailData: event,
      },
      autoFocus: false,
    });
  }

  getConsolidatedReviewsForLookup(): void {
    this.showSpinner = true;

    const apiEndpoint = this.getLookupApiEndpoint();

    this.httpClient.get(apiEndpoint).subscribe(
      (res: any) => {
        if (res != null) {
          this.initialResponseData = res[0] || [];
          this.consolidatedReviewList = this.initialResponseData.map(
            (element: any) => ({
              id:
                element.sub_rvw_id ||
                element.contract_id ||
                element.psa_id ||
                element.investment_id,
              itemName: this.formatItemName(element),
              itemCode:
                element.sub_rec_cd ||
                element.contract_number ||
                element.psa_number ||
                element.investment_id,
              rawData: element,
            }),
          );
          this.showSpinner = false;
        }
      },
      (error) => {
        this.showSpinner = false;
        console.error("Error loading lookup data:", error);
      },
    );
  }

  private getLookupApiEndpoint(): string {
    return (
      this.currentTabConfig?.apiEndpoint ||
      "assets/api-data/ConsolidatedReview/FundBalConsolLookup.json"
    );
  }

  private formatItemName(element: any): string {
    switch (this.currentTabId) {
      case "contrpage":
      case "cnpcontr":
        return `${element.contract_name || element.name} [${
          element.contract_number || element.id
        }] - ${element.contract_date || ""}`;
      case "psacontrrvw":
        return `${element.psa_name || element.name} [${
          element.psa_number || element.id
        }] - ${element.start_date || ""}`;
      case "clswallinv":
        return `${element.investment_name || element.name} [${
          element.investment_id || element.id
        }] - ${element.close_date || ""}`;
      case "10cent":
      case "31n6beyondhir":
        return `${element.program_name || element.name} [${
          element.program_code || element.id
        }]`;
      case "privschconsult":
        return `${element.school_name || element.name} [${
          element.school_code || element.id
        }]`;
      default:
        return `${element.sub_rec_name || element.name} [${
          element.sub_rec_cd || element.id
        }] - ${element.rvw_yr || ""}`;
    }
  }

  getConsolReviewCharteringAgency(): void {
    if (!this.searchObj.charteringAgency) {
      alert("Please select a district/contract/program first");
      return;
    }

    this.showSpinner = true;

    let payload = {
      grantPgmId: this.searchObj?.grantPgmId,
      rvwType: this.searchObj?.rvwType,
      charteringAgency: this.searchObj["charteringAgency"],
      PSA: this.searchObj["PSA"],
      rvwYear: this.searchObj["rvwYear"],
      contractId: this.searchObj["contractId"],
      psaId: this.searchObj["psaId"],
      exceptionType: this.searchObj["exceptionType"],
    };

    const apiEndpoint =
      this.currentTabConfig?.chartAgencyEndpoint ||
      "assets/api-data/ConsolidatedReview/ConsolRvwChartAgency.json";

    this.httpClient.get(apiEndpoint).subscribe(
      (res: any) => {
        if (res != null) {
          this.responseData = new MatTableDataSource(res[0] || []);
          if (this.sort) {
            this.responseData.sort = this.sort;
          }
          setTimeout(() => {
            this.responseData.paginator = this.paginator;
            this.showSpinner = false;
          });
        }
      },
      (error) => {
        this.showSpinner = false;
        console.error("Error loading chartering agency data:", error);
      },
    );
  }

  getDirectorDropdown(): void {
    this.httpClient
      .get("assets/api-data/GetAllRvwTypes.json")
      .subscribe((res) => {
        this.initialdirectorList = res;
        this.directorList = res;
      });
  }

  getSubRecipientList(): void {
    this.httpClient
      .get("assets/api-data/GetAllRvwTypes.json")
      .subscribe((res) => {
        this.initialSubRecipientList = res;
        this.subRecipientList = res;
      });
  }

  getDirectorList(): void {
    this.httpClient
      .get("assets/api-data/DirectorVisit/Table1.json")
      .subscribe((res: any) => {
        this.directorResult = new MatTableDataSource(res[0] || []);
        setTimeout(() => (this.directorResult.paginator = this.paginator));
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.responseData.filter = filterValue.trim().toLowerCase();
  }

  addNewVisitor(): void {
    // Implementation for adding new visitor
  }

  changeAutoComplete(type: string, autoComplete: any, event: any): void {
    if (event.isUserInput) {
      // Handle auto-complete change
    }
  }

  clearAutoComplete(type: string): void {
    // Clear auto-complete
  }

  filterAutoComplete(field: string): void {
    if (field == "director") {
      this.directorList = [];
      this.initialdirectorList.forEach((element: any) => {
        var directorCode: string;
        var directorName: string;
        directorCode = element.directorCode;
        directorName = element.directorName;
        if (
          directorName
            .toLocaleLowerCase()
            .includes(this.searchObj.directorName?.toLowerCase() || "") ||
          directorCode
            .toLocaleLowerCase()
            .includes(this.searchObj.directorName?.toLowerCase() || "")
        ) {
          this.directorList.push(element);
        }
      });
    }
    if (field == "subRecipient") {
      this.subRecipientList = [];
      this.initialSubRecipientList.forEach((element: any) => {
        var subRecipientCode: string;
        var subRecipientDesc: string;
        subRecipientCode = element.subRecipientCode;
        subRecipientDesc = element.subRecipientName;
        if (
          subRecipientCode
            .toLocaleLowerCase()
            .includes(this.searchObj.subRecipientName?.toLowerCase() || "") ||
          subRecipientDesc
            .toLocaleLowerCase()
            .includes(this.searchObj.subRecipientName?.toLowerCase() || "")
        ) {
          this.subRecipientList.push(element);
        }
      });
    }
  }

  searchReporting(): void {
    this.httpClient
      .get("assets/api-data/DirectorVisit/Table2.json")
      .subscribe((res: any) => {
        this.directorSearchResult = new MatTableDataSource(res[0] || []);
        setTimeout(
          () => (this.directorSearchResult.paginator = this.paginator1),
        );
      });
  }

  openDirectorVisitDetails(element: any): void {
    this.selectedIndex = 1;
    this.emitTabData.emit({
      selectedPage: "visitDetails",
      showDetails: true,
      directorVisitSelectedID: element?.sub_rvw_id,
    });
  }

  openReviewDetails(element: any): void {
    this.selectedIndex = 1;
    this.emitTabData.emit({
      selectedPage: "visitDetails",
      showDetails: true,
      visitSelectedData: {
        ...element,
        currentTabId: this.currentTabId,
        currentTabTitle: this.getCurrentTabTitle(),
      },
    });
  }

  // openReviewDetails(element: any): void {
  //   this.selectedIndex = 1;
  //   this.emitTabData.emit({
  //     selectedPage: "visitDetails",
  //     showDetails: true,
  //     visitSelectedData: element,
  //   });
  // }

  openContactsDetails(element: any): void {
    const dialogRef = this.dialog.open(ConsolidatedReviewPopupComponent, {
      maxWidth: "150vw",
      maxHeight: "200vh",
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

    if (!value && value !== 0) return "";

    switch (column.type) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(Number(value));
      case "date":
        return new Date(value).toLocaleDateString();
      case "number":
        return Number(value).toLocaleString();
      default:
        return String(value);
    }
  }

  getCellTitle(element: any, column: any): string {
    const value = element[column.fieldName];

    if (!value && value !== 0) return "";

    switch (column.type) {
      case "currency":
        return `$${Number(value).toFixed(2)}`;
      case "date":
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      default:
        return String(value);
    }
  }
}

// import { RvwType } from "src/app/pages/program-administration/models/rvw-type.model";
// import { ConsolidatedReviewService } from "./../../../shared/services/consolidated-review.service";
// import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
// import { HttpClient } from "@angular/common/http";
// import { MatDialog } from "@angular/material/dialog";
// import { MatPaginator } from "@angular/material/paginator";
// import { MatTableDataSource } from "@angular/material/table";
// import { SharedService } from "src/app/shared/services/shared.service";
// import { ConsolidatedReviewPopupcomponent } from "../ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";
// import { MatSort } from "@angular/material/sort";

// import {
//   Component,
//   EventEmitter,
//   OnInit,
//   Output,
//   ViewChild,
//   OnDestroy,
// } from "@angular/core";
// import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
// import { filter } from "rxjs/operators";
// import { Subscription } from "rxjs";
// import { TAB_CONFIGURATIONS, TabId } from "../consolidated-review-tab-config";

// export type labelPosition = "before" | "after";

// @Component({
//   selector: "app-consolidatedreview-search",
//   templateUrl: "./ConsolidatedReviewSearch.component.html",
//   styleUrls: ["./ConsolidatedReviewSearch.component.scss"],
// })
// export class ConsolidatedReviewSearchComponent implements OnInit, OnDestroy {
//   constructor(
//     public dialog: MatDialog,
//     private httpClient: HttpClient,
//     private programAdministrationService: ProgramAdministrationService,
//     private consolidatedReviewService: ConsolidatedReviewService,
//     private sharedService: SharedService,
//     private router: Router,
//     private activatedRoute: ActivatedRoute
//   ) {}
//   ngOnDestroy(): void {
//     throw new Error("Method not implemented.");
//   }

//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   @ViewChild("paginator1") paginator1: MatPaginator;
//   @ViewChild(MatSort) sort: MatSort;

//   @Output() emitTabData = new EventEmitter();

//   public headerMenu: any;
//   public showSpinner: boolean;
//   public activeStatus: any;
//   public responseData: any;
//   public selectedIndex: number;

//   public initialResponseData: any = [];
//   public consolidatedReviewList: any = [];
//   public selectedConsolidatedReview: any = [];
//   public displayedColumns: any = [];
//   public searchObj: any = {};
//   public userDetails: any;
//   public isAddOrEdit: boolean = false;

//   public directorList: any = [];
//   public subRecipientList: any = [];
//   public initialdirectorList: any = [];
//   public initialSubRecipientList: any = [];
//   public filterEntities: any = [];
//   public directorSearchResult: any = [];
//   public directorResult: any = [];

//   public addNewVisitorCode: string = "";

//   public currentTabId: TabId = "excessfundbal";
//   public currentTabConfig: any;
//   private routerSubscription: Subscription;

//   public columnsHeaders = [
//     { fieldName: "sub_rec_name", headerName: "District", visible: true },
//     {
//       fieldName: "ExcessFundBalance",
//       headerName: "Excess Fund Balance",
//       visible: true,
//     },
//     {
//       fieldName: "sub_rec_cd",
//       headerName: "Sub-Recipient Code",
//       visible: true,
//     },
//     {
//       fieldName: "LastActivity",
//       headerName: "Date of Last Activity",
//       visible: true,
//     },
//     {
//       fieldName: "rvw_stage_desc",
//       headerName: "Review Stage Description",
//       visible: true,
//     },
//     { fieldName: "AssignedTo", headerName: "Assigned To", visible: true },
//     { fieldName: "rvw_yr", headerName: "Review Year", visible: true },
//   ];

//   // Model
//   public selectVisitFormSearch: any = {};

//   public tempClearSearch: any = {
//     directorName: "",
//     subRecipientName: "",
//     filterEntities: 1,
//   };

//   async ngOnInit() {
//     this.userDetails = this.programAdministrationService.getUserDetails();
//     //this.isAddOrEdit = this.sharedService.checkIsAddOrEdit('ConsolRvw');

//     this.selectedIndex = 0;

//     // Subscribe to route changes
//     this.routerSubscription = this.router.events
//       .pipe(filter((event) => event instanceof NavigationEnd))
//       .subscribe(() => {
//         this.handleRouteChange();
//       });

//     // Initial load
//     this.handleRouteChange();

//     // await this.getConsolidatedReviewsForLookup();
//     // await this.columnsHeaderForDataTable();

//     // this.filterEntities = [
//     //   { status: "Assigned", value: 1 },
//     //   { status: "UnAssigned", value: 0 },
//     // ];

//     this.getDirectorDropdown();
//     this.getSubRecipientList();
//     this.getDirectorList();
//   }

//   handleRouteChange() {
//     // Get current tab ID from URL
//     const urlSegments = this.router.url.split("/");
//     const tabSegment = urlSegments[urlSegments.length - 1];

//     // Check if the segment is a valid tab ID
//     if (tabSegment && TAB_CONFIGURATIONS[tabSegment as TabId]) {
//       this.currentTabId = tabSegment as TabId;
//     } else {
//       this.currentTabId = "excessfundbal"; // Default tab
//     }

//     // Load configuration for current tab
//     this.currentTabConfig = TAB_CONFIGURATIONS[this.currentTabId];

//     // Update columns
//     this.columnsHeaders = this.currentTabConfig.columns;
//     this.displayedColumns = [];
//     this.columnsHeaderForDataTable();

//     // Update search object
//     this.searchObj = { ...this.currentTabConfig.searchObj };

//     // Load data for current tab
//     this.getConsolidatedReviewsForLookup();
//   }

//   ngAfterViewInit() {
//     if (this.responseData) {
//       this.responseData.sort = this.sort;
//     }
//   }

//   columnsHeaderForDataTable() {
//     this.columnsHeaders.forEach((element) => {
//       this.displayedColumns.push(element.fieldName);
//     });
//     this.displayedColumns.push("action");
//   }

//   updatedSelectedValue(selectedList: any) {
//     this.selectedConsolidatedReview = selectedList?.selectedItemsValues;

//     this.searchObj["grantPgmId"] = 570;
//     this.searchObj["charteringAgency"] = null;
//     this.searchObj["rvwType"] = "DRT";
//     this.searchObj["PSA"] = "";
//     this.searchObj["rvwYear"] = null;

//     this.searchObj["charteringAgency"] =
//       this.selectedConsolidatedReview[0]?.itemCode || null;
//   }

//   openAddorEditEmailTemplatePopup(event: any, Mode: any) {
//     const dialogRef = this.dialog.open(ConsolidatedReviewPopupcomponent, {
//       maxWidth: "100vw",
//       maxHeight: "100vh",

//       width: "80%",
//       height: "80%",
//       data: {
//         pageName: "emailTemplate",
//         mode: Mode,
//         headerName:
//           Mode == "add" ? "Add Email Template" : "Edit Email Template",
//         emailData: event,
//       },
//       autoFocus: false,
//     });
//   }

//   getConsolidatedReviewsForLookup() {
//     this.showSpinner = true;

//     // Use the API endpoint from current tab config
//     this.httpClient.get(this.currentTabConfig.apiEndpoint).subscribe(
//       (res: any) => {
//         if (res != null) {
//           this.initialResponseData = [] = res[0];
//           this.consolidatedReviewList = res[0].map((element: any) => ({
//             id: element.sub_rvw_id,
//             itemName:
//               element.sub_rec_name +
//               " [" +
//               element.sub_rec_cd +
//               "]" +
//               " - " +
//               element.rvw_yr,
//             itemCode: element.sub_rec_cd,
//           }));
//           this.showSpinner = false;
//         }
//       },
//       (error) => {
//         this.showSpinner = false;
//       }
//     );
//   }

//   // getConsolidatedReviewsForLookup() {
//   //   this.showSpinner = true;
//   //   // this.consolidatedReviewService
//   //   //   .getConsolidatedReviews(570, "DRT", 0)
//   //   this.httpClient
//   //     .get("assets/api-data/ConsolidatedReview/FundBalConsolLookup.json")
//   //     .subscribe(
//   //       (res: any) => {
//   //         if (res != null) {
//   //           this.initialResponseData = [] = res[0];
//   //           this.consolidatedReviewList = res[0].map((element: any) => ({
//   //             id: element.sub_rvw_id,
//   //             itemName:
//   //               element.sub_rec_name +
//   //               " [" +
//   //               element.sub_rec_cd +
//   //               "]" +
//   //               " - " +
//   //               element.rvw_yr,
//   //             itemCode: element.sub_rec_cd,
//   //           }));
//   //           this.showSpinner = false;
//   //         }
//   //       },
//   //       (error) => {
//   //         this.showSpinner = false;
//   //       }
//   //     );
//   // }

//   // Update this method to use current tab's searchObj
//   getConsolReviewCharteringAgency() {
//     let payload = {
//       grantPgmId: this.searchObj?.grantPgmId,
//       rvwType: this.searchObj?.rvwType,
//       charteringAgency: this.searchObj["charteringAgency"],
//       PSA: this.searchObj["PSA"],
//       rvwYear: this.searchObj["rvwYear"],
//     };

//     // You can also make API endpoints dynamic based on tab
//     const apiEndpoint = this.getCharteringAgencyApiEndpoint();

//     this.httpClient.get(apiEndpoint).subscribe((res: any) => {
//       if (res != null) {
//         this.responseData = new MatTableDataSource(res[0]);
//         if (this.sort) {
//           this.responseData.sort = this.sort;
//         }
//         setTimeout(() => (this.responseData.paginator = this.paginator));
//       }
//     });
//   }

//   private getCharteringAgencyApiEndpoint(): string {
//     // Return different endpoints based on tab
//     switch (this.currentTabId) {
//       case "excessfundbal":
//         return "assets/api-data/ConsolidatedReview/ConsolRvwChartAgency.json";
//       case "ltclaimexcep":
//         return "assets/api-data/ConsolidatedReview/LTClaimChartAgency.json";
//       case "contrpage":
//         return "assets/api-data/ConsolidatedReview/ContractChartAgency.json";
//       // Add cases for other tabs...
//       default:
//         return "assets/api-data/ConsolidatedReview/ConsolRvwChartAgency.json";
//     }
//   }

//   // Helper method to change tabs
//   changeTab(tabId: TabId) {
//     this.currentTabId = tabId;
//     this.router.navigate([`/consolidated-review/${tabId}`]);
//   }

//   // getConsolReviewCharteringAgency() {
//   //   let payload = {
//   //     grantPgmId: this.searchObj?.grantPgmId,
//   //     rvwType: this.searchObj?.rvwType,
//   //     charteringAgency: this.searchObj["charteringAgency"],
//   //     PSA: this.searchObj["PSA"],
//   //     rvwYear: this.searchObj["rvwYear"],
//   //   };
//   //   // this.consolidatedReviewService
//   //   //   .getConsolReviewCharteringAgency(payload)
//   //   this.httpClient
//   //     .get("assets/api-data/ConsolidatedReview/ConsolRvwChartAgency.json")
//   //     .subscribe((res: any) => {
//   //       if (res != null) {
//   //         this.responseData = new MatTableDataSource(res[0]);
//   //         if (this.sort) {
//   //           this.responseData.sort = this.sort;
//   //         }
//   //         setTimeout(() => (this.responseData.paginator = this.paginator));
//   //       }
//   //     });
//   // }

//   getDirectorDropdown() {
//     this.httpClient
//       .get("assets/api-data/GetAllRvwTypes.json")
//       .subscribe((res) => {
//         this.initialdirectorList = res;
//         this.directorList = res;
//       });
//   }

//   getSubRecipientList() {
//     this.httpClient
//       .get("assets/api-data/GetAllRvwTypes.json")
//       .subscribe((res) => {
//         this.initialSubRecipientList = res;
//         this.subRecipientList = res;
//       });
//   }

//   getDirectorList() {
//     this.httpClient
//       .get("assets/api-data/DirectorVisit/Table1.json")
//       .subscribe((res: any) => {
//         this.directorResult = new MatTableDataSource(res[0]);
//         setTimeout(() => (this.directorResult.paginator = this.paginator));
//       });
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.directorResult.filter = filterValue.trim().toLowerCase();
//   }

//   addNewVisitor() {}

//   changeAutoComplete(type, autoComplete, event) {
//     if (event.isUserInput) {
//     }
//   }

//   clearAutoComplete(type) {}

//   filterAutoComplete(field) {
//     if (field == "director") {
//       this.directorList = [];
//       this.initialdirectorList.forEach((element) => {
//         var directorCode: string;
//         var directorName: string;
//         directorCode = element.directorCode;
//         directorName = element.directorName;
//         if (
//           directorName
//             .toLocaleLowerCase()
//             .includes(this.tempClearSearch.directorName.toLowerCase()) ||
//           directorName
//             .toLocaleLowerCase()
//             .includes(this.tempClearSearch.directorName.toLowerCase()) ||
//           (
//             directorName.toLocaleLowerCase() +
//             " (" +
//             directorName.toLocaleLowerCase() +
//             ")"
//           ).includes(this.tempClearSearch.directorName.toLowerCase())
//         ) {
//           this.directorList.push(element);
//         }
//       });
//     }
//     if (field == "subRecipient") {
//       this.subRecipientList = [];
//       this.initialSubRecipientList.forEach((element) => {
//         var subRecipientCode: string;
//         var subRecipientDesc: string;
//         subRecipientCode = element.subRecipientCode;
//         subRecipientDesc = element.subRecipientName;
//         if (
//           subRecipientCode
//             .toLocaleLowerCase()
//             .includes(this.tempClearSearch.subRecipientName.toLowerCase()) ||
//           subRecipientDesc
//             .toLocaleLowerCase()
//             .includes(this.tempClearSearch.subRecipientName.toLowerCase()) ||
//           (
//             subRecipientDesc.toLocaleLowerCase() +
//             " (" +
//             subRecipientCode.toString().toLocaleLowerCase() +
//             ")"
//           ).includes(this.tempClearSearch.grantPgmDesc.toLowerCase())
//         ) {
//           this.subRecipientList.push(element);
//         }
//       });
//     }
//   }

//   searchReporting() {
//     this.httpClient
//       .get("assets/api-data/DirectorVisit/Table2.json")
//       .subscribe((res: any) => {
//         this.directorSearchResult = new MatTableDataSource(res[0]);
//         setTimeout(
//           () => (this.directorSearchResult.paginator = this.paginator1)
//         );
//       });
//   }

//   openDirectorVisitDetails(element) {
//     this.selectedIndex = 1;
//     this.emitTabData.emit({
//       selectedPage: "visitDetails",
//       showDetails: true,
//       directorVisitSelectedID: element?.sub_rvw_id,
//     });
//   }

//   openReviewDetails(element) {
//     this.selectedIndex = 1;
//     this.emitTabData.emit({
//       selectedPage: "visitDetails",
//       showDetails: true,
//       visitSelectedData: element,
//     });
//   }

//   openContactsDetails(element) {
//     const dialogRef = this.dialog.open(ConsolidatedReviewPopupcomponent, {
//       maxWidth: "150vw",
//       maxHeight: "200vh",

//       width: "40%",
//       height: "40%",
//       data: {
//         pageName: "directorContact",
//         headerName: "Contact Details",
//         emitdata: element,
//       },
//       autoFocus: false,
//     });
//   }
// }
