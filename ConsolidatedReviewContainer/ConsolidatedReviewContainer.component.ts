import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { Subscription } from "rxjs";
import {
  TAB_CONFIGURATIONS,
  TabId,
  getTabConfig,
  TabConfiguration,
} from "../consolidated-review-tab-config";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

export interface TabMenuItem {
  id: string;
  title: string;
  parentName?: string;
}

@Component({
  selector: "app-consolidatedreview-container",
  templateUrl: "./ConsolidatedReviewContainer.component.html",
  styleUrls: ["./ConsolidatedReviewContainer.component.scss"],
})
export class ConsolidatedReviewContainerComponent implements OnInit, OnDestroy {
  public headerMenu: any[] = [
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
  public selectedPage: string = "";
  public selectedIndex: number = 0;
  public visitSelectedData: any = null;
  public currentTabId: TabId = "" as TabId;
  public currentTabConfig: TabConfiguration | null = null;

  private routerSubscription: Subscription;

  public fiscalMenuItems: TabMenuItem[] = [];
  public cteMenuItems: TabMenuItem[] = [];
  public directMenuItems: TabMenuItem[] = [];

  private readonly FISCAL_PARENT = "Fiscal and Admin Services Cust";
  private readonly CTE_PARENT = "CTE Programs";

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private programAdminService: ProgramAdministrationService,
  ) {}

  ngOnInit(): void {
    this.loadTabMenus();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.handleRouteChange());

    this.handleRouteChange();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  loadTabMenus(): void {
    this.programAdminService.getConsUserTabMenus(16, "ADM").subscribe({
      next: (items: TabMenuItem[]) => {
        const uniqueMap = new Map<string, TabMenuItem>();
        items.forEach((item) => {
          if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        });
        const uniqueItems = Array.from(uniqueMap.values());
        this.fiscalMenuItems = uniqueItems.filter(
          (i) => i.parentName === this.FISCAL_PARENT,
        );
        this.cteMenuItems = uniqueItems.filter(
          (i) => i.parentName === this.CTE_PARENT,
        );
        this.directMenuItems = uniqueItems.filter(
          (i) =>
            i.parentName !== this.FISCAL_PARENT &&
            i.title !== this.FISCAL_PARENT &&
            i.parentName !== this.CTE_PARENT &&
            i.title !== this.CTE_PARENT,
        );

        this.handleRouteChange();
      },
      error: (err) => {
        this.fiscalMenuItems = [];
        this.cteMenuItems = [];
        this.directMenuItems = [];
      },
    });
  }

  navigateToMenuItem(tabId: string): void {
    this.selectedPage = "selectVisit";
    this.currentTabId = tabId as TabId;
    this.currentTabConfig = getTabConfig(this.currentTabId);
    this.updateHeaderMenuTitle();
    this.router.navigate([`/consolidatedreview/${tabId}/selectVisit`]);
  }

  private updateHeaderMenuTitle(): void {
    if (this.currentTabConfig) {
      this.headerMenu[0].tabHeaderName = `Select ${this.currentTabConfig.title} Plans`;
      this.headerMenu[1].tabHeaderName = `${this.currentTabConfig.title} Plan Details`;
    }
  }

  handleRouteChange(): void {
    const urlSegments = this.router.url.split("/");
    const consolidatedIndex = urlSegments.findIndex(
      (seg) => seg === "consolidatedreview",
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

  getFiscalMenuItems(): TabMenuItem[] {
    return this.fiscalMenuItems;
  }

  getCteMenuItems(): TabMenuItem[] {
    return this.cteMenuItems;
  }

  getDirectMenuItems(): TabMenuItem[] {
    return this.directMenuItems;
  }

  getHeaderTabSelection(event: string): void {
    this.selectedPage = event;
    this.selectedIndex = this.headerMenu.findIndex(
      (item) => item.selectedPage === event,
    );
  }

  emitTabData(event: any): void {
    this.selectedPage = event.selectedPage;
    this.visitSelectedData = event?.visitSelectedData || null;

    if (this.visitSelectedData) {
      this.visitSelectedData.currentTabId = this.currentTabId;
    }

    this.headerMenu.forEach((item, index) => {
      item.visible = !(event?.showDetails === false && index !== 0);
    });

    this.selectedIndex = this.headerMenu.findIndex(
      (obj) => obj.selectedPage === event.selectedPage,
    );
  }

  emitEnhancedData(event: any): void {
    this.visitSelectedData = event;
  }
}
