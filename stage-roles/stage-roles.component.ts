import { MatTableDataSource } from "@angular/material/table";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { StageRolesAddDialogComponent } from "./stage-roles-add-dialog/stage-roles-add-dialog.component";
import { ConfirmDialogComponent } from "../program-info/confirm-dialog/confirm-dialog.component";

export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";

@Component({
  selector: "app-stage-roles",
  templateUrl: "./stage-roles.component.html",
  styleUrls: ["./stage-roles.component.css"],
})
export class StageRolesComponent implements OnInit {
  selectedPgmId: any;
  selectedReviewType: any;
  selectedReviewStage: any;
  selectedRoleClass: any;
  reviewStageCtrl: string;
  roleClassCtrl: string;
  reviewStageList: any = [];
  roleClassList: any = [];
  roleTypeList: any = [];
  roleRuleList: any = [];
  dataSrcList: any = [];
  stageRolesForm: FormGroup;
  tooltipPosition: position = "above";
  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";
  roleIndicatorCtrl: string;
  dataSourceStageRoleTypes: any;
  isStageRoleEdit: boolean;

  displayedFields: string[] = [
    "position",
    "roleClass",
    "roleType",
    "roleIndicator",
    "roleRequired",
    "roleRule",
    "min",
    "max",
    "dataSource",
    "delete",
  ];
  roleIndicatorList:  any[]= [{"key":"N","label":"Notification"},
  {"key":"R","label":"Review"}];
  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.reviewStageCtrl = "";
    this.roleClassCtrl = "";
    this.roleIndicatorCtrl = "";
  }
  ngOnInit(): void {
    this.isStageRoleEdit = false;
    this.reviewStageCtrl = "";
    this.roleClassCtrl = "";
    this.roleIndicatorCtrl = "";

    this.getReviewStageLookup();
    this.getRoleClassLookup();
    this.getRoleTypeLookup();

    this.roleRuleList = [
      { item_id: "", item_text: "" },
      { item_id: "U", item_text: "Unique" },
      { item_id: "D", item_text: "Duplicates" },
      { item_id: "X", item_text: "N/A" },
    ];

    this.dataSrcList = [
      { item_id: "", item_text: "" },
      { item_id: "E", item_text: "EEM" },
      { item_id: "P", item_text: "MEGS+ / CMS" },
      { item_id: "M", item_text: "MEIS" },
      { item_id: "X", item_text: "N/A" },
    ];
    this.stageRolesFormFormInit();
    this.getStageRoleTypeInfo();
  }
  getStageRoleTypeInfo() {
    this.programAdministrationService
      .getStageRoleTypeInfo(1565, "EarlyOn", this.selectedReviewStage, "A")
      .subscribe((res: any) => {
        if (res != null) {
          console.log({ getStageRoleTypeInfo: res });
          this.dataSourceStageRoleTypes = new MatTableDataSource(res);
        }
      });
  }
  stageRolesFormFormInit() {
    this.reviewStageCtrl = "";
    this.roleClassCtrl = "";
    this.roleIndicatorCtrl = "";
    this.stageRolesForm = this.formBuilder.group({
      reviewStageCtrl: [null, Validators.required],
    });
  }
  getRoleTypeLookup() {
    this.programAdministrationService
      .getRoleTypeLookup("CTY", "A")
      .subscribe((res: any) => {
        if (res != null) {
          this.roleTypeList = res;
          console.log({ roleTypeList: this.roleTypeList });
        }
      });
  }
  getRoleClassLookup() {
    this.programAdministrationService
      .getRoleClassLookup("ATY", "000000")
      .subscribe((res: any) => {
        if (res != null) {
          this.roleClassList = res;
          console.log({ roleClassList: this.roleClassList });
        }
      });
  }
  getReviewStageLookup() {
    this.programAdministrationService
      .getReviewStageLookup(1565, "EarlyOn", "GSFI")
      .subscribe((res: any) => {
        if (res != null) {
          this.reviewStageList = res;
          this.reviewStageCtrl = this.reviewStageList[0].rvwStage;
          this.selectedReviewStage = this.reviewStageList[0].rvwStage;

          console.log({ reviewStageList: this.reviewStageList });
        }
      });
  }

  onChangeReviewStage(event: any) {
    this.selectedReviewStage = event.value;
    this.getStageRoleTypeInfo();
  }
  onChangeRoleClass(event: any) {
    this.selectedRoleClass = event.value;
    this.getStageRoleTypeInfo();
  }

  addStageRole() {
    let data = {
      roleClassList: null,
      roleTypeList: null,
      roleIndicatorList: this.roleIndicatorList,
      roleRuleList: null,
      min: 0,
      max: 0,
      dataSrcList: null,
      grantPgmId: 0,
      rvwType: "",
    };
    data.roleClassList = this.roleClassList;
    data.roleTypeList = this.roleTypeList;
    data.roleRuleList = this.roleRuleList;
    data.grantPgmId = this.selectedPgmId;
    data.rvwType = this.selectedReviewType;
    data.dataSrcList = this.dataSrcList;
    const dialogRef = this.dialog.open(StageRolesAddDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",

      width: "50%",
      data: data,
    });
    dialogRef.componentInstance.emitService.subscribe((emmitedValue) => {
      console.log(emmitedValue);
    });
    dialogRef.afterClosed().subscribe((data) => {
      console.log(`Dialog result: ${data}`);
      if (data.result) {
        if (this.dataSourceStageRoleTypes) {
          this.dataSourceStageRoleTypes.data.unshift(data.result);
        } else {
          let temp = [];
          temp.unshift(data.result);
          this.dataSourceStageRoleTypes = new MatTableDataSource(temp);
        }
        console.log(this.dataSourceStageRoleTypes.data);
        console.log(data.result);
        this.dataSourceStageRoleTypes._updateChangeSubscription();
        this.cd.markForCheck(); //or  cd.detectChanges();
      }
      else if(data.default){
        data.default.map((role:any)=>{
          this.dataSourceStageRoleTypes.data.unshift(role);
        })
        this.dataSourceStageRoleTypes._updateChangeSubscription();
        this.cd.markForCheck(); //or  cd.detectChanges();
       
      }
    });
  }
  editStageRoles() {
    this.isStageRoleEdit = !this.isStageRoleEdit;
    this.isStageRoleEdit === true
      ? this.stageRolesForm.enable()
      : this.stageRolesForm.disable();
  }

  saveStageRoles() {}

  openDialog(element: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "20%",
      panelClass: "full-screen-modal",
      data: element,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      if (result == "Confirm") {
        this.deleteUserForDialog(element);
      }
    });
  }

  deleteUserForDialog(data: any) {
    this.dataSourceStageRoleTypes.data.splice(
      this.dataSourceStageRoleTypes.data.indexOf(data),
      1
    );
    this.dataSourceStageRoleTypes._updateChangeSubscription();
    this.cd.markForCheck();
  }
}
