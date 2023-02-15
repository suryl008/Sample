import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { PopUpComponent } from 'src/app/shared/PopUp/PopUp.component';

export type labelPosition = "before" | "after";

@Component({
  selector: 'app-copy-workflow',
  templateUrl: './CopyWorkflow.component.html',
  styleUrls: ['./CopyWorkflow.component.scss', '../Workflow.scss']
})
export class CopyWorkflowComponent implements OnInit {


  constructor( private formBuilder : FormBuilder,  public dialog: MatDialog, private router: Router ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";
  public sampleDropdown1: any = [
    {
      "workflowFromId": 1,
      "workflowFromCode": "WFF1",
      "workflowFromDesc": "WorkFlow From -1",
    },
    {
      "workflowFromId": 2,
      "workflowFromCode": "WFF2",
      "workflowFromDesc": "WorkFlow From -1",
    },
    {
      "workflowFromId": 3,
      "workflowFromCode": "WFF3",
      "workflowFromDesc": "WorkFlow From -1",
    },
  ]
  public sampleDropdown2: any = [
    {
      "workflowToId": 4,
      "workflowToCode": "WFT1",
      "workflowToDesc": "WorkFlow To -1",
    },
    {
      "workflowToId": 5,
      "workflowToCode": "WFT2",
      "workflowToDesc": "WorkFlow To -2",
    },
    {
      "workflowToId": 6,
      "workflowToCode": "WFT3",
      "workflowToDesc": "WorkFlow To -3",
    },
  ]
  public sampleDropdown3: any = [
    {
      "stageFromId": 7,
      "stageFromCode":  "SFF1",
      "stageFromDesc":  "Stage From -1",
    },
    {
      "stageFromId": 8,
      "stageFromCode": "SFF2",
      "stageFromDesc": "Stage From -2",
    },
    {
      "stageFromId": 9,
      "stageFromCode": "SFF3",
      "stageFromDesc": "Stage From -3",
    },
  ]
  public sampleDropdown4: any = [
    {
      "stageToId": 10,
      "stageToCode": "SFT1",
      "stageToDesc": "Stage To -1",
    },
    {
      "stageToId": 11,
      "stageToCode": "SFT2",
      "stageToDesc": "Stage To -2",
    },
    {
      "stageToId": 12,
      "stageToCode": "SFT3",
      "stageToDesc": "Stage To -3",
    },
  ]
  public copyWorkflowForm: FormGroup;
  public selectedIndex: number;
  public showSpinner: boolean;
  public filteredWorkflowFrom : any = [];
  public filteredWorkflowTo : any = [];
  public filteredStageFrom : any = [];
  public filteredStageTo : any = [];
  public WorkflowNotes : any = [];
  public WorkflowCopyConfiguration : boolean = false;
  public WorkflowCopyPermission : boolean = false;
  public selectedWorkflowFrom: any;
  public selectedWorkflowTo: any;
  public selectedStageFrom: any;
  public selectedStageTo: any;


  ngOnInit() {
    this.selectedIndex = 0;
    this.initFormGroup();
    setTimeout(() => {
      this.showSpinner = false;
    }, 2000);
  }

  initFormGroup(){
    this.copyWorkflowForm =  this.formBuilder.group({
      WorkflowCopyConfiguration: [""],
      WorkflowCopyPermission: [""],
      filteredWorkflowFrom: [""],
      filteredWorkflowTo: [""],
      selectedStageFrom: [""],
      filteredStageTo: [""],
      WorkflowNotes: [""],
    })
  }

  getAutocompleteDropdown(event, fieldName){
    if(event?.target?.value?.trim().length >= 3){
      if(fieldName == "workFlowFrom"){
        this.filteredWorkflowFrom = [];
        this.filteredWorkflowFrom = JSON.parse(JSON.stringify(this.sampleDropdown1));
      }
      if(fieldName == "workFlowTo"){
        this.filteredWorkflowTo = [];
        this.filteredWorkflowTo = JSON.parse(JSON.stringify(this.sampleDropdown2));
      }
      if(fieldName == "stageFrom"){
        this.filteredStageFrom = [];
        this.filteredStageFrom = JSON.parse(JSON.stringify(this.sampleDropdown3));
      }
      if(fieldName == "stageTo"){
        this.filteredStageTo = [];
        this.filteredStageTo = JSON.parse(JSON.stringify(this.sampleDropdown4));
      }
    }
  }

  setAutocompleteDropdownSelectedData(value, fieldName){
      if(fieldName == "workFlowFrom"){
        this.filteredWorkflowFrom = [];
        this.selectedWorkflowFrom = value
      }
      if(fieldName == "workFlowTo"){
        this.filteredWorkflowTo = [];
        this.selectedWorkflowTo = value
      }
      if(fieldName == "stageFrom"){
        this.filteredStageFrom = [];
        this.selectedStageFrom = value
      }
      if(fieldName == "stageTo"){
        this.filteredStageTo = [];
        this.selectedStageTo = value
      }
  }

  submitCopyWorkflow(){
    let payload = {
      WorkflowCopyConfiguration: this.WorkflowCopyConfiguration,
      WorkflowCopyPermission: this.WorkflowCopyPermission,
      workFlowFrom: this.selectedWorkflowFrom?.workflowFromId || null,
      workFlowTo: this.selectedWorkflowTo?.workflowToId || null,
      stageFrom: this.selectedStageFrom?.stageFromId || null,
      stageTo: this.selectedStageTo?.stageToId || null,
      WorkflowNotes: this.WorkflowNotes.length > 0 ? this.WorkflowNotes?.trim() : null
    }
    console.log(payload)
    this.clearCopyWorkflowFields();
  }

  disableSubmitbutton(){
    let disableBtn = false;

    if( (!this.WorkflowCopyConfiguration && !this.WorkflowCopyPermission) || this.selectedWorkflowFrom?.workflowFromId === undefined ||  this.selectedWorkflowTo?.workflowToId === undefined
      || this.selectedStageFrom?.stageFromId === undefined ||  this.selectedStageTo?.stageToId === undefined ){
        disableBtn = true;
      }

    return disableBtn
  }

  clearAutoCompleted(fieldName){
    if(fieldName == "workFlowFrom"){
      this.filteredWorkflowFrom = [];
      this.copyWorkflowForm.controls['filteredWorkflowFrom'].setValue("");
      this.selectedWorkflowFrom.workflowFromId = undefined;
    }
    if(fieldName == "workFlowTo"){
      this.filteredWorkflowTo = [];
      this.copyWorkflowForm.controls['filteredWorkflowTo'].setValue("");
      this.selectedWorkflowTo.workflowToId = undefined;
    }
    if(fieldName == "stageFrom"){
      this.filteredStageFrom = [];
      this.copyWorkflowForm.controls['selectedStageFrom'].setValue("");
      this.selectedStageFrom.stageFromId = undefined;
    }
    if(fieldName == "stageTo"){
      this.filteredStageTo = [];
      this.copyWorkflowForm.controls['filteredStageTo'].setValue("");
      this.selectedStageTo.stageToId = undefined;
    }
  }

  clearCopyWorkflowFields(){
    this.router.navigate(['workflowsetup/copyworkflow']);
  }
}
