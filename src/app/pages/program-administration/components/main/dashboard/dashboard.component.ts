import { PgmRvwInfo } from "./../../../models/pgm-rvw-info.model";
import { PgmInfo } from "src/app/pages/program-administration/models/pgm-info.model";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";

import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { AppSettings } from "src/app/app-settings";
import { Subscription } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  searchProgramsCtrl = new FormControl();
  filteredPrograms: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedSearchProgram: any = "";
  public selectedProgram: any = [];
  public selectedProgramRvwTypes: any = [];
  public testResult: PgmInfo;
  public testResultRvwTypes: PgmRvwInfo[];
  public program: any;
  getCustomReviewTypeSubscription: Subscription;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  onSelected() {
    console.log({ selectedSearchProgram: this.selectedSearchProgram });
    this.getProgramInfoById(this.selectedSearchProgram.grantPgmId);
    this.programAdministrationService.selectedPgmId =
      this.selectedSearchProgram.grantPgmId;
    this.toastrService.success(
      this.selectedSearchProgram.grantPgmDesc,
      "Selected Program"
    );
  }

  displayWith(value: any) {
    return value?.grantPgmDesc;
  }

  clearSelection() {
    this.selectedSearchProgram = "";
    this.filteredPrograms = [];
  }

  ngOnInit(): void {
    this.searchProgramsCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredPrograms = [];
          this.isLoading = true;
        }),
        switchMap((value) =>
          this.programAdministrationService.getAllPgmSearchLookup(value).pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined) {
          this.errorMsg = data["Error"];
          this.filteredPrograms = [];
        } else {
          this.errorMsg = "";
          this.filteredPrograms = data;
        }
        console.log({ filteredPrograms: this.filteredPrograms });
      });
  }

  getProgramInfo(item: any) {
    this.selectedProgram = item;
    this.selectedProgramRvwTypes = item.pgmRvwInfos;
    console.log({ selectedProgramRvwTypes: this.selectedProgramRvwTypes });
  }

  getProgramInfoById(pgId: any) {
    this.programAdministrationService
      .getProgramInfoById(pgId)
      .subscribe((program: any) => {
        if (program != null) {
          this.selectedProgram = program;
          this.selectedProgramRvwTypes = program[0].pgmRvwInfos;
          var nonDefaultReviewTypes = this.selectedProgramRvwTypes.filter(
            function (row: any) {
              return row.rvwType !== AppSettings.DEFAULT_REVIEW_TYPE;
            }
          );
          console.log({ nonDefaultReviewTypes });
          /**
           * @SETUP - Setting up global custom review type data
           */
          if (nonDefaultReviewTypes.length >= 1) {
            this.programAdministrationService.setCustomReviewType(true);
          } else {
            this.programAdministrationService.setCustomReviewType(false);
          }

          this.selectedReviewInfo(nonDefaultReviewTypes);
        }
      });
  }

  newProgramInfo() {
    sessionStorage.setItem("selectedProgramId", "new");
    this.router.navigate(["/program/info/new"]);
  }

  selectedProgramInfo() {
    console.log({ selectedProgram: this.selectedSearchProgram });
    sessionStorage.setItem(
      "selectedProgramId",
      this.selectedSearchProgram.grantPgmId
    );
    // sessionStorage.setItem("reviewType", this.selectedSearchProgram.pgmRvwInfos[0].rvwTypeId);
    sessionStorage.setItem("editMode", "false");
    this.router.navigate([
      "/program/info/",
      this.selectedSearchProgram.grantPgmId,
    ]);
  }

  newReviewInfo() {
    sessionStorage.setItem("selectedReviewTypeId", "new");
    this.router.navigate(["/program/review/new"]);
  }

  selectedReviewInfo(programData: any = null, redirect = false) {
    let programReview: any,
      programReviews: any =
        programData ?? this.selectedSearchProgram.pgmRvwInfos;
    if (programReviews && programReviews.length >= 1) {
      programReview = programReviews[0];
      sessionStorage.setItem("selectedReviewTypeId", programReview.rvwType);
      sessionStorage.setItem("reviewType", programReview.rvwType);
      console.log({ programReview });

      if (redirect) {
        this.router.navigate(["/program/review/", programReview.rvwType]);
      }
    }
  }
}
