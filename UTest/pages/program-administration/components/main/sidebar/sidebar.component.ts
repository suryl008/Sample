import { AppSettings } from "./../../../../../app-settings";
import { ProgramAdministrationService } from "./../../../../../shared/services/program-administration.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
    selector: "program-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"],
    standalone: false
})
export class SidebarComponent implements OnInit {
  public reviewType: any;
  public programId: any;
  public program: any;
  public currentModule;

  getCustomReviewTypeSubscription: Subscription;
  getCustomDocumentListSubscription: Subscription;
  getCustomFindingsSubscription: Subscription;
  getCustomFindingsRulesSubscription: Subscription;
  getCustomStageRoleSubscription: Subscription;

  public reviewTypeToBeVisible: boolean = true;
  public isCustomDocumentList: boolean = false;
  public isCustomFindings: boolean = false;
  public isCustomFindingsRule: boolean = false;
  public isCustomStageRole: boolean = false;
  isNew: boolean;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.getCustomReviewTypeSubscription =
      this.programAdministrationService.customReviewType$.subscribe(
        (success) => {
          this.reviewTypeToBeVisible = success;
        },
        (error) => {
          console.log(error);
        }
      );
    this.getCustomDocumentListSubscription =
      this.programAdministrationService.customDocumentList$.subscribe(
        (success) => {
          this.isCustomDocumentList = success;
          console.log(this.isCustomDocumentList);
        },
        (error) => {
          console.log(error);
        }
      );
    this.getCustomFindingsSubscription =
      this.programAdministrationService.customFindings$.subscribe(
        (success) => {
          this.isCustomFindings = success;
        },
        (error) => {
          console.log(error);
        }
      );
    this.getCustomFindingsRulesSubscription =
      this.programAdministrationService.customFindingsRules$.subscribe(
        (success) => {
          this.isCustomFindingsRule = success;
        },
        (error) => {
          console.log(error);
        }
      );
    this.getCustomStageRoleSubscription =
      this.programAdministrationService.customStageRoles$.subscribe(
        (success) => {
          this.isCustomStageRole = success;
        },
        (error) => {
          console.log(error);
        }
      );
  }
  ngOnInit(): void {
    this.programId = sessionStorage.getItem("selectedProgramId");
    this.isNew =
      sessionStorage.getItem("selectedProgramId") == "new" ? true : false;
    this.reviewType =
      this.activatedRoute.snapshot.queryParamMap.get("review") ||
      this.programAdministrationService.reviewType ||
      sessionStorage.getItem("reviewType") ||
      this.programAdministrationService.reviewType ||
      AppSettings.DEFAULT_REVIEW_TYPE;
    this.getProgramInfoById(this.programId);
    this.activeSideBar();
  }

  activeSideBar(){
    let currentURL = this.router.url.split('/');
    sessionStorage.setItem('CurrentModule', currentURL[2])
    this.currentModule = sessionStorage.getItem('CurrentModule');
  }

  getProgramInfoById(pgId: any) {
    this.programAdministrationService
      .getProgramInfoById(pgId)
      .subscribe((programResponse: any) => {
        this.program = programResponse[0] ?? programResponse;
        this.programAdministrationService.setProgram(this.program);
        var nonDefaultReviewTypes = this.program.pgmRvwInfos.filter(function (
          row: any
        ) {
          return row.rvwType !== AppSettings.DEFAULT_REVIEW_TYPE;
        });
        if (nonDefaultReviewTypes.length >= 1) {
        }
        this.scroll("#sidebar-wrapper");
      });
  }

  scroll(ele: any) {
    let el: any = document.getElementById(ele);
  }

  navigateToProgramInfo() {
    if (this.isNew) {
      this.router.navigate(["/program/info/new"]);
    } else {
      this.router.navigate([
        "/program/info/",
        sessionStorage.getItem("selectedProgramId"),
      ]);
    }
  }

  navigateToReviewType() {
    this.programAdministrationService.setCustomDocumentList(false);
    this.currentModule = "review";
    if (this.isNew) {
      this.router.navigate(["/program/review/new"], {
        queryParams: { action: "new" },
      });
    } else {
      this.router.navigate([
        "/program/review/",
        sessionStorage.getItem("selectedProgramId"),
      ]);
    }
  }

  navigateToDocumentList() {
    if (this.isNew) {
      this.router.navigate(["/program/document/new"]);
    } else {
      this.router.navigate([
        "/program/document/",
        sessionStorage.getItem("selectedProgramId"),
        // this.programAdministrationService.selectedProgramId,
      ]);
    }
  }
  navigateToFindings() {
    if (this.isNew) {
      this.router.navigate(["/program/findings/new"]);
    } else {
      this.router.navigate([
        "/program/findings/",
        sessionStorage.getItem("selectedProgramId"),
        // this.programAdministrationService.selectedProgramId,
      ]);
    }
  }
  navigateToFindingsRules() {
    if (this.isNew) {
      this.router.navigate(["/program/finding-rules/new"]);
    } else {
      this.router.navigate([
        "/program/finding-rules/",
        sessionStorage.getItem("selectedProgramId"),
        // this.programAdministrationService.selectedProgramId,
      ]);
    }
  }
  navigateToStageRoles() {
    if (this.isNew) {
      this.router.navigate(["/program/stage-roles/new"]);
    } else {
      this.router.navigate([
        "/program/stage-roles/",
        sessionStorage.getItem("selectedProgramId"),
        // this.programAdministrationService.selectedProgramId,
      ]);
    }
  }
  navigateToSubRecipient() {
    this.router.navigate([
      "/program/sub-recipient/",
      this.programAdministrationService.selectedProgramId,
    ]);
  }
  navigateToReleaseProgram() {
    this.router.navigate([
      "/program/release/",
      sessionStorage.getItem("selectedProgramId"),
      // this.programAdministrationService.selectedProgramId,
    ]);
  }

  navigateToPOC(){
    this.router.navigate([
      "/program/poc/"
    ]);
  }
}
