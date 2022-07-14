import { EmailTemplate } from "./../../models/email-template.model";
import { RefDatum } from "./../../models/ref-datum.model";
import { WfConfig } from "./../../models/wf-config";
import { AppSettings } from "./../../../../app-settings";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ProgramAdministrationService } from "./../../../../shared/services/program-administration.service";
import { MatDialog } from "@angular/material/dialog";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { RvwType } from "../../models/rvw-type.model";
import { MetadataDialogComponent } from "./metadata-dialog/metadata-dialog.component";
import { PlanRemaindersDialogComponent } from "./plan-remainders-dialog/plan-remainders-dialog.component";
import { map, Observable, startWith } from "rxjs";
import { MatChipInputEvent, MatChipList } from "@angular/material/chips";
import { COMMA, ENTER, I } from "@angular/cdk/keycodes";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { UserInfo } from "../../models/user-info.model";
import { ActivatedRoute, Router } from "@angular/router";

export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";

const user = {
  allowedUserGroup: [],
};

@Component({
  selector: "app-review-types",
  templateUrl: "./review-types.component.html",
  styleUrls: ["./review-types.component.css"],
})
export class ReviewTypesComponent implements OnInit {
  tooltipPosition: position = "above";
  public selectedReviewType: string;
  public selectedWorkFlow: string;
  public selectedRoles: string;

  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public allowedUsers: UserInfo[] = [];
  public allUsers: UserInfo[] = [];

  isEdit: boolean = false;

  public filteredUsers$: Observable<UserInfo[]>;
  @ViewChild("usersList") usersList: MatChipList;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  planRemainder: any;

  constructor(
    public fb: FormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

  reviewNameList: any = [];
  isRolesSeeReviews: boolean = false;
  isUserViewReviews: boolean = false;
  isEEMSubRecipients: boolean = false;
  isSiteLevelFindings: boolean = false;
  isMetadata: boolean = false;
  isCompliancePlan: boolean = false;

  public reviewTypesList: RvwType[];
  public workFlowList: WfConfig[];
  public emailTemplateList: EmailTemplate[];
  allReviewsRolesList: RefDatum[];
  selectedPgmId: any;
  isNew: boolean;
  isNewRvwType: boolean;
  public reviewType: any;

  myLabelPosition: labelPosition = "before";
  reviewInfoForm: FormGroup;

  public program: any = null;
  public selectrolesplaceholder: string =
    "---Select to allow roles to see all reviews ---";

  ngOnInit(): void {
    this.isNew = sessionStorage.getItem("selectedProgramId") === "new";
    this.reviewType =
      this.activatedRoute.snapshot.queryParamMap.get("review") ||
      sessionStorage.getItem("reviewType") ||
      this.programAdministrationService.reviewType ||
      AppSettings.DEFAULT_REVIEW_TYPE;
    this.isNewRvwType =
      this.activatedRoute.snapshot.queryParamMap.get("action") === "new";
    this.getAllUsers(sessionStorage.getItem("selectedOfficeCd"));
    this.programAdministrationService.setCustomDocumentList(false);
    this.reviewInfoFormInit();
    this.getAllRevTypes();
    this.getWorkFlow();
    this.getAllReviewsRoles();
    if (!this.isNew) {
      this.selectedProgramReviewDetails();
      this.reviewInfoForm.disable();
    }

    this.reviewNameList = this.programAdministrationService.reviewType;
    this.selectedPgmId = this.programAdministrationService.selectedPgmId;
    this.programAdministrationService.selectedProgram$.subscribe(
      (value: any) => {
        if (value) {
          this.program = value;
          this.selectedPgmId = value.grantPgmId;
        }
      }
    );
    this.GetCompliancePlanInfo();

    if (this.isNewRvwType) {
      this.editReviewType();
      this.resetReviewInfoForm();
    }
  }

  editReviewType() {
    this.isEdit = !this.isEdit;
    this.reviewInfoForm.enable();
  }

  cancelReviewType() {
    this.isEdit = !this.isEdit;
    this.reviewInfoForm.disable();
  }

  resetReviewInfoForm() {
    this.reviewInfoForm = this.fb.group({
      reviewTypesCtrl: ["", Validators.required],
      workFlowCtrl: ["", Validators.required],
      reviewCycleYrCtrl: [""],
      reviewRolesCtrl: [0],
      userviewReviewsCtrl: [0],
      rolesCtrl: [""],
      usernamesCtl: [""],
      eemsubrecipientsCtrl: [0],
      siteLevelFindingsCtrl: [""],
      metadataCtrl: [0],
      complianceplanCtrl: [0],
      customedocumentCtrl: [false],
      customfindingsCtrl: [false],
      customfindingsruleCtrl: [false],
      customstageroleCtrl: [false],

      allowedUserInput: [null],
      allowedUserGroup: [this.allowedUsers],
    });
  }

  reviewInfoFormInit() {
    this.resetReviewInfoForm();
    // this.reviewInfoForm.controls["allowedUserGroup"].statusChanges.subscribe(
    //   (status) => (this.usersList.errorState = status === "INVALID")
    // );

    this.filteredUsers$ = this.reviewInfoForm.controls[
      "allowedUserInput"
    ].valueChanges.pipe(
      startWith(""),
      map((value) => this.allowedUserFilter(value))
    );

    this.programAdministrationService.setCustomDocumentList(
      this.reviewInfoForm.controls["customedocumentCtrl"].value
    );
    this.programAdministrationService.setCustomFindings(
      this.reviewInfoForm.controls["customfindingsCtrl"].value
    );
    this.programAdministrationService.setCustomFindingsRule(
      this.reviewInfoForm.controls["customfindingsruleCtrl"].value
    );
    this.programAdministrationService.setCustomStageRole(
      this.reviewInfoForm.controls["customstageroleCtrl"].value
    );
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.reviewInfoForm.controls[controlName].hasError(errorName);
  };

  public getAllUsers(offCd: any) {
    this.programAdministrationService.getAllUsersList(offCd).subscribe(
      (response: any) => {
        this.allUsers = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  public addUserToAllowedReviewUserGroup(
    event: MatAutocompleteSelectedEvent
  ): void {
    if (!event.option) {
      return;
    }

    const value = event.option.value;

    if (
      value &&
      value instanceof Object &&
      !this.allowedUsers.includes(value)
    ) {
      this.allowedUsers.push(value);
      this.reviewInfoForm.controls["allowedUserGroup"].setValue(
        this.allowedUsers
      );
      this.reviewInfoForm.controls["allowedUserInput"].setValue("");
    }
  }

  public addUserToAllowedReviewUsersList(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (value.trim()) {
      const matches = this.allUsers.filter(
        (user) => user.userName.toLowerCase() === value
      );
      const formValue = this.reviewInfoForm.controls["allowedUserGroup"].value;
      const matchesNotYetSelected =
        formValue === null
          ? matches
          : matches.filter(
              (x) => !formValue.find((y: { id: number }) => y.id === x.userId)
            );
      if (matchesNotYetSelected.length === 1) {
        this.allowedUsers.push(matchesNotYetSelected[0]);
        this.reviewInfoForm.controls["allowedUserGroup"].setValue(
          this.allowedUsers
        );
        this.reviewInfoForm.controls["allowedUserInput"].setValue("");
      }
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  public remove(user: UserInfo) {
    const index = this.allowedUsers.indexOf(user);
    if (index >= 0) {
      this.allowedUsers.splice(index, 1);
      this.reviewInfoForm.controls["allowedUserGroup"].setValue(
        this.allowedUsers
      );
      this.reviewInfoForm.controls["allowedUserInput"].setValue("");
    }
  }

  saveReview() {
    console.log(this.reviewInfoForm);
  }

  public submitForm(): void {
    console.log(this.reviewInfoForm.get("allowedUserGroup"));
  }

  private allowedUserFilter(value: any): UserInfo[] {
    const filterValue =
      value === null || value instanceof Object ? "" : value.toLowerCase();
    const matches = this.allUsers.filter((user) =>
      user.userName.toLowerCase().includes(filterValue)
    );
    const formValue = this.reviewInfoForm.controls["allowedUserGroup"].value;
    return formValue === null
      ? matches
      : matches.filter(
          (x) => !formValue.find((y: { id: number }) => y.id === x.userId)
        );
  }

  onRolesSeeReviews(e: any) {
    this.isRolesSeeReviews = !!e.checked;
  }

  onUserViewReviews(e: any) {
    this.isUserViewReviews = !!e.checked;
  }

  onEEMSubRecipients(e: any) {
    this.isEEMSubRecipients = !!e.checked;
  }

  onSiteLevelFindings(e: any) {
    this.isSiteLevelFindings = !!e.checked;
  }

  onMetadataChange(e: any) {
    this.isMetadata = !!e.checked;
  }

  onCompliancePlanChange(e: any) {
    this.isCompliancePlan = !!e.checked;
  }

  closeDialod() {
    this.dialog.closeAll();
  }

  getWorkFlow() {
    this.programAdministrationService.getWorkFlow().subscribe((res: any) => {
      if (res != null) {
        this.workFlowList = res;
      }
    });
  }

  getAllReviewsRoles() {
    this.programAdministrationService
      .getRefDataByRefType("ROL", "000000")
      .subscribe((res: any) => {
        if (res != null) {
          var daRoles = res.filter(function (roles: { refAddlInfo: any }) {
            return roles.refAddlInfo.substring(0, 2) == "DA";
          });
          this.allReviewsRolesList = daRoles;
          console.log({ allReviewsRolesList: this.allReviewsRolesList });
        }
      });
  }

  getAllRevTypes() {
    this.programAdministrationService
      .getReviewType(this.selectedPgmId)
      .subscribe((res: any) => {
        if (res != null) {
          this.reviewTypesList = res;
          console.log({ ReviewList: this.reviewTypesList });
        }
      });
  }

  openMetadataDialogDialog() {
    const dialogRef = this.dialog.open(MetadataDialogComponent, {
      height: "300px",
      width: "600px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  GetCompliancePlanInfo() {
    this.programAdministrationService
      .GetCompliancePlanInfo(1, 1)
      .subscribe((res: any) => {
        if (res != null) {
          console.log(res);
          this.planRemainder = res;
        }
      });
  }
  openPlanRemaindersDialog() {
    console.log({ reviewType: this.reviewType, program: this.program });
    let data: [] = [];
    //add API to get the plain remainder details
    console.log(data);
    const dialogRef = this.dialog.open(PlanRemaindersDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      height: "80%",
      width: "80%",
      panelClass: "full-screen-modal",
      data: this.planRemainder,
    });
    dialogRef.componentInstance.emitService.subscribe((emmitedValue) => {
      // do sth with emmitedValue
      console.log(emmitedValue);
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  selectedProgramReviewDetails() {
    this.programAdministrationService.selectedProgram$.subscribe(
      (value: any) => {
        if (value) {
          this.program = value;

          this.selectedPgmId = value.grantPgmId;
          console.log({
            selectedProgramDetails: this.program,
            selectedPgmId: this.selectedPgmId,
          });
          this.reviewInfoForm.controls["workFlowCtrl"].setValue(
            this.program.pgmRvwInfos[0].wfCd
          );
          this.reviewInfoForm.controls["reviewCycleYrCtrl"].setValue(
            this.program.pgmRvwInfos[0].rvwCycle
          );
          this.reviewInfoForm.controls["siteLevelFindingsCtrl"].setValue(
            this.program.pgmRvwInfos[0].hasSiteLevelFindings != "N"
          );
          this.reviewInfoForm.controls["reviewRolesCtrl"].setValue(
            this.program.pgmRvwInfos[0].allowAllReviewsRoles
          );
          this.reviewInfoForm.controls["userviewReviewsCtrl"].setValue(
            this.program.pgmRvwInfos[0].allowAllReviewsUsers
          );
          console.log(this.program.pgmRvwInfos[0].allowAllReviewsRoles);
          this.reviewInfoForm.controls["rolesCtrl"].setValue(
            this.program.pgmRvwInfos[0].allowAllReviewsRoles
          );
          console.log(this.program.pgmRvwInfos[0].allowedUserGroup);
          this.allowedUsers = this.program.pgmRvwInfos[0].allowAllReviewsUsers;
        }
      }
    );
  }

  onCustomDocumentChange() {
    this.programAdministrationService.setCustomDocumentList(
      !this.reviewInfoForm.controls["customedocumentCtrl"].value
    );
  }

  onCustomFindingsChange() {
    this.programAdministrationService.setCustomFindings(
      !this.reviewInfoForm.controls["customfindingsCtrl"].value
    );
  }

  onCustomFindingsRuleChange() {
    this.programAdministrationService.setCustomFindingsRule(
      !this.reviewInfoForm.controls["customfindingsruleCtrl"].value
    );
  }

  onCustomStageRoleChange() {
    this.programAdministrationService.setCustomStageRole(
      !this.reviewInfoForm.controls["customstageroleCtrl"].value
    );
  }

  compare(c1: { name: string }, c2: { name: string }) {
    return c1 && c2 && c1.name === c2.name;
  }
}
