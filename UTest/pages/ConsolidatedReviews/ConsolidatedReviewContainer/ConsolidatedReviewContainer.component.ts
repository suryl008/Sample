import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
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
import { ConsolidatedReviewService } from "src/app/shared/services/consolidated-review.service";
import { ConsolidatedReviewDetailsComponent } from "../ConsolidatedReviewDetails/ConsolidatedReviewDetails.component";

const VISIT_STORAGE_KEY = "consolidatedReview.selectedVisit";

export interface TabMenuItem {
  id: string;
  title: string;
  parentName?: string;
}

@Component({
    selector: "app-consolidatedreview-container",
    templateUrl: "./ConsolidatedReviewContainer.component.html",
    styleUrls: ["./ConsolidatedReviewContainer.component.scss"],
    standalone: false
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
  public tabsLoaded = false;
  private allowedTabCodes = new Set<string>();

  private readonly FISCAL_PARENT = "Fiscal and Admin Services Cust";
  private readonly CTE_PARENT = "CTE Programs";
  private syncingTabs = false;
  private ignoreNextRouteSync = false;

  @ViewChild(ConsolidatedReviewDetailsComponent)
  detailsCmp?: ConsolidatedReviewDetailsComponent;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private programAdminService: ProgramAdministrationService,
    private consolidatedReviewService: ConsolidatedReviewService,
  ) {}

  ngOnInit(): void {
    this.loadTabMenus();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.handleRouteChange());
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  loadTabMenus(): void {
    const user = this.programAdminService.getUserDetails();
    const userId = user?.userId;
    const role = user?.userRole;
    if (!userId || !role) {
      this.fiscalMenuItems = [];
      this.cteMenuItems = [];
      this.directMenuItems = [];
      this.allowedTabCodes.clear();
      this.tabsLoaded = true;
      return;
    }

    this.programAdminService.getConsUserTabMenus(userId, role).subscribe({
      next: (items: TabMenuItem[]) => {
        const uniqueMap = new Map<string, TabMenuItem>();
        (items || []).forEach((item: any) => {
          const mapped: TabMenuItem = {
            id: String(item?.id || item?.Id || "").toLowerCase(),
            title: item?.title || item?.Title || "",
            parentName: item?.parentName || item?.ParentName || undefined,
          };
          if (mapped.id && !uniqueMap.has(mapped.id)) {
            uniqueMap.set(mapped.id, mapped);
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
        this.allowedTabCodes = new Set(
          uniqueItems
            .filter(
              (i) => i.title !== this.FISCAL_PARENT && i.title !== this.CTE_PARENT,
            )
            .map((i) => i.id),
        );
        this.tabsLoaded = true;
        this.preloadGrantPgmIds();
        this.handleRouteChange();
      },
      error: (err) => {
        console.error("Unable to load Consolidated Review tab menus.", err);
        this.fiscalMenuItems = [];
        this.cteMenuItems = [];
        this.directMenuItems = [];
        this.allowedTabCodes.clear();
        this.tabsLoaded = true;
        this.preloadGrantPgmIds();
      },
    });
  }

  private preloadGrantPgmIds(): void {
    this.consolidatedReviewService.ensurePgmIdMap().subscribe({
      error: (err) => {
        console.error(
          "Unable to load grant program ids for Consolidated Review.",
          err,
        );
      },
    });
  }

  async navigateToMenuItem(tabId: string): Promise<void> {
    const normalizedTabId = String(tabId || "").toLowerCase();
    if (this.tabsLoaded && !this.allowedTabCodes.has(normalizedTabId)) {
      return;
    }
    if (this.selectedPage === "visitDetails") {
      const canLeave = await this.detailsCmp?.confirmDiscard() ?? true;
      if (!canLeave) {
        return;
      }
    }
    this.applySelectVisit();
    this.currentTabId = normalizedTabId as TabId;
    this.currentTabConfig = getTabConfig(this.currentTabId);
    this.updateHeaderMenuTitle();
    this.router.navigate([`/consolidatedreview/${normalizedTabId}/selectVisit`]);
  }

  private updateHeaderMenuTitle(): void {
    if (this.currentTabConfig) {
      this.headerMenu[0].tabHeaderName = `Select ${this.currentTabConfig.title} Plans`;
      this.headerMenu[1].tabHeaderName = `${this.currentTabConfig.title} Plan Details`;
    }
  }

  handleRouteChange(): void {
    if (!this.tabsLoaded) {
      return;
    }
    if (this.ignoreNextRouteSync) {
      this.ignoreNextRouteSync = false;
      return;
    }

    const { tabId, page, subRvwId } = this.parseRoute();
    const isKnownTab = !!tabId && !!TAB_CONFIGURATIONS[tabId as TabId];

    if (!isKnownTab || !this.allowedTabCodes.has(tabId)) {
      this.redirectToFirstAllowedTab(tabId);
      return;
    }

    this.currentTabId = tabId as TabId;
    this.currentTabConfig = getTabConfig(this.currentTabId);
    this.updateHeaderMenuTitle();

    if (page === "visitDetails") {
      if (!this.restoreVisit(tabId, subRvwId)) {
        this.ignoreNextRouteSync = true;
        this.applySelectVisit();
        this.router.navigate([`/consolidatedreview/${tabId}/selectVisit`], {
          replaceUrl: true,
        });
        return;
      }
      this.applyVisitDetails();
      return;
    }

    if (this.selectedPage === "visitDetails" && this.detailsCmp?.hasUnsavedChanges()) {
      void this.revertOrLeaveDetails(tabId);
      return;
    }

    this.applySelectVisit();
  }

  private redirectToFirstAllowedTab(currentTabId: string): void {
    const firstTabId =
      this.directMenuItems[0]?.id ||
      this.fiscalMenuItems[0]?.id ||
      this.cteMenuItems[0]?.id;

    if (firstTabId && firstTabId !== currentTabId) {
      this.router.navigate([`/consolidatedreview/${firstTabId}/selectVisit`]);
      return;
    }

    this.selectedPage = "";
    this.currentTabId = "" as TabId;
    this.currentTabConfig = null;
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

  async getHeaderTabSelection(event: string): Promise<void> {
    if (this.syncingTabs) {
      return;
    }
    if (event === "visitDetails" && !this.visitSelectedData) {
      this.selectedPage = "selectVisit";
      this.selectedIndex = 0;
      return;
    }
    if (event === "selectVisit" && this.selectedPage === "visitDetails") {
      const canLeave = await this.detailsCmp?.confirmDiscard() ?? true;
      if (!canLeave) {
        this.selectedIndex = 0;
        setTimeout(() => {
          this.selectedIndex = 1;
        });
        return;
      }
      this.applySelectVisit();
      this.router.navigate([
        `/consolidatedreview/${this.currentTabId}/selectVisit`,
      ]);
      return;
    }
    this.selectedPage = event;
    this.selectedIndex = this.headerMenu.findIndex(
      (item) => item.selectedPage === event,
    );
    if (event === "visitDetails" && this.visitSelectedData) {
      this.navigateToDetails();
    }
  }

  emitTabData(event: any): void {
    this.syncingTabs = true;
    try {
      if (event?.showDetails === false || event?.selectedPage === "selectVisit") {
        if (event?.visitSelectedData === null) {
          this.visitSelectedData = null;
        }
        this.applySelectVisit();
        this.router.navigate([
          `/consolidatedreview/${this.currentTabId}/selectVisit`,
        ]);
        return;
      }

      if (event?.selectedPage === "visitDetails") {
        this.visitSelectedData =
          event?.visitSelectedData !== undefined
            ? event.visitSelectedData
            : this.visitSelectedData;
        if (this.visitSelectedData) {
          this.visitSelectedData.currentTabId = this.currentTabId;
        }
        this.persistVisit();
        this.applyVisitDetails();
        this.navigateToDetails();
        return;
      }
    } finally {
      setTimeout(() => {
        this.syncingTabs = false;
      });
    }
  }

  emitEnhancedData(event: any): void {
    this.visitSelectedData = event;
    this.persistVisit();
  }

  private parseRoute(): { tabId: string; page: string; subRvwId: string | null } {
    const urlTree = this.router.parseUrl(this.router.url);
    const subRvwId = urlTree.queryParams?.["subRvwId"]
      ? String(urlTree.queryParams["subRvwId"])
      : null;
    const path = this.router.url.split("?")[0];
    const parts = path.split("/").filter(Boolean);
    const idx = parts.indexOf("consolidatedreview");
    const tabId = (parts[idx + 1] || "").toLowerCase();
    const pageSegment = parts[idx + 2] || "selectVisit";
    const page = pageSegment === "visitDetails" ? "visitDetails" : "selectVisit";
    return { tabId, page, subRvwId };
  }

  private persistVisit(): void {
    if (!this.visitSelectedData) {
      sessionStorage.removeItem(VISIT_STORAGE_KEY);
      return;
    }
    try {
      sessionStorage.setItem(
        VISIT_STORAGE_KEY,
        JSON.stringify({
          tabId: this.currentTabId,
          visitSelectedData: this.visitSelectedData,
        }),
      );
    } catch (error) {
      console.error("Unable to persist consolidated review selection.", error);
    }
  }

  private restoreVisit(tabId: string, subRvwId: string | null): boolean {
    if (
      this.visitSelectedData &&
      (!subRvwId ||
        String(this.visitSelectedData.sub_rvw_id ?? this.visitSelectedData.id) ===
          String(subRvwId))
    ) {
      return true;
    }

    try {
      const raw = sessionStorage.getItem(VISIT_STORAGE_KEY);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.tabId && String(parsed.tabId) !== String(tabId)) {
        return false;
      }
      const storedId =
        parsed?.visitSelectedData?.sub_rvw_id ?? parsed?.visitSelectedData?.id;
      if (subRvwId && storedId != null && String(storedId) !== String(subRvwId)) {
        return false;
      }
      this.visitSelectedData = parsed?.visitSelectedData || null;
      return !!this.visitSelectedData;
    } catch (error) {
      console.error("Unable to restore consolidated review selection.", error);
      return false;
    }
  }

  private applySelectVisit(): void {
    this.selectedPage = "selectVisit";
    this.visitSelectedData = null;
    this.selectedIndex = 0;
    this.headerMenu[1].visible = false;
    sessionStorage.removeItem(VISIT_STORAGE_KEY);
    this.updateHeaderMenuTitle();
  }

  private applyVisitDetails(): void {
    this.selectedPage = "visitDetails";
    this.headerMenu[1].visible = true;
    this.selectedIndex = 1;
    this.updateHeaderMenuTitle();
  }

  private navigateToDetails(): void {
    const queryParams = this.visitSelectedData?.sub_rvw_id
      ? { subRvwId: this.visitSelectedData.sub_rvw_id }
      : this.visitSelectedData?.id
        ? { subRvwId: this.visitSelectedData.id }
        : {};
    this.router.navigate(
      [`/consolidatedreview/${this.currentTabId}/visitDetails`],
      { queryParams },
    );
  }

  private async revertOrLeaveDetails(tabId: string): Promise<void> {
    const canLeave = await this.detailsCmp?.confirmDiscard() ?? true;
    if (canLeave) {
      this.applySelectVisit();
      return;
    }
    this.ignoreNextRouteSync = true;
    this.router.navigate(
      [`/consolidatedreview/${tabId}/visitDetails`],
      {
        queryParams: this.visitSelectedData?.sub_rvw_id
          ? { subRvwId: this.visitSelectedData.sub_rvw_id }
          : {},
        replaceUrl: true,
      },
    );
  }
}
