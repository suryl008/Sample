import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {
  labelPosition,
  position,
} from "../review-types/review-types.component";

@Component({
  selector: "app-release-program",
  templateUrl: "./release-program.component.html",
  styleUrls: ["./release-program.component.css"],
})
export class ReleaseProgramComponent implements OnInit {
  selectedPgmId: any;
  isReleaseEdit: boolean;
  dataSourceValidate: any;
  dataSourceRelease: boolean;
  reviewTypes: any;
  program:any

  releaseForm: FormGroup;
  tooltipPosition: position = "above";
  myLabelPosition: labelPosition = "before";
  validateReview:boolean = false;
  releaseReview:boolean = false;

  displayedFields: string[] = [
    // "position",
    //"programName",
   // "startYear",
    "reviewType",
    "select",
    "status",
  ];

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isReleaseEdit = false;
    this.programAdministrationService.selectedProgram$.subscribe(
      (programData: any) => {
        if (programData) {
          this.selectedPgmId = programData.grantPgmId;
        }
      }
    );
    this.getReleaseProgramInfo("V");
  }

  getReleaseProgramInfo(option: any) {
    this.programAdministrationService
      .getReleaseProgramInfo(this.selectedPgmId, option)
      .subscribe((res: any) => {
        if (res != null) {
          console.log({ getReleaseProgramInfo: res });
          this.program = res;
          this.reviewTypes = new MatTableDataSource(this.program[0].pgmRvwInfos);

        }
      });
  }

  editReleaseProgram() {
    this.isReleaseEdit = !this.isReleaseEdit;
    this.isReleaseEdit === true
      ? this.releaseForm.enable()
      : this.releaseForm.disable();
  }

  saveReleaseProgram() {}

  onValidateReview(mode:string): void{
    this.validateReview=true;
  }

  cancelRelease(): void {
    this.validateReview=false;
  }
  onReleaseReview(mode:string): void{
    this.validateReview=true;
  }

  cancelValidate(): void {
    this.validateReview=false;
  }

  updateSelection(check:boolean,index:any): void{
console.dir(check +"data" +index)
this.reviewTypes.data[index].checked = check;
this.reviewTypes._updateChangeSubscription();
        this.cd.markForCheck(); 

  }
}
