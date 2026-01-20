// ConsolidatedReviewContainer.component.ts
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { Subscription } from "rxjs";
import { TAB_CONFIGURATIONS, TabId } from "../consolidated-review-tab-config";

export type labelPosition = "before" | "after";

@Component({
  selector: "app-consolidatedreview-container",
  templateUrl: "./ConsolidatedReviewContainer.component.html",
  styleUrls: ["./ConsolidatedReviewContainer.component.scss"],
})
export class ConsolidatedReviewContainerComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";

  public headerMenu: any = [];
  public selectedPage: string = "selectVisit";
  public selectedIndex: number = 0;
  public visitSelectedData: any = [];
  public currentTabId: TabId = "excessfundbal";
  private routerSubscription: Subscription;
  public mode: any;

  ngOnInit() {
    this.initializeHeaderMenu();

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleRouteChange();
      });

    // Initial route handling
    this.handleRouteChange();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  initializeHeaderMenu(): void {
    this.headerMenu = [
      {
        tabHeaderName: "Select Plans",
        visible: true,
        selectedPage: "selectVisit",
      },
      {
        tabHeaderName: "Plan Details",
        visible: false,
        selectedPage: "visitDetails",
      },
    ];
  }

  handleRouteChange(): void {
    // Get current tab ID from URL
    const urlSegments = this.router.url.split("/");

    // Find the consolidated review segment
    const consolidatedIndex = urlSegments.findIndex(
      (segment) => segment === "consolidatedreview"
    );

    if (consolidatedIndex !== -1) {
      // Look for tab ID after the consolidatedreview segment
      for (let i = consolidatedIndex + 1; i < urlSegments.length; i++) {
        const segment = urlSegments[i];
        if (segment && TAB_CONFIGURATIONS[segment as TabId]) {
          this.currentTabId = segment as TabId;
          this.updateHeaderMenuTitle();
          break;
        }
      }
    }

    // Set default if not found
    if (!this.currentTabId || !TAB_CONFIGURATIONS[this.currentTabId]) {
      this.currentTabId = "excessfundbal";
      this.updateHeaderMenuTitle();
    }
  }

  updateHeaderMenuTitle(): void {
    const tabConfig = TAB_CONFIGURATIONS[this.currentTabId];
    if (tabConfig) {
      // Update header menu titles based on current tab
      this.headerMenu[0].tabHeaderName = `Select ${tabConfig.title} Plans`;
      this.headerMenu[1].tabHeaderName = `${tabConfig.title} Plan Details`;
    }
  }

  getHeaderTabSelection(event) {
    this.selectedPage = event;
    this.selectedIndex = this.headerMenu.findIndex(
      (item) => item.selectedPage === event
    );
  }

  emitTabData(event) {
    this.selectedPage = event.selectedPage;
    this.visitSelectedData = event?.visitSelectedData;

    // Pass current tab ID to visit details
    if (this.visitSelectedData) {
      this.visitSelectedData.currentTabId = this.currentTabId;
    }

    // Update header menu visibility
    this.headerMenu.forEach((x, i) => {
      x.visible = event?.showDetails == false && i != 0 ? false : true;
    });

    this.selectedIndex = this.headerMenu.findIndex((object) => {
      return object.selectedPage === event.selectedPage;
    });
  }

  emitEnhancedData(event) {
    this.visitSelectedData = event;
    console.log(this.visitSelectedData);
  }
}

// import { HttpClient } from "@angular/common/http";
// import { ThisReceiver } from "@angular/compiler";
// import { Component, OnInit, ViewChild } from "@angular/core";
// import { MatDialog } from "@angular/material/dialog";
// import { MatPaginator } from "@angular/material/paginator";

// export type labelPosition = "before" | "after";
// const ELEMENT_DATA = [
//   {
//     name: "Suresh P",
//     program: "Prog -1",
//     reviewType: "Review-1",
//     createdOn: "suresh.p@gmail.com",
//     assignedUsers: "Karthik GB",
//   },
//   {
//     name: "Suresh P",
//     program: "Prog -1",
//     reviewType: "Review-1",
//     createdOn: "suresh.p@gmail.com",
//     assignedUsers: "Karthik GB",
//   },
//   {
//     name: "Suresh P",
//     program: "Prog -1",
//     reviewType: "Review-1",
//     createdOn: "suresh.p@gmail.com",
//     assignedUsers: "Karthik GB",
//   },
//   {
//     name: "Suresh P",
//     program: "Prog -1",
//     reviewType: "Review-1",
//     createdOn: "suresh.p@gmail.com",
//     assignedUsers: "Karthik GB",
//   },
//   {
//     name: "Suresh P",
//     program: "Prog -1",
//     reviewType: "Review-1",
//     createdOn: "suresh.p@gmail.com",
//     assignedUsers: "Karthik GB",
//   },
// ];

// @Component({
//   selector: "app-consolidatedceview-container",
//   templateUrl: "./ConsolidatedReviewContainer.component.html",
//   styleUrls: ["./ConsolidatedReviewContainer.component.scss"],
// })
// export class ConsolidatedReviewContainerComponent implements OnInit {
//   constructor(public dialog: MatDialog) {}

//   @ViewChild(MatPaginator) paginator: MatPaginator;

//   myLabelPosition: labelPosition = "before";
//   myLabelPosition1: labelPosition = "after";

//   public headerMenu: any = [];
//   public selectedPage: any;
//   public selectedIndex: number;
//   //public directorVisitSelectedID: number;
//   public visitSelectedData: any = [];

//   public mode: any;

//   ngOnInit() {
//     this.headerMenu = [
//       {
//         tabHeaderName: "Select Plans",
//         visible: true,
//         selectedPage: "selectVisit",
//       },
//       {
//         tabHeaderName: "Plan Details",
//         visible: false,
//         selectedPage: "visitDetails",
//       },
//     ];
//     this.selectedIndex = 0;
//     this.selectedPage = "selectVisit";
//   }

//   getHeaderTabSelection(event) {
//     this.selectedPage = event;
//   }

//   emitTabData(event) {
//     this.selectedPage = event.selectedPage;
//     this.visitSelectedData = event?.visitSelectedData;
//     this.headerMenu.forEach((x, i) => {
//       x.visible = event?.showDetails == false && i != 0 ? false : true;
//     });

//     this.selectedIndex = this.headerMenu.findIndex((object) => {
//       return object.selectedPage === event.selectedPage;
//     });
//   }

//   emitEnhancedData(event) {
//     this.visitSelectedData = event;
//     console.log(this.visitSelectedData);
//   }
// }
