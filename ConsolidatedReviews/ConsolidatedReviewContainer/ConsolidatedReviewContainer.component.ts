import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { Subscription } from "rxjs";
import {
  TAB_CONFIGURATIONS,
  TabId,
  getTabConfig,
  TabConfiguration,
  SIDE_MENU_GROUPS,
} from "../consolidated-review-tab-config";

export type labelPosition = "before" | "after";

@Component({
  selector: "app-consolidatedreview-container",
  templateUrl: "./ConsolidatedReviewContainer.component.html",
  styleUrls: ["./ConsolidatedReviewContainer.component.scss"],
})
export class ConsolidatedReviewContainerComponent implements OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";

  public headerMenu: any = [];
  public selectedPage: string = "";
  public selectedIndex: number = 0;
  public visitSelectedData: any = [];
  public currentTabId: TabId = "";
  public currentTabConfig: TabConfiguration;
  private routerSubscription: Subscription;
  public mode: any;

  // Menu properties for navigation
  public directMenuItems: any[] = [];
  public fiscalMenuItems: any[] = [];
  public cteMenuItems: any[] = [];

  ngOnInit() {
    this.initializeHeaderMenu();
    this.loadMenuItems();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleRouteChange();
      });
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

  loadMenuItems(): void {
    const menuItems = SIDE_MENU_GROUPS.map((group, groupIndex) => {
      const items = group.items.map((tabId) => {
        const config = getTabConfig(tabId);
        return {
          id: tabId,
          title: config.title,
          //shortTitle: this.getShortTitle(config.title, tabId),
          redirectUrl: `consolidatedreview/${tabId}/selectVisit`,
          config: config,
        };
      });

      return {
        isGroup: !!group.groupLabel,
        groupLabel: group.groupLabel,
        items: items,
      };
    });

    // Get Direct menu items (ungrouped items)
    const directGroup = menuItems.find((group) => !group.isGroup);
    this.directMenuItems = directGroup ? directGroup.items : [];

    // Get Fiscal and Admin Services Cust items
    const fiscalGroup = menuItems.find(
      (group) =>
        group.groupLabel &&
        group.groupLabel.includes("Fiscal and Admin Services"),
    );
    this.fiscalMenuItems = fiscalGroup ? fiscalGroup.items : [];

    // Get CTE Programs items
    const cteGroup = menuItems.find(
      (group) => group.groupLabel && group.groupLabel.includes("CTE Programs"),
    );
    this.cteMenuItems = cteGroup ? cteGroup.items : [];
  }

  // Helper to get short title for buttons
  private getShortTitle(fullTitle: string, tabId: string): string {
    // Create shorter versions for button display
    const shortTitles: { [key: string]: string } = {
      cnpcontr: "CNP Contracts",
      clswallinv: "Class Wallet Invoicing",
      psacontrrvw: "PSA Contract Review",
      "31n6beyondhir": "31n(6) Beyond Hiring",
      privschconsult: "Private Sch Consult",
      falseel: "False EL",
      usdadodcompliant: "USDADOD Compliant",
      excessfundbal: "Excess Fund",
      ltclaimexec: "Late Claim Exception",
      contrpage: "Contracts Page (Rebid)",
      "10cent": "10 Cent Program GANS",
      sec61a2: "Section 61a(2) Application",
      ctenewpgm: "CTE New Program",
      emcamp: "EMC Application Scoring",
      cteexcel: "CTE Excellence Award Scoring",
      psalegacy: "PSA (Legacy)",
      emcplan: "EMC Planning Grant Scoring",
    };

    return (
      shortTitles[tabId] ||
      fullTitle.split(" ").slice(0, 2).join(" ") ||
      fullTitle
    );
  }

  // Get Direct menu items
  getDirectMenuItems(): any[] {
    return this.directMenuItems;
  }

  // Get Fiscal and Admin Services Cust items
  getFiscalMenuItems(): any[] {
    return this.fiscalMenuItems;
  }

  // Get CTE Programs items
  getCteMenuItems(): any[] {
    return this.cteMenuItems;
  }

  // Navigation method
  navigateToMenuItem(tabId: TabId): void {
    this.selectedPage = "selectVisit";
    this.currentTabId = tabId;
    this.currentTabConfig = getTabConfig(tabId);
    this.updateHeaderMenuTitle();
    this.router.navigate([`consolidatedreview/${tabId}/selectVisit`]);
  }

  handleRouteChange(): void {
    const urlSegments = this.router.url.split("/");
    const consolidatedIndex = urlSegments.findIndex(
      (segment) => segment === "consolidatedreview",
    );

    if (
      consolidatedIndex !== -1 &&
      urlSegments.length > consolidatedIndex + 1
    ) {
      const tabId = urlSegments[consolidatedIndex + 1];
      if (tabId && TAB_CONFIGURATIONS[tabId as TabId]) {
        this.currentTabId = tabId as TabId;
        this.currentTabConfig = getTabConfig(this.currentTabId);
        this.selectedPage = "selectVisit";
        this.updateHeaderMenuTitle();
      }
    }
  }

  updateHeaderMenuTitle(): void {
    if (this.currentTabConfig) {
      this.headerMenu[0].tabHeaderName = `Select ${this.currentTabConfig.title} Plans`;
      this.headerMenu[1].tabHeaderName = `${this.currentTabConfig.title} Plan Details`;
    }
  }

  // NEW METHODS FOR BREADCRUMB
  showBreadcrumb(): boolean {
    // Show breadcrumb only if current tab is in Fiscal Services or CTE Programs
    return this.isInFiscalMenu() || this.isInCteMenu();
  }

  isInFiscalMenu(): boolean {
    return this.fiscalMenuItems.some((item) => item.id === this.currentTabId);
  }

  isInCteMenu(): boolean {
    return this.cteMenuItems.some((item) => item.id === this.currentTabId);
  }

  getParentMenuLabel(tabId: string): string {
    if (this.isInFiscalMenu()) {
      return "Fiscal Services";
    } else if (this.isInCteMenu()) {
      return "CTE Programs";
    }
    return "";
  }

  // Existing methods
  getHeaderTabSelection(event: any) {
    this.selectedPage = event;
    this.selectedIndex = this.headerMenu.findIndex(
      (item) => item.selectedPage === event,
    );
  }

  emitTabData(event: any) {
    this.selectedPage = event.selectedPage;
    this.visitSelectedData = event?.visitSelectedData;

    if (this.visitSelectedData) {
      this.visitSelectedData.currentTabId = this.currentTabId;
    }

    this.headerMenu.forEach((x, i) => {
      x.visible = event?.showDetails == false && i != 0 ? false : true;
    });

    this.selectedIndex = this.headerMenu.findIndex((object) => {
      return object.selectedPage === event.selectedPage;
    });
  }

  emitEnhancedData(event: any) {
    this.visitSelectedData = event;
    console.log(this.visitSelectedData);
  }
}
