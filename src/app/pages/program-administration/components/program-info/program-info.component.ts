import { PgmPerm } from "./../../models/pgm-perm.model";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { PgmInfo } from "src/app/pages/program-administration/models/pgm-info.model";
import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from "@angular/core";

import { UserAccessPgmInfo } from "src/app/pages/program-administration/models/user-access-pgm-info.model";

import {
  FormControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ProgramAdministrationService } from "../../../../shared/services/program-administration.service";
import { AgencyOffInfo } from "../../models/agency-off-info.model";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserInfo } from "../../models/user-info.model";
import { UserDialogComponent } from "./user-dialog/user-dialog.component";
import { Router } from "@angular/router";
import { AppSettings } from "src/app/app-settings";

export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";

@Component({
  selector: "app-program-info",
  templateUrl: "./program-info.component.html",
  styleUrls: ["./program-info.component.css"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramInfoComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  @ViewChild(MatSort) sort: any = MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  addNewUser: UserInfo[] = [
    {
      userId: 0,
      fullName: "",
      userRole: "",
      userDsg: "",
      userEmail: "",
      menuStyle: "",
      pswdResetReqd: "",
      recStat: "",
      userName: "",
      displayName: "",
      consolidatedRvwPermCd: "",
      permCd: "",
    },
  ];

  users: Array<UserInfo>;
  showTable: boolean;
  statusMessage: string;
  isLoaded: boolean = true;
  displayedColumnsUsers: string[] = [
    "fullName",
    "userRole",
    "userDsg",
    "userEmail",
    "Delete",
  ];
  displayedColumnsAddUser: string[] = [
    "fullName",
    "userRole",
    "userDsg",
    "userEmail",
    "Save",
    "Cancel",
  ];
  dataSourceUsers: any;
  dataSourceAddUser: any;
  newUser: UserInfo;

  programInfoForm: FormGroup;
  tooltipPosition: position = "above";

  public programOfficeList: AgencyOffInfo[];
  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";
  selectedItems: any = [];
  selectedPgmId: any;
  gridContactNames: any = [];
  contactNameLists: any = [];
  areaOfResponsbilityList: any = [];
  consolReviewResponsbility: any = [];
  consolReviewResponsbilityList: any = [];
  grdAssignedContactNames: any = [];
  assignedContactNameLists: any = [];
  selectUserEmail: any;
  isNew: boolean;
  isEdit: boolean = false;
  programData: any;
  programBaseCtl: boolean = true;
  planconductreviewCtl: boolean = false;
  planspendfindingsrptCtl: boolean = false;
  consolidatedReviewsCtrl: boolean = false;
  linkappreviewCtl: boolean = false;
  fullNameCtrl: "";
  areaOfResponsCtrl: "";
  consRvwResponsCtrl: "";
  userEmailCtrl: "";
  customereviewCtl: boolean = false;
  customeNamingCtrl: boolean = false;
  userAccessPgmId: number;
  comments: string = "";
  recStat: boolean = false;

  public program: any = null;

  public selected: string;
  public selectedOffice: string;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.isNew = sessionStorage.getItem("selectedProgramId") === "new";
    sessionStorage.getItem("editMode") === "true"
      ? (this.isEdit = true)
      : (this.isEdit = false);
    console.log("edit " + sessionStorage.getItem("editMode") + this.isEdit);
    this.programInfoFormInit();
    if (!this.isNew) {
      this.selectedProgramDetails();
    } else {
      this.getAssignedUserByPgId();
    }
    this.getProgramOfficeList();

    this.dataSourceAddUser = new MatTableDataSource(this.addNewUser);
    this.onChanges();
    this.isLoaded = false;
  }
  onChanges() {
    /**
     * @TODO - Evaluate different approach since this goes into loop like rendering
     */
    this.programInfoForm.valueChanges.subscribe((val) => {
      this.programData = val;
    });
  }

  editProgram() {
    this.isEdit = !this.isEdit;
    this.programInfoForm.enable();
  }
  cancelprogram() {
    this.isEdit = !this.isEdit;
    this.programInfoForm.disable();
    if (this.isNew) {
      this.router.navigate(["program/dashboard"]);
    }
  }

  programInfoFormInit() {
    this.programInfoForm = this.formBuilder.group({
      grantPgmId: [0],
      grantPgmDesc: ["", Validators.required],
      grantPgm: ["", Validators.required],
      roundNo: 0,
      offCd: ["", Validators.required],
      rvwStart: ["", Validators.required],
      regAppl: "",
      consAppl: [false],
      raSrc: "",
      pgmSrc: [false],
      createDt: "",
      createId: 0,
      lastUpdDt: "",
      lastUpdId: 0,

      pcRel: "",
      cfdaNo: "",
      subCdNm: null,
      subPNm: null,
      subCNm: null,
      findRptNm: null,
      compPlanNm: null,
      compEviNm: null,
      confirmEmailReq: [false],
      sendEmailConfirm: [false],
      consolidatedReviewEnabled: [false],
      consolidatedReviewTypeName: null,
      consolidatedReviewName: null,
      consolidatedReviewAutoAddReviewLead: [false],
      grantPgmType: null,
      createReviewEnabled: null,
      pgmRvwInfos: [],
      pgmPerms: [],
      userAccessPgmInfos: [],
      emailTemplates: [],
    });

    this.programAdministrationService.setCustomReviewType(
      this.customereviewCtl
    );
  }

  selectedProgramDetails() {
    this.programAdministrationService.selectedProgram$.subscribe(
      (value: any) => {
        if (value) {
          this.program = value;
          this.customereviewCtl =
            this.program.pgmRvwInfos.length > 1 ||
            this.program.pgmRvwInfos.some(function (el: any) {
              return el.rvwType !== AppSettings.DEFAULT_REVIEW_TYPE;
            });
          this.programAdministrationService.setCustomReviewType(
            this.customereviewCtl
          );
          this.selectedPgmId = value.grantPgmId;
          console.log({
            selectedProgramDetails: this.program,
            selectedPgmId: this.selectedPgmId,
          });
          if (this.isEdit === true) {
            this.programInfoForm.enable();
          } else {
            this.programInfoForm.disable();
          }
          this.programInfoForm.controls["grantPgmDesc"].setValue(
            this.program.grantPgmDesc
          );
          this.programInfoForm.controls["grantPgm"].setValue(
            this.program.grantPgm
          );
          this.programInfoForm.controls["offCd"].setValue(this.program.offCd);
          this.programInfoForm.controls["rvwStart"].setValue(
            this.program.rvwStart
          );

          this.programInfoForm.controls["consAppl"].setValue(
            this.program.consAppl != "N"
          );
          this.programInfoForm.controls["pgmSrc"].setValue(
            this.program.pgmSrc != "X"
          );
          this.programInfoForm.controls["confirmEmailReq"].setValue(
            this.program.confirmEmailReq != "N"
          );
          this.programInfoForm.controls["sendEmailConfirm"].setValue(
            this.program.sendEmailConfirm != "N"
          );
          this.programInfoForm.controls["cfdaNo"].setValue(this.program.cfdaNo);

          this.comments = this.program.userAccessPgmInfos[0].comments;

          this.programInfoForm.controls["subCdNm"].setValue(
            this.program.subCdNm
          );
          this.programInfoForm.controls["subPNm"].setValue(this.program.subPNm);
          this.programInfoForm.controls["subCNm"].setValue(this.program.subCNm);
          this.programInfoForm.controls["findRptNm"].setValue(
            this.program.findRptNm
          );
          this.programInfoForm.controls["compPlanNm"].setValue(
            this.program.compPlanNm
          );
          this.programInfoForm.controls["compEviNm"].setValue(
            this.program.compEviNm
          );

          if (
            this.programInfoForm.controls["subCdNm"].value != "" ||
            this.programInfoForm.controls["subPNm"].value != "" ||
            this.programInfoForm.controls["subCNm"].value != "" ||
            this.programInfoForm.controls["findRptNm"].value != "" ||
            this.programInfoForm.controls["compPlanNm"].value != "" ||
            this.programInfoForm.controls["compEviNm"].value != ""
          ) {
            this.customeNamingCtrl = true;
          } else {
            this.customeNamingCtrl = false;
          }

          this.programInfoForm.controls["consolidatedReviewEnabled"].setValue(
            this.program.consolidatedReviewEnabled != "N"
          );
          this.programInfoForm.controls["consolidatedReviewTypeName"].setValue(
            this.program.consolidatedReviewTypeName
          );
          this.programInfoForm.controls["consolidatedReviewName"].setValue(
            this.program.consolidatedReviewName
          );
          this.programInfoForm.controls[
            "consolidatedReviewAutoAddReviewLead"
          ].setValue(this.program.consolidatedReviewAutoAddReviewLead != "N");
          this.programInfoForm.controls["userAccessPgmInfos"].setValue(
            this.program.userAccessPgmInfos
          );
          this.programInfoForm.controls["roundNo"].setValue(
            this.program.roundNo
          );
          this.programInfoForm.controls["createDt"].setValue(
            this.program.createDt
          );
          this.programInfoForm.controls["createId"].setValue(
            this.program.createId
          );
          this.programInfoForm.controls["createReviewEnabled"].setValue(
            this.program.createReviewEnabled
          );
          this.programInfoForm.controls["emailTemplates"].setValue(
            this.program.emailTemplates
          );
          this.programInfoForm.controls["grantPgmId"].setValue(
            this.program.grantPgmId
          );
          this.programInfoForm.controls["grantPgmType"].setValue(
            this.program.grantPgmType
          );
          this.programInfoForm.controls["lastUpdDt"].setValue(
            this.program.lastUpdDt
          );
          this.programInfoForm.controls["lastUpdId"].setValue(
            this.program.lastUpdId
          );
          this.programInfoForm.controls["pcRel"].setValue(this.program.pcRel);
          this.programInfoForm.controls["pgmPerms"].setValue(
            this.program.pgmPerms
          );
          this.programInfoForm.controls["pgmRvwInfos"].setValue(
            this.program.pgmRvwInfos
          );
          this.programInfoForm.controls["regAppl"].setValue(
            this.program.regAppl
          );

          if (
            this.programInfoForm.controls["consolidatedReviewEnabled"].value !=
              false ||
            this.programInfoForm.controls["consolidatedReviewTypeName"].value !=
              "" ||
            this.programInfoForm.controls["consolidatedReviewName"].value !=
              "" ||
            this.programInfoForm.controls["consolidatedReviewAutoAddReviewLead"]
              .value != false
          ) {
            this.consolidatedReviewsCtrl = true;
          } else {
            this.consolidatedReviewsCtrl = false;
          }

          this.loadUsers();
          this.selectedOffice = this.program.offCd;
          sessionStorage.setItem("selectedOfficeCd", this.selectedOffice);
          this.getAssignedUserByPgId();
          this.isLoaded = false;
        }
      }
    );
  }

  show() {
    this.showTable = true;
    this.addNewUser = [
      {
        userId: 0,
        fullName: "",
        userRole: "",
        userDsg: "",
        userEmail: "",
        menuStyle: "",
        pswdResetReqd: "",
        recStat: "",
        userName: "",
        displayName: "",
        consolidatedRvwPermCd: "",
        permCd: "",
      },
    ];
  }

  getAssignedUserByPgId() {
    this.programAdministrationService
      .getPermUserInfo(this.selectedPgmId)
      .subscribe((res: any) => {
        if (res != null) {
          this.grdAssignedContactNames = res;
          for (let i = 0; i < this.grdAssignedContactNames.length; i++) {
            this.assignedContactNameLists.push(this.grdAssignedContactNames[i]);
            this.getAreaOfResponsibility(
              this.grdAssignedContactNames[i].userRole,
              i
            );
            this.getConsolReviewResponsbility(i);
          }
        }
      });
  }

  getAreaOfResponsibility(refSubType: any, arrayId: number) {
    this.programAdministrationService
      .getAreaOfResponsibility("ACC", refSubType)
      .subscribe((res: any) => {
        if (res != null) {
          this.areaOfResponsbilityList[arrayId] = res;
        }
      });
  }
  conRevi = [{ userRole: "sub" }, {}];

  getConsolReviewResponsbility(arrayId: number) {
    /**
     * @TODO - Evaluate for performance
     */
    this.programAdministrationService
      .getConsolReviewResponsbility("CTY", "A")
      .subscribe((res: any) => {
        if (res != null) {
          this.consolReviewResponsbilityList[arrayId] = res;
        }
      });
  }

  onUserItemSelect(item: any) {
    this.selectUserEmail = this.grdAssignedContactNames.find(
      (obj: { userId: number }) => {
        return obj.userId === item.value;
      }
    ).userEmail;
  }

  onSubmit() {
    let data: PgmInfo = {
      grantPgmId: this.programData.grantPgmId,
      grantPgm: this.programData.grantPgm,
      roundNo: 1,
      grantPgmDesc: this.programData.grantPgmDesc,
      offCd: this.programData.offCd,
      rvwStart: this.programData.rvwStart,
      regAppl: this.programData.regAppl === true ? "Y" : "N",
      consAppl: this.programData.consAppl === true ? "Y" : "N",
      raSrc: this.programData.consAppl === true ? "S" : "X",
      pgmSrc: this.programData.consAppl === true ? "S" : "X",
      createDt: "2022-07-10",
      recStat: this.recStat === true ? "A" : "I",
      createId: 0,
      lastUpdDt: "2022-07-10",
      lastUpdId: 0,
      pcRel: this.programData.pcRel === true ? "S" : "X",
      cfdaNo: this.programData.cfdaNo,
      subCdNm: this.programData.subCdNm,
      subPNm: this.programData.subPNm,
      subCNm: this.programData.subCNm,
      findRptNm: this.programData.findRptNm,
      compPlanNm: this.programData.compPlanNm,
      compEviNm: this.programData.compEviNm,
      confirmEmailReq: this.programData.confirmEmailReq === true ? "Y" : "N",
      sendEmailConfirm: this.programData.sendEmailConfirm === true ? "Y" : "N",
      consolidatedReviewEnabled:
        this.programData.consolidatedReviewEnabled === true ? "Y" : "N",
      consolidatedReviewTypeName: this.programData.consolidatedReviewTypeName,
      consolidatedReviewName: this.programData.consolidatedReviewName,
      consolidatedReviewAutoAddReviewLead:
        this.programData.consolidatedReviewAutoAddReviewLead === true
          ? "Y"
          : "N",
      grantPgmType: "",
      createReviewEnabled:
        this.programData.createReviewEnabled === true ? "Y" : "N",
    };
    data.pgmPerms = [];
    if (this.dataSourceUsers) {
      let perms: any = [];
      this.dataSourceUsers.data.map((pgmPerm: any) => {
        console.log(pgmPerm);
        (pgmPerm.pgmPerms[0].recStat = this.recStat === true ? "A" : "I"),
          perms.push(pgmPerm.pgmPerms[0]);
      });
      data.pgmPerms = perms;
    }
    let userAccessPgmInfos: UserAccessPgmInfo = {
      userAccessPgmId: this.userAccessPgmId,
      grantPgmId: 0,
      createDt: "2022-07-10",
      createId: 0,
      lastUpdDt: "2022-07-10",
      lastUpdId: 0,
      recStat: this.recStat === true ? "A" : "I",
      comments: this.comments,
    };
    data.userAccessPgmInfos = [];
    data.userAccessPgmInfos.push(userAccessPgmInfos);

    this.saveProgramInfo(data);
  }

  saveProgramInfo(pgmInfo: PgmInfo) {
    if (
      pgmInfo.grantPgm != null &&
      pgmInfo.grantPgmDesc != null &&
      pgmInfo.offCd != null
    ) {
      this.programAdministrationService
        .programInfoSave(pgmInfo)
        .subscribe((res) => {
          console.log({ SavePgmInfoData: res });
          const savedData = res;
          sessionStorage.setItem("selectedProgramId", savedData[0].grantPgmId);
          sessionStorage.setItem("reviewType", savedData[0].rvwTypeId);
          sessionStorage.setItem("editMode", "false");
          this.router.navigate(["/program/info/", savedData[0].grantPgmId]);
        });
    }
  }

  onChangeComment(e: any) {
    this.comments = e.target.value;
  }
  onReviewTypeChange() {
    this.programAdministrationService.setCustomReviewType(
      !this.customereviewCtl
    );
  }

  getProgramOfficeList() {
    this.programAdministrationService
      .getProgramOfficeList()
      .subscribe((res: any) => {
        if (res != null) {
          this.programOfficeList = res;
        }
      });
  }

  onChangeOffice(e: any) {
    this.selectedOffice = e.value;
    sessionStorage.setItem("selectedOfficeCd", this.selectedOffice);
  }

  private loadUsers() {
    this.isLoaded = true;
    this.programAdministrationService
      .getPermUserInfo(this.selectedPgmId)
      .subscribe({
        next: (data) => {
          this.users = data;
          this.users.sort(function (
            obj1: { userId: number },
            obj2: { userId: number }
          ) {
            // Descending: first id less than the previous
            return obj2.userId - obj1.userId;
          });
          this.isLoaded = false;
          this.dataSourceUsers = new MatTableDataSource(this.users);
          this.dataSourceAddUser = new MatTableDataSource(this.addNewUser);
          this.dataSourceUsers.sort = this.sort;
          this.dataSourceUsers.paginator = this.paginator;
          // console.log({ LoadUsers: this.dataSourceUsers });
        },
        error: (err) => {
          alert(`Error ${err}!`);
          this.isLoaded = false;
        },
      });
  }

  cancel() {
    this.showTable = false;
  }

  //snackBar
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  saveUser(user: UserInfo) {
    // if (user.age != null && user.name != null && user.name != "" && user.age != 0) {
    //     this.serv.createUser(user).subscribe({
    //       next: value => {
    //         this.statusMessage = 'User ' + user.name + ' is added';
    //         this.showTable = false;
    //         this.openSnackBar(this.statusMessage, "Success");
    //         this.loadUsers();
    //       },
    //       error: err => {
    //         this.showTable = false;
    //         this.openSnackBar(err, "Error");
    //       }
    //     });
    // }
    // else {
    //     this.openSnackBar("Please enter correct data", "Error")
    // }
  }

  applyFilter(filterValue: string) {
    this.dataSourceUsers.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceUsers.paginator) {
      this.dataSourceUsers.paginator.firstPage();
    }
  }

  deleteUserForDialog(user: UserInfo) {
    console.log(user);
    console.log(this.dataSourceUsers.data.indexOf(user));
    if (this.dataSourceUsers) {
      this.dataSourceUsers.data.splice(
        this.dataSourceUsers.data.indexOf(user),
        1
      );
      this.dataSourceUsers._updateChangeSubscription();
      this.cd.markForCheck();
      this.openSnackBar(this.statusMessage, "Success");
    }

    // this.serv.deleteUser(user.id).subscribe({
    //     next:(value => {
    //       this.statusMessage = 'User ' + user.name + ' is deleted';
    //       this.openSnackBar(this.statusMessage, "Success");
    //       this.loadUsers();
    //     })
    //   }
    // )
  }

  openDialog(element: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "250px",
      data: element,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      if (result == "Confirm") {
        this.deleteUserForDialog(element);
      }
    });
  }

  openAddUser(element: any): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: "250px",
      disableClose: true,
      data: {
        dataSourceUsers: this.dataSourceUsers,
        areaOfResponsbilityList: this.areaOfResponsbilityList,
        consolReviewResponsbilityList: this.consolReviewResponsbilityList,
        assignedContactNameLists: this.assignedContactNameLists,
        dataSourceAddUser: this.dataSourceAddUser,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != "Cancel") {
        console.log("The dialog was closed");
        console.log(this.dataSourceUsers);
        this.assignedContactNameLists.push(result);

        if (this.assignedContactNameLists.length > 0) {
          this.getAreaOfResponsibility(
            result.userRole,
            this.assignedContactNameLists.length - 1
          );
          this.getConsolReviewResponsbility(
            this.assignedContactNameLists.length - 1
          );
        } else {
          this.getAreaOfResponsibility(result.userRole, 0);
          this.getConsolReviewResponsbility(0);
        }

        if (this.dataSourceUsers) {
          this.dataSourceUsers.data.push(result);
        } else {
          let temp = [];
          temp.push(result);
          this.dataSourceUsers = new MatTableDataSource(temp);
        }
        console.log(this.dataSourceUsers.data);
        console.log(result);
        this.dataSourceUsers._updateChangeSubscription();
        this.cd.markForCheck(); //or  cd.detectChanges();
        // this.dataSourceUsers.data.push(result[0]);
      }
    });
  }
}
