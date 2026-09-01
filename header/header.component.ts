import { SharedService } from "src/app/shared/services/shared.service";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { SessionTimeoutService } from "src/app/shared/services/session-timeout.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { NavigationEnd, Router } from "@angular/router";
import { AdminUserLog } from "src/app/pages/program-administration/models/admin-user-log.model";
import { HttpClient } from "@angular/common/http";
import { Guid } from "guid-typescript";
import { environment } from "src/environments/environment";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  userAuthData: AdminUserLog;

  constructor(
    private http: HttpClient,
    private programAdministrationService: ProgramAdministrationService,
    private sharedService: SharedService,
    private sessionTimeout: SessionTimeoutService,
    private toastrService: ToastrService,
    private router: Router,
  ) {}

  public menuList = [];

  isShowHeader: boolean = false;
  timerVal: string | null = null;
  display: any;
  authGUID: Guid;
  userName: string;
  fullName: string;
  selectedMenu: any;
  public MenuListJSONData: any = [];
  private sessionTimerId: ReturnType<typeof setInterval> | null = null;
  private expireTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private sessionExpired = false;

  ngOnInit(): void {
    this.setActiveMenu();
    this.userAuthData = this.programAdministrationService.getUserDetails();
    this.getMenuList();
    this.sessionTimeout.startWatching();
    this.startSessionTimer();
  }

  ngOnDestroy(): void {
    this.stopSessionTimer();
    this.sessionTimeout.stopWatching();
  }

  getMenuList() {
    this.programAdministrationService;
    //.getUserMenuDetails(this.userAuthData?.userRole)
    this.http
      .get("assets/api-data/GetUserMenuDetails.json")
      .subscribe((res: any) => {
        if (res != null) {
          if (res.length > 0) {
            let menu = JSON.parse(JSON.stringify(res));

            if (this.selectedMenu == undefined) {
              this.selectedMenu = "dashboard";
            }

            let menuObj = [];
            const navMenus = (res || []).filter(
              (item) => !this.sharedService.isNavHiddenMenu(item),
            );
            navMenus.forEach((element) => {
              let isParentActive = false;
              let subMenuList = [];
              subMenuList = menu.filter(
                (x) =>
                  x.subMenu &&
                  x.parentMenuId == element.menuId &&
                  !this.sharedService.isNavHiddenMenu(x),
              );
              if (subMenuList.length > 0) {
                subMenuList.forEach((x) => {
                  x.subMenuActive = this.selectedMenu == x.redirectURL;
                  if (x.subMenuActive) {
                    isParentActive = true;
                  }
                });
              }
              if (!element.subMenu) {
                menuObj.push({
                  menuName: element.menuName,
                  visible: element.active,
                  redirectURL: element.redirectUrl,
                  activeMenu:
                    isParentActive || this.selectedMenu == element.redirectUrl,
                  subMenu: subMenuList,
                  order: element.order,
                });
              }
            });
            this.sharedService.sorting(menuObj, "order");
            this.menuList = menuObj;
          } else {
            this.router.navigate(["/dashboard"]);
          }
        }
      });
  }

  setDefaultUser() {
    this.http
      .get("assets/user-claims.json")
      .toPromise()
      .then((res: any) => {
        this.userAuthData = res;
        this.userName = this.userAuthData.userName;
        this.fullName = this.userAuthData.fullName;
        this.programAdministrationService.setUserDetails(this.userAuthData);
        sessionStorage.setItem("isRegisteredUser", "true");
        localStorage.setItem("isRegisteredUser", "true");
        sessionStorage.setItem("authUserName", this.userAuthData.userName);
        localStorage.setItem("authUserName", this.userAuthData.userName);
        sessionStorage.setItem("authUserFullName", this.userAuthData.fullName);
        localStorage.setItem("authUserFullName", this.userAuthData.fullName);
        localStorage.setItem("userData", JSON.stringify(this.userAuthData));
        localStorage.setItem("userData", JSON.stringify(this.userAuthData));
      });
  }

  extendSession(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.sessionExpired) {
      return;
    }

    this.sessionTimeout.extendSession();
    this.updateTimerDisplay();
    this.toastrService.success(
      "Your session has been extended.",
      "Session",
    );
  }

  private startSessionTimer(): void {
    this.stopSessionTimer();
    this.updateTimerDisplay();
    this.sessionTimerId = setInterval(() => this.updateTimerDisplay(), 1000);
  }

  private stopSessionTimer(): void {
    if (this.sessionTimerId !== null) {
      clearInterval(this.sessionTimerId);
      this.sessionTimerId = null;
    }

    if (this.expireTimeoutId !== null) {
      clearTimeout(this.expireTimeoutId);
      this.expireTimeoutId = null;
    }
  }

  private updateTimerDisplay(): void {
    if (this.sessionExpired) {
      return;
    }

    const remainingMs = this.sessionTimeout.getRemainingMs();
    if (remainingMs <= 0) {
      this.handleSessionExpired();
      return;
    }

    this.timerVal = this.sessionTimeout.shouldDisplayTimer(remainingMs)
      ? this.sessionTimeout.formatRemaining(remainingMs)
      : null;
  }

  private handleSessionExpired(): void {
    this.sessionExpired = true;
    this.timerVal = "00:00";
    this.sessionTimeout.stopWatching();
    if (this.sessionTimerId !== null) {
      clearInterval(this.sessionTimerId);
      this.sessionTimerId = null;
    }

    this.toastrService.error(
      "Your session is expired, Please login again!",
      "Session Expired",
    );
    this.expireTimeoutId = setTimeout(() => {
      this.logout();
    }, 3000);
  }

  setActiveMenu() {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.selectedMenu = val.url.slice(1);
        if (this.selectedMenu?.indexOf("program") != -1) {
          this.selectedMenu = "program";
        }
      }
    });
  }

  toAbsUrl(url: string | null | undefined): string[] {
    if (!url) {
      return [];
    }

    return ["/", ...String(url).replace(/^\//, "").split("/").filter(Boolean)];
  }

  isMenuActive(menu: any): boolean {
    if (this.isPathActive(menu?.redirectURL)) {
      return true;
    }

    return (menu?.subMenu || []).some((subMenu) => this.isSubMenuActive(subMenu));
  }

  isSubMenuActive(subMenu: any): boolean {
    return this.isPathActive(subMenu?.redirectUrl);
  }

  private isPathActive(redirect: string | null | undefined): boolean {
    if (!redirect) {
      return false;
    }

    const path = (this.router.url || "").replace(/^\//, "").split("?")[0];
    const target = String(redirect).replace(/^\//, "");

    if (target === "dashboard") {
      return path === "dashboard";
    }

    return path === target || path.startsWith(target + "/");
  }

  logout() {
    this.sessionExpired = true;
    this.stopSessionTimer();
    this.sessionTimeout.stopWatching();
    this.userAuthData = null;
    this.timerVal = null;
    localStorage.clear();
    sessionStorage.clear();
    document.location.href = environment.gems_url + "/user/login.aspx";
  }
}
