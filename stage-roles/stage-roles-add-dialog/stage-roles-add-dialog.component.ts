import { EventEmitter, Inject } from "@angular/core";
import { Component, OnInit, Output } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { AppSettings } from "src/app/app-settings";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

@Component({
  selector: "app-stage-roles-add-dialog",
  templateUrl: "./stage-roles-add-dialog.component.html",
  styleUrls: ["./stage-roles-add-dialog.component.css"],
})
export class StageRolesAddDialogComponent implements OnInit {
  @Output() emitService = new EventEmitter();
  reviewType: any;
  selectedPgmId: any;
  program: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private programAdministrationService: ProgramAdministrationService,
    public dialogRef: MatDialogRef<StageRolesAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
){}
addNewStageRole:any;
defaultRoles=[];


addNewStage(){
  console.log(this.addNewStageRole);
  this.dialogRef.close({result:this.addNewStageRole});
}

    
  ngOnInit(): void {
    this.reviewType =
    this.activatedRoute.snapshot.queryParamMap.get("review") ||
    sessionStorage.getItem("reviewType") ||
    this.programAdministrationService.reviewType ||
    AppSettings.DEFAULT_REVIEW_TYPE;
    this.programAdministrationService.selectedProgram$.subscribe(
      (programData: any) => {
        if (programData) {
          this.program = programData;
          this.selectedPgmId = programData.grantPgmId;
        }
      })
      this.addNewStageRole = {
        "roleId": 0,
        "grantPgmId": this.selectedPgmId,
        "rvwStage": "",
        "roleCls": "",
        "roleInd": "",
        "roleType": "",
        "roleReqd": "N",
        "roleRule": "",
        "minNos": 0,
        "maxNos": 0,
        "dataSrc": "",
        "createDt": new Date(),
        "createId": 0,
        "lastUpdDt": new Date(),
        "lastUpdId": 0,
        "rvwType": this.reviewType,
        "roleTypeDescription": "",
        "chkInd": 0,
        "pgmRoleRules": []
      };
      
  }

  addDefaultRoles():void {
    this.defaultRoles=[];
    this.dialogRef.close({default:this.defaultRoles});
  }

  
}
