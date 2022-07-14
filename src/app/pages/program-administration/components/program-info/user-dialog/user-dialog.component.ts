import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { PgmPerm } from "../../../models/pgm-perm.model";
import { UserInfo } from "../../../models/user-info.model";

@Component({
  selector: "app-user-dialog",
  templateUrl: "./user-dialog.component.html",
  styleUrls: ["./user-dialog.component.css"],
})
export class UserDialogComponent implements OnInit {
  userdetails: any;
  constructor(
    private programAdministrationService: ProgramAdministrationService,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  newUser: UserInfo[] = [
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

  newUserPerm: PgmPerm[] = [
    {
      permId: 0,
      recType: "",
      grantPgmId: 0,
      agencyId: 0,
      subRvwId: 0,
      userId: 0,
      permCd: "",
      catAppl: "",
      contactInd: "",
      recStat: "",
      consolidatedRvwPermCd: "",
    },
  ];

  unassignedContactNameLists: any = [];
  unassignedAreaOfResList: any = [];
  unassignedConsolReviewResList: any = [];

  ngOnInit(): void {
    this.programAdministrationService
      .getUnassignedUserByPgId(
        sessionStorage.getItem("selectedProgramId") == "new"
          ? 0
          : sessionStorage.getItem("selectedProgramId"),
        sessionStorage.getItem("selectedOfficeCd"),
        "P"
      )
      .subscribe((res: any) => {
        if (res != null) {
          this.unassignedContactNameLists = res;
          console.log({
            unassignedContactNameLists: this.unassignedContactNameLists,
          });
        }
      });

    this.getConsolReviewResponsbility();

    console.log(this.data);
    if (this.data.dataSourceAddUser) {
      this.newUser = this.data.dataSourceAddUser.data.map((obj: any) => ({
        ...obj,
      }));
      console.log(this.newUser);
    }
  }
  onCancel(): void {
    this.dialogRef.close("Cancel");
  }

  setData(data: any): void {
    console.log(data);
    this.newUser[0].fullName = data.fullName;
    this.newUser[0].userEmail = data.userEmail;
    let val = this.newUser;
    this.userdetails = data;
    this.userdetails.pgmPerms = this.newUserPerm;
    this.userdetails.pgmPerms[0].userId = this.newUser[0].userId;

    this.userdetails.pgmPerms[0].permId = 0;
    this.userdetails.pgmPerms[0].grantPgmId = 0;
  }

  onAddUser(): void {
    console.log(this.newUser);
    console.log(this.userdetails);
    this.userdetails.pgmPerms[0].permCd = this.newUser[0].permCd;
    this.userdetails.pgmPerms[0].consolidatedRvwPermCd =
      this.newUser[0].consolidatedRvwPermCd;
    this.dialogRef.close(this.userdetails);
  }

  onChangeUser(userId: any) {
    this.unassignedContactNameLists.map(
      (user: { userId: any; userRole: any }) => {
        if (user.userId === userId) {
          this.getAreaOfResponsibility(
            this.unassignedContactNameLists[0].userRole
          );
        }
      }
    );
  }

  getAreaOfResponsibility(refSubType: any) {
    this.programAdministrationService
      .getAreaOfResponsibility("ACC", refSubType)
      .subscribe((res: any) => {
        if (res != null) {
          this.unassignedAreaOfResList = res;
          console.log({
            unassignedAreaOfResList: this.unassignedAreaOfResList,
          });
        }
      });
  }

  getConsolReviewResponsbility() {
    this.programAdministrationService
      .getConsolReviewResponsbility("CTY", "A")
      .subscribe((res: any) => {
        if (res != null) {
          this.unassignedConsolReviewResList = res;
          console.log({
            unassignedConsolReviewResList: this.unassignedConsolReviewResList,
          });
        }
      });
  }
}
