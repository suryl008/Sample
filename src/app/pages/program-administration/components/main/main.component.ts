import { RvwType } from "src/app/pages/program-administration/models/rvw-type.model";
import { PgmRvwInfo } from "./../../models/pgm-rvw-info.model";
import { AppSettings } from "./../../../../app-settings";
import { ProgramAdministrationService } from "./../../../../shared/services/program-administration.service";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

export type position = "left" | "right" | "above" | "below";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"],
})
export class MainComponent implements OnInit {
  isProgramView: boolean = false;
  programId: any = null;
  selectedProgram: any = {};
  public program: any = null;
  public reviewType: any;
  revTypeList: any = [];
  result: any = [];
  tooltipPosition: position = "above";

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.reviewType =
      this.route.snapshot.queryParamMap.get("review") ||
      sessionStorage.getItem("reviewType") ||
      AppSettings.DEFAULT_REVIEW_TYPE;
    this.programAdministrationService.reviewType = this.reviewType;

    this.programId = sessionStorage.getItem("selectedProgramId");
    const bodyElement = document.body;
    bodyElement.classList.add("program-board");
    this.programAdministrationService.selectedProgram$.subscribe(
      (value: any) => {
        if (value) {
          this.program = value;
          this.programId = this.program?.grantPgmId;
          this.getRevTypeByPgmId();
        }
      }
    );
  }
  getRevTypeByPgmId() {
    this.programAdministrationService
      .getReviewType(this.programId)
      .subscribe((res: any) => {
        if (res != null) {
          this.revTypeList = res;
          this.result = this.revTypeList.filter((o1: { rvwType1: any }) =>
            this.program.pgmRvwInfos.some(
              (o2: { rvwType: any }) => o1.rvwType1 === o2.rvwType
            )
          );
        }
        console.log({ selectedProgram: this.result });
      });
    console.log({ reviewType: this.reviewType });
  }

  ngDoCheck(): void {
    if (!this.router.url.includes("dashboard")) {
      this.isProgramView = true;
    } else {
      this.isProgramView = false;
    }
    if (this.reviewType) {
      sessionStorage.setItem("reviewType", this.reviewType);
    }
  }

  changeReviewType(e: any) {
    const params = new URLSearchParams({
      id: this.programId,
      review: e.value,
    });
    // this.programAdministrationService.reviewType = e.value;
    // sessionStorage.setItem("reviewType", e.value);
    window.location.href = window.location.pathname + "?" + params.toString();
  }

  navigateToAddNewReview() {
    sessionStorage.setItem("selectedReviewTypeId", "new");
    // this.router.navigate(
    //   ["/program/review/", sessionStorage.getItem("selectedProgramId")],
    //   { queryParams: { action: "new" } }
    // );
    window.location.href =
      "/program/review/" +
      sessionStorage.getItem("selectedProgramId") +
      "?action=new";
  }
}
