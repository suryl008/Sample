import { AppSettings } from "./../../../../../app-settings";
import { ProgramAdministrationService } from "./../../../../../shared/services/program-administration.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "program-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  public reviewType: any;
  public programId: any;
  public program: any;
  public currentModule: string = "ProgramInfo";

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
    // this.programId = this.activatedRoute.snapshot.queryParamMap.get('id');
    this.programId = sessionStorage.getItem("selectedProgramId");
    this.isNew =
      sessionStorage.getItem("selectedProgramId") == "new" ? true : false;
    this.reviewType =
      this.activatedRoute.snapshot.queryParamMap.get("review") ||
      AppSettings.DEFAULT_REVIEW_TYPE;
    this.getProgramInfoById(this.programId);
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
        console.log({ programResponse: this.program });
      });
  }

  scroll(ele: any) {
    let el: any = document.getElementById(ele);
    // el.scrollIntoView({ behavior: 'smooth' });
  }

  navigateToProgramInfo() {
    // if (this.currentModule === "ProgramInfo") return false;
    this.currentModule = "ProgramInfo";
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
    if (this.currentModule === "ReviewType") return false;
    this.currentModule = "ReviewType";
    this.programAdministrationService.setCustomDocumentList(false);
    if (this.isNew) {
      this.router.navigate(["/program/review/new"]);
    } else {
      this.router.navigate([
        "/program/review/",
        sessionStorage.getItem("selectedProgramId"),
      ]);
    }
  }

  navigateToDocumentList() {
    if (this.currentModule === "DocumentList") return false;
    this.currentModule = "DocumentList";
    if (this.isNew) {
      this.router.navigate(["/program/document/new"]);
    } else {
      this.router.navigate([
        "/program/document/",
        sessionStorage.getItem("selectedProgramId"),
      ]);
    }
  }
  navigateToFindings() {
    if (this.currentModule === "Findings") return false;
    this.currentModule = "Findings";
    if (this.isNew) {
      this.router.navigate(["/program/findings/new"]);
    } else {
      this.router.navigate([
        "/program/findings/",
        sessionStorage.getItem("selectedProgramId"),
      ]);
    }
  }
  navigateToFindingsRules() {
    if (this.currentModule === "FindingsRules") return false;
    this.currentModule = "FindingsRules";
    if (this.isNew) {
      this.router.navigate(["/program/finding-rules/new"]);
    } else {
      this.router.navigate([
        "/program/finding-rules/",
        sessionStorage.getItem("selectedProgramId"),
      ]);
    }
  }
  navigateToStageRoles() {
    if (this.currentModule === "StageRoles") return false;
    this.currentModule = "StageRoles";
    if (this.isNew) {
      this.router.navigate(["/program/stage-roles/new"]);
    } else {
      this.router.navigate([
        "/program/stage-roles/",
        sessionStorage.getItem("selectedProgramId"),
      ]);
    }
  }
  navigateToSubRecipient() {
    if (this.currentModule === "SubRecipient") return false;
    this.currentModule = "SubRecipient";
    this.router.navigate([
      "/program/sub-recipient/",
      sessionStorage.getItem("selectedProgramId"),
    ]);
  }
  navigateToReleaseProgram() {
    if (this.currentModule === "ReleaseProgram") return false;
    this.currentModule = "ReleaseProgram";
    this.router.navigate([
      "/program/release/",
      sessionStorage.getItem("selectedProgramId"),
    ]);
  }
}
