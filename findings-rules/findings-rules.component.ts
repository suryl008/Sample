import { MatTableDataSource } from "@angular/material/table";
import { FindingRuleAddDialogComponent } from "./finding-rule-add-dialog/finding-rule-add-dialog.component";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { FindingRule } from "../../models/finding-rule.model";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { FindingsAddDialogComponent } from "./findings-add-dialog/findings-add-dialog.component";
import { FlexFormPdftemplate } from "../../models/flex-form-pdf-template.model";
import { VwQuestionnaireFields } from "../../models/vw-questionnaire-fields.model";
import { FlexFormPdftemplateField } from "../../models/flex-form-pdf-template-field.model";
import { map, Observable, of } from "rxjs";
//import { map } from 'rxjs/operators';


export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";

export interface PeriodicElement {
  group: labelPosition;
  andOr: string;
  formQuestionnaire: string;
  operator: string;
  value: string;
}
interface getFormData {
  flexFormPdftemplateId: number;
  name: string;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {
    group: "after",
    andOr: "",
    formQuestionnaire: "",
    operator: "",
    value: "",
  },
];

/**
 * @title Table with filtering
 */

@Component({
  selector: "app-findings-rules",
  templateUrl: "./findings-rules.component.html",
  styleUrls: ["./findings-rules.component.css"],
})
export class FindingsRulesComponent implements OnInit {
  isNew: boolean = false;
  isRuleEdit: boolean = false;
  findingsRulesForm: FormGroup;
  tooltipPosition: position = "above";

  public findingsRulesList: FindingRule[];
  findingRuleResult: FindingRule[];
  myLabelPosition: labelPosition = "after";
  myLabelPosition1: labelPosition = "after";
  recStat: boolean = false;
  recStat1: boolean = false;
  isGetNewRule = true;
  isGetSelectedRule = true;
  public selectedRule: any;

  dataSourceFormFields: any;
  dataSourceQuestionnaireFields: any = [];
  dataSourceRules: any;
  andOrList: any = [];
  formQuestionnaireList: any = [];
  formTextQuestionnaireList: any = [];

  formList: any = [];
  questionnaireList: any = [];
  formFieldList: any = [];
  questionnaireFieldList: any = [];

  operatorTextBoxList: any = [];
  operatorCheckBoxList: any = [];
  operatorList: any = [];
  operatorDataList: any = [];
  citationValue: any = [];
  findingValue: any = [];
  arcValue: any = [];

  assignedContactNameLists: any = [];
  _arrfindingsRulesListData: any = [];
  updateNewFindingRule: any;

  rules: Array<FindingRule>;
  showTable: boolean;
  statusMessage: string;
  isLoaded: boolean = true;
  displayedColumnsRules: string[] = [
    "group",
    "andOr",
    "formQuestionnaire",
    "operator",
    "value",
  ];

  public updateFindingRuleForm: FormGroup;
  getFindingRuleArcData: any;
  isGetCitationData = false;
  isGetFindingData = false;
  isGetARCData = false;

  findingRuleResultData = [];
  dataSourceFindingARC = [];
  _arrFindingArc = [];
  _arrFieldList = [];
  isChecked: boolean;
  andOrListData: string;
  formQuest: string;
  formQuestName: string;
  fieldData: string;
  operator: string;
  formQuestvalue: string;
  formQuestNameValue: string;
  fieldValueData: string;
  textAreavalue: string;

  getOperatorData: string;

  isFindingRuleEdit: boolean;
  ruleJson:any=[];
  
  dataSource = new MatTableDataSource<any>(this.ruleJson);
  getFormData: FlexFormPdftemplate;
  getquestionarieData: VwQuestionnaireFields;
  selectedList: any = [];
  selectedValueList: any = [];
  fieldList: FlexFormPdftemplateField[];
  fieldListData: any = [];

  operatorListItem: FlexFormPdftemplateField;
  name: string;
  fieldValueListData: any = [];

  isForm: boolean = false;
  isQuestionarie: boolean = false;
  disableFormQuestData = true;
  disableFieldData = true;
  disableOperatorData = true;
  disableFormTextQuestData = true;
  disableFieldTextData = true;
  disableAndOrList = true;
  isTextBox = false;

  _arrSelectedValueFormList: any = [];
  _arrSelectedValueQuestList: any = [];
  _arrfindingRuleResultData: any = [];
  _arrSelectedFormList: any = [];
  _arrSelectedQuestList: any = [];
  //findingRuleResult: any = [];

  selectedFormQuest: string;
  selectedFormTextQuest: string;
  addFindingRuleForm: any = [];
  selectedRuleName: string;
  sourceType: string;
  valueType: string;
  andOr: string;

  //dataSource: MatTableDataSource<PeriodicElement>;
  //dataSource: any[] = [];
  //dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  noData = this.dataSource.connect().pipe(map(data => data.length === 0));
  fieldListQuesData: any=[];
  //dataSource: any[] = [];
  // @ViewChild(MatSort) sort: MatSort;

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
    this.isFindingRuleEdit = false;
    this.isRuleEdit = false;

    this.findingsRulesForm = this.formBuilder.group({
      findingRuleId: [0],
      name: ["", Validators.required],
      activeInactive: null,
    });

    //this.findingRulesFormInit();
    this.getFindingsRulesList();
    this.getFlexFormPDFTemplateFields();
    this.getAllQuestionnaireFields();
    this.getFlexFormPDFTemplateValueFields();
    this.getAllQuestionnaireValueFields();
    //this.getFindingRuleResult();
    //this.dataSource.paginator = this.paginator;

    this.updateFindingRuleForm = this.formBuilder.group({
      groupId: null,
      andOr: null,
      sourceType: null,
      flexFormPdftemplateId: null,
      questionnaireId: null,
      flexFormPdftemplateFieldId: null,
      questionnaireFieldId: null,
      operator: null,
      valueType: null,
      flexFormPdftemplateIdValue: null,
      questionnaireIdValue: null,
      flexFormPdftemplateFieldIdValue: null,
      questionnaireFieldIdValue: null,
      valueText: null,
    });

    this.andOrList = [
      //{ item_id: "", item_text: "" },
      { item_id: "And", item_text: "And" },
      { item_id: "Or", item_text: "Or" },
    ];
    this.formQuestionnaireList = [
      //{ item_id: "", item_text: "" },
      { item_id: "FORM", item_text: "Form" },
      { item_id: "QUESTIONNAIRE", item_text: "Questionnaire" },
    ];
    this.formTextQuestionnaireList = [
      //{ item_id: "", item_text: "" },
      { item_id: "FORM", item_text: "Form" },
      { item_id: "TEXT", item_text: "Text" },
      { item_id: "QUESTIONNAIRE", item_text: "Questionnaire" },
    ];

    this.operatorCheckBoxList = [
      //{ item_id: "", item_text: "" },
      { item_id: "ischecked", item_text: "Is Checked" },
      { item_id: "isnotchecked", item_text: "Is Not Checked" },
    ];
    this.operatorTextBoxList = [
      //{ item_id: "", item_text: "" },
      { item_id: "=", item_text: "=" },
      { item_id: "<>", item_text: "<>" },
      { item_id: ">", item_text: ">" },
      { item_id: "<", item_text: "<" },
      { item_id: ">=", item_text: ">=" },
      { item_id: "<=", item_text: "<=" },
      { item_id: "contains", item_text: "Contains" },
      { item_id: "doesnotcontain", item_text: "Does Not Contain" },
    ];

    this.operatorDataList = [
      // { item_id: "", item_text: "" },
      { item_id: "=", item_text: "=" },
      { item_id: "<>", item_text: "<>" },
      { item_id: ">", item_text: ">" },
      { item_id: "<", item_text: "<" },
      { item_id: ">=", item_text: ">=" },
      { item_id: "<=", item_text: "<=" },
      { item_id: "contains", item_text: "Contains" },
      { item_id: "doesnotcontain", item_text: "Does Not Contain" },
      { item_id: "ischecked", item_text: "Is Checked" },
      { item_id: "isnotchecked", item_text: "Is Not Checked" },
    ];
  }

  displayedColumns: string[] = [
    "group",
    "andOr",
    "formQuestionnaire",
    "operator",
    "value",
  ];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  toppingList: string[] = ["Form", "Questionarie"];

  getFindingRuleResult() {
    this.programAdministrationService
      .getFindingRuleResult(1565, "EarlyOn", 8311)
      .subscribe((res: any) => {
        if (res != null) {
          this.findingRuleResult = res;
          console.log({ findingRuleResult: this.findingRuleResult });
          this.findingsRulesForm.controls["name"].setValue(
            this.findingRuleResult[0].name
          );
        }
      });
    if (this.isRuleEdit === true) {
      this.findingsRulesForm.enable();
    } else {
      this.findingsRulesForm.disable();
    }
  }

  loadAllQuestionnaireFields() {
    this.programAdministrationService
      .getAllQuestionnaireFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.dataSourceQuestionnaireFields = res;
          console.log({
            dataSourceQuestionnaireFields: this.dataSourceQuestionnaireFields,
          });
        }
      });
  }

  loadFlexFormPDFTemplateFields() {
    this.programAdministrationService
      .getFlexFormPDFTemplateFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.dataSourceFormFields = res;
          this._arrFieldList =
            this.dataSourceFormFields[0].flexFormPdftemplateFields;
          console.log({ dataSourceFormFields: this._arrFieldList });
        }
      });
  }

  getFindingsRulesList() {
    this.programAdministrationService
      .getFindingsRulesList(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.findingsRulesList = res;
          if (this.findingsRulesList.length > 0)
            this.selectedRule = this.findingsRulesList[0].findingRuleId;
          this.onRuleSelection();

          console.log({ findingsRulesList: this.findingsRulesList });
        }
      });
  }

  getFindingARC() {
    this.programAdministrationService
      .getFindingRuleArcData(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.dataSourceFindingARC = res;
          this.dataSourceFindingARC.forEach(
            (group: {
              cfaXrefs: any[];
              cit: {
                cfaRefId: any;
                cfaDesc: any;
              };
              find: {
                cfaRefId: any;
                cfaDesc: any;
              };
            }) => {
              group.cfaXrefs.forEach((cfaXrefs) => {
                this._arrFindingArc.push({
                  citId: group.cit.cfaRefId,
                  citation: group.cit.cfaDesc,
                  // findId: group.find.cfaRefId,
                  // finding: group.find.cfaDesc,
                  // arcId: cfaXrefs.arc.cfaRefId,
                  // ARC: cfaXrefs.arc.cfaDesc,
                });
              });
            }
          );
          console.log("arrayFindingData:", this._arrFindingArc);
        }
      });
  }

  addNewRuleSetup(){
    //let newRule:any=[];
    //this.dataSource = new MatTableDataSource(newRule);
    //this.findingRuleResultData =[];
    this.isRuleEdit = !this.isRuleEdit;
    this.isRuleEdit === true
      ? this.findingsRulesForm.enable()
      : this.findingsRulesForm.disable();
  }
  onfindingsRulesFormSubmit() {
    this.addFindingRuleForm = {
      findingRuleName: this.findingsRulesForm.controls.name.value,
      recStat: this.findingsRulesForm.controls.activeInActive.value,
    };
    console.log(this.addFindingRuleForm);
  }

  editFindingRuleList() {
    this.isRuleEdit = !this.isRuleEdit;
    this.isRuleEdit === true
      ? this.findingsRulesForm.enable()
      : this.findingsRulesForm.disable();
    this.findingsRulesForm.controls["name"].setValue(this.selectedRuleName);
    this.isGetSelectedRule = false;
  }

  cancelFindingRuleList() {
    this.isRuleEdit = !this.isRuleEdit;
  }

  onChangeRule(e: any) {
    this.isGetNewRule = true;
    this.isGetSelectedRule = true;
    this.selectedRule = e.value;
    this.isGetSelectedRule = true;
    this.onRuleSelection();
  }

  onRuleSelection() {
    let newRule:any=[];
    this.dataSource = new MatTableDataSource(newRule);
    this.findingRuleResultData = [];
    // this._arrfindingsRulesListData = this.findingsRulesList.find(
    //   (x: { findingRuleId: any }) => x.findingRuleId === +this.selectedRule
    // );
    this.programAdministrationService
      .getFindingRuleResult(1565, "EarlyOn", 8311)
      .subscribe((res: any) => {
        if (res != null) {
          //this.findingRuleResultData = res;
          this._arrfindingRuleResultData = res;
          this._arrfindingRuleResultData.find(
            (x: { findingRuleId: any }) => {
              if(x.findingRuleId === +this.selectedRule){
                this.findingRuleResultData.push(x)
              }
            });
          console.log(this.findingRuleResultData);
          //this.selectedRuleName = this.findingRuleResultData[0].name;
          var _arrArrayList = [];
          _arrArrayList.push(this.findingRuleResultData[0].findingRuleCriteria);
          this.dataSource = new MatTableDataSource(_arrArrayList);
          _arrArrayList.map((criteria:any)=>{
            this.formQuestMethod(criteria.sourceType,criteria);      
            this.getFieldMethod(criteria.sourceType,criteria.flexFormPdftemplateId,criteria);
            this.getOperator(criteria.sourceType,criteria);
            this.formTextQuestMethod(criteria.valueType,criteria);
            this.getValueFieldMethod(criteria.valueType,criteria.flexFormPdftemplateIdValue,criteria);
          });
          this.isGetCitationData = true;
          this.findingRuleResultData.forEach((findingsData) => {
            this.getFindingRuleArcData = {
              citId: findingsData.cfXref.cit.cfaRefId,
              findId: findingsData.cfXref.find.cfaRefId,
              arcId: findingsData.cfXref.cfaXrefs[0].arc.cfaRefId,
              citation: findingsData.cfXref.cit.cfaDesc,
              findings: findingsData.cfXref.find.cfaDesc,
              ARC: findingsData.cfXref.cfaXrefs[0].arc.cfaDesc,
              cfXrefId: findingsData.cfaRefId,
              checked: true,
            };
          });
        }
      })
       
          //this.dataSource = [...this.dataSource];
     
            // this.andOr = this.findingRuleResultData[0].findingRuleCriteria.andOr;
            // this.sourceType = this.findingRuleResultData[0].findingRuleCriteria.sourceType;
            // this.valueType = this.findingRuleResultData[0].findingRuleCriteria.valueType;
            // this.selectedRuleName = this.findingRuleResultData[0].name;
            // this.updateFindingRuleForm.controls["andOr"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria.andOr
            // );
            // this.updateFindingRuleForm.controls["sourceType"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria.sourceType
            // );
            // this.updateFindingRuleForm.controls["flexFormPdftemplateId"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria.flexFormPdftemplateId
            // );
            // this.updateFindingRuleForm.controls["questionnaireId"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria.questionnaireId
            // );
            // this.updateFindingRuleForm.controls["flexFormPdftemplateFieldId"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria.flexFormPdftemplateFieldId
            // );
            // this.updateFindingRuleForm.controls["questionnaireFieldId"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria
            //     .questionnaireFieldId
            // );
            // this.updateFindingRuleForm.controls["operator"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria.operator
            // );
            // this.updateFindingRuleForm.controls["valueType"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria.valueType
            // );
            // this.updateFindingRuleForm.controls["flexFormPdftemplateIdValue"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria
            //     .flexFormPdftemplateIdValue
            // );
            // this.updateFindingRuleForm.controls["questionnaireIdValue"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria
            //     .questionnaireIdValue
            // );
            // this.updateFindingRuleForm.controls["flexFormPdftemplateFieldIdValue"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria
            //     .flexFormPdftemplateFieldIdValue
            // );
            // this.updateFindingRuleForm.controls["questionnaireFieldIdValue"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria
            //     .questionnaireFieldIdValue
            // );
            // this.updateFindingRuleForm.controls["valueText"].setValue(
            //   this.findingRuleResultData[0].findingRuleCriteria
            //     .valueText
            // );
        
            // if (
            //   this.findingRuleResultData[0].findingRuleCriteria.sourceType ==
            //   "FORM"
            // ) {
            //   this.loadFlexTemplateFields(
            //     this.findingRuleResultData[0].findingRuleCriteria
            //       .flexFormPdftemplate.flexFormPdftemplateId
            //   );
            //   var _arrSelectedFieldName: any = [];
            //   this.fieldListData.forEach((eachData: { flexFormPdftemplateFields: any[] }) => {
            //       eachData.flexFormPdftemplateFields.forEach((fieldData) => {
            //         if (fieldData.flexFormPdftemplateFieldId == this.findingRuleResultData[0].findingRuleCriteria.questionnaireId)
            //          {
            //           this.getOperatorData = fieldData.fieldType;
            //           console.log("test-data", _arrSelectedFieldName);
            //         }
            //       });
            //     }
            //   );
            // }
            //else (this.findingRuleResultData[0].findingRuleCriteria.sourceType == 'QUESTIONNAIRE')
            // else {
            //   this.loadQuestionnaireFields(
            //     this.findingRuleResultData[0].findingRuleCriteria.questionnaireId
            //   );
            //   this.fieldListData.forEach(
            //     (eachData: {
            //       fieldName: any;
            //       fieldType: string;
            //       questionnaireFieldId: any;
            //     }) => {
            //       if (
            //         eachData.questionnaireFieldId ==
            //         this.findingRuleResultData[0].findingRuleCriteria
            //           .questionnaireFieldId
            //       ) {
            //         this.getOperatorData = eachData.fieldType;
            //         console.log("test-data", this.getOperatorData);
            //       }
            //     }
            //   );
            // }
        
            // if (
            //   this.findingRuleResultData[0].findingRuleCriteria.valueType ==
            //   "FORM"
            // ) {
            //   this.loadFlexTemplateValueFields(
            //     this.findingRuleResultData[0].findingRuleCriteria
            //       .flexFormPdftemplateIdValue
            //   );
            // }
            // //else (this.findingRuleResultData[0].findingRuleCriteria.valueType == 'QUESTIONNAIRE')
            // else {
            //   this.loadQuestionnaireValueFields(
            //     this.findingRuleResultData[0].findingRuleCriteria
            //       .questionnaireIdValue
            //   );
            // }
        
        //     switch (this.getOperatorData) {
        //       case "TextBoxField":
        //         console.log("TextBoxField");
        //         this.operatorList = this.operatorTextBoxList;
        //         break;
        //       case "CheckboxField":
        //         console.log("CheckboxField");
        //         this.operatorList = this.operatorCheckBoxList;
        //         break;
        //       case "checkbox":
        //         console.log("checkbox");
        //         this.operatorList = this.operatorCheckBoxList;
        //         break;
        //       default:
        //         console.log("All");
        //         this.operatorList = this.operatorDataList;
        //         break;
        //     }
        //   this.getFindingARC();
         
        // }
        console.log({ findingsRulesList: this.getFindingRuleArcData });
      // });
       
  }

  loadFindingDataInForm(){
    if (this.findingRuleResultData[0].recStat == "A") {
      this.isChecked = true;
      this.updateFindingRuleForm.controls["groupId"].setValue(
        this.isChecked
      );
    } else {
      this.isChecked = false;
    }
    this.andOr = this.findingRuleResultData[0].andOr;
    this.sourceType = this.findingRuleResultData[0].sourceType;
    this.valueType = this.findingRuleResultData[0].valueType;
    this.selectedRuleName = this.findingRuleResultData[0].name;
    this.updateFindingRuleForm.controls["andOr"].setValue(
      this.findingRuleResultData[0].andOr
    );
    this.updateFindingRuleForm.controls["sourceType"].setValue(
      this.findingRuleResultData[0].sourceType
    );
    this.updateFindingRuleForm.controls["flexFormPdftemplateId"].setValue(
      this.findingRuleResultData[0].flexFormPdftemplateId
    );
    this.updateFindingRuleForm.controls["questionnaireId"].setValue(
      this.findingRuleResultData[0].questionnaireId
    );
    this.updateFindingRuleForm.controls["flexFormPdftemplateFieldId"].setValue(
      this.findingRuleResultData[0].flexFormPdftemplateFieldId
    );
    this.updateFindingRuleForm.controls["questionnaireFieldId"].setValue(
      this.findingRuleResultData[0]
        .questionnaireFieldId
    );
    this.updateFindingRuleForm.controls["operator"].setValue(
      this.findingRuleResultData[0].operator
    );
    this.updateFindingRuleForm.controls["valueType"].setValue(
      this.findingRuleResultData[0].valueType
    );
    this.updateFindingRuleForm.controls["flexFormPdftemplateIdValue"].setValue(
      this.findingRuleResultData[0]
        .flexFormPdftemplateIdValue
    );
    this.updateFindingRuleForm.controls["questionnaireIdValue"].setValue(
      this.findingRuleResultData[0]
        .questionnaireIdValue
    );
    this.updateFindingRuleForm.controls["flexFormPdftemplateFieldIdValue"].setValue(
      this.findingRuleResultData[0]
        .flexFormPdftemplateFieldIdValue
    );
    this.updateFindingRuleForm.controls["questionnaireFieldIdValue"].setValue(
      this.findingRuleResultData[0]
        .questionnaireFieldIdValue
    );
    this.updateFindingRuleForm.controls["valueText"].setValue(
      this.findingRuleResultData[0]
        .valueText
    );

    if (
      this.findingRuleResultData[0].sourceType ==
      "FORM"
    ) {
      this.loadFlexTemplateFields(
        this.findingRuleResultData[0].flexFormPdftemplateId
      );
      var _arrSelectedFieldName: any = [];
      this.fieldListData.forEach((eachData: { flexFormPdftemplateFields: any[] }) => {
          eachData.flexFormPdftemplateFields.forEach((fieldData) => {
            if (fieldData.flexFormPdftemplateFieldId == this.findingRuleResultData[0].questionnaireId)
             {
              this.getOperatorData = fieldData.fieldType;
              console.log("test-data", _arrSelectedFieldName);
            }
          });
        }
      );
    }
    //else (this.findingRuleResultData[0].findingRuleCriteria.sourceType == 'QUESTIONNAIRE')
    else {
      this.loadQuestionnaireFields(
        this.findingRuleResultData[0].questionnaireId
      );
      this.fieldListData.forEach(
        (eachData: {
          fieldName: any;
          fieldType: string;
          questionnaireFieldId: any;
        }) => {
          if (
            eachData.questionnaireFieldId ==
            this.findingRuleResultData[0]
              .questionnaireFieldId
          ) {
            this.getOperatorData = eachData.fieldType;
            console.log("test-data", this.getOperatorData);
          }
        }
      );
    }

    if (
      this.findingRuleResultData[0].valueType ==
      "FORM"
    ) {
      this.loadFlexTemplateValueFields(
        this.findingRuleResultData[0]
          .flexFormPdftemplateIdValue
      );
    }
    //else (this.findingRuleResultData[0].findingRuleCriteria.valueType == 'QUESTIONNAIRE')
    else {
      this.loadQuestionnaireValueFields(
        this.findingRuleResultData[0]
          .questionnaireIdValue
      );
    }

    switch (this.getOperatorData) {
      case "TextBoxField":
        console.log("TextBoxField");
        this.operatorList = this.operatorTextBoxList;
        break;
      case "CheckboxField":
        console.log("CheckboxField");
        this.operatorList = this.operatorCheckBoxList;
        break;
      case "checkbox":
        console.log("checkbox");
        this.operatorList = this.operatorCheckBoxList;
        break;
      default:
        console.log("All");
        this.operatorList = this.operatorDataList;
        break;
    }
  }

  editFindingRules() {
    this.isFindingRuleEdit = !this.isFindingRuleEdit;
    this.isFindingRuleEdit === true
      ? this.updateFindingRuleForm.enable()
      : this.updateFindingRuleForm.disable();
  }

  cancelFindingRules() {
    this.isFindingRuleEdit = !this.isFindingRuleEdit;
  }

  getFlexFormPDFTemplateFields() {
    this.programAdministrationService
      .getFlexFormPDFTemplateFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getFormData = res;
          this.selectedList = this.getFormData;
          this._arrSelectedFormList = [];
          this.selectedList.forEach(
            (eachData: { flexFormPdftemplateId: any; name: any }) => {
              if (eachData) {
                this._arrSelectedFormList.push({
                  id: eachData.flexFormPdftemplateId,
                  name: eachData.name,
                });
                console.log("test-data", this._arrSelectedFormList);
                // this.updateFindingRuleForm.controls["flexFormPdftemplateId"].setValue(
                //   this._arrSelectedFormList[0].id
                // );
              }
            }
          );
          //let testdata = this.getFormData[0].flexFormPdftemplateFields[0];
          console.log({ getFormData: this.getFormData });
          //console.log(testdata);
        }
      });
  }

  getFlexFormPDFTemplateValueFields() {
    this.programAdministrationService
      .getFlexFormPDFTemplateFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getFormData = res;
          this.selectedValueList = this.getFormData;
          this._arrSelectedValueFormList = [];
          this.selectedValueList.forEach(
            (eachData: { flexFormPdftemplateId: any; name: any }) => {
              if (eachData) {
                this._arrSelectedValueFormList.push({
                  id: eachData.flexFormPdftemplateId,
                  name: eachData.name,
                });
                console.log("test-data", this._arrSelectedValueFormList);
                // this.updateFindingRuleForm.controls["flexFormPdftemplateIdValue"].setValue(
                //   this._arrSelectedValueFormList[0].id
                // );
              }
            }
          );
          //let testdata = this.getFormData[0].flexFormPdftemplateFields[0];
          console.log({ getFormData: this.getFormData });
          //console.log(testdata);
        }
      });
  }

  getAllQuestionnaireFields() {
    this.programAdministrationService
      .getAllQuestionnaireFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getquestionarieData = res;
          this.selectedList = this.getquestionarieData;
          this._arrSelectedQuestList = [];
          this.selectedList.forEach(
            (eachData: { questionnaireId: any; questionnaireName: any }) => {
              if (eachData) {
                this._arrSelectedQuestList.push({
                  id: eachData.questionnaireId,
                  name: eachData.questionnaireName,
                });
                console.log("test-data", this._arrSelectedQuestList);
                // this.updateFindingRuleForm.controls["questionnaireId"].setValue(
                //   this._arrSelectedQuestList[0].id
                // );
              }
            }
          );
          console.log({ getquestionarieData: this.getquestionarieData });
        }
      });
  }

  getAllQuestionnaireValueFields() {
    this.programAdministrationService
      .getAllQuestionnaireFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getquestionarieData = res;
          this.selectedValueList = this.getquestionarieData;
          this._arrSelectedValueQuestList = [];
          this.selectedValueList.forEach(
            (eachData: { questionnaireId: any; questionnaireName: any }) => {
              if (eachData) {
                this._arrSelectedValueQuestList.push({
                  id: eachData.questionnaireId,
                  name: eachData.questionnaireName,
                });
                console.log("test-data", this._arrSelectedValueQuestList);
                // this.updateFindingRuleForm.controls["questionnaireIdValue"].setValue(
                //   this._arrSelectedValueQuestList[0].id
                // );
              }
            }
          );
          console.log({ getquestionarieData: this.getquestionarieData });
        }
      });
  }

  formQuestMethod(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    this.selectedFormQuest = element.formQuestionnaire = value;
    console.log("selected Form2", this.selectedFormQuest);
    if (value == "FORM") {
      console.log("selected Form");
      this.disableFormQuestData = false;
      this.sourceType = "FORM";
      this.getFlexFormPDFTemplateFields();
    } else {
      console.log("selected Questionarie");
      this.disableFormQuestData = false;
      this.sourceType = "QUESTIONNAIRE";
      this.getAllQuestionnaireFields();
    }
  }

  formTextQuestMethod(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    this.selectedFormTextQuest = element.value = value;
    console.log("selected Form2", this.selectedFormTextQuest);
    if (value == "TEXT") {
      this.isTextBox = true;
      this.valueType = "TEXT";
    } else if (value == "FORM") {
      console.log("selected Form");
      this.disableFormTextQuestData = false;
      this.valueType = "FORM";
      this.getFlexFormPDFTemplateValueFields();
      this.isTextBox = false;
    } else {
      console.log("selected Questionarie");
      this.disableFormTextQuestData = false;
      this.valueType = "QUESTIONNAIRE";
      this.getAllQuestionnaireValueFields();
      this.isTextBox = false;
    }
  }

  getFieldMethod(sourceType: any, value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    if (this.selectedFormQuest == "FORM" || sourceType == "FORM")
    {
      this.sourceType = "FORM";
      this.loadFlexTemplateFields(value);
      this.disableFieldData = false;
    } else {
      console.log("selected Questionarie");
      this.sourceType = "QUESTIONNAIRE";
      this.loadQuestionnaireFields(value);
      this.disableFieldData = false;
    }
  }

  getValueFieldMethod(valueType: any, value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);

    
    if (valueType == "FORM") {
      this.valueType = "FORM";
      this.loadFlexTemplateValueFields(value);
      this.disableFieldTextData = false;
    } else {
      console.log("selected Questionarie");
      this.valueType = "QUESTIONNAIRE";
      this.loadQuestionnaireValueFields(value);
      this.disableFieldTextData = false;
    }
  }

  loadFlexTemplateFields(code: any) {
    this.programAdministrationService
      .getFlexFormPDFTemplateFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getFormData = res;
          this.fieldListData = this.getFormData;
          console.log("data:", this.fieldListData);
          var _arrSelectedFieldName: any = [];
          this.fieldListData.forEach((eachData: { flexFormPdftemplateFields: any[] }) => {
              eachData.flexFormPdftemplateFields.forEach((fieldData) => {
                if (fieldData.flexFormPdftemplateId == code) {
                  _arrSelectedFieldName.push({
                    fieldName: fieldData.name,
                    id: fieldData.flexFormPdftemplateFieldId,
                  });
                  console.log("test-data", _arrSelectedFieldName);
                }
              });
            }
          );
          this.fieldListData = _arrSelectedFieldName;
          // this.updateFindingRuleForm.controls["flexFormPdftemplateFieldId"].setValue(
          //   this.fieldListData[0].id
          // );
          console.log("testdata", this.fieldListData);
        }
      });
  }

  loadQuestionnaireFields(code: any) {
    this.programAdministrationService
      .getAllQuestionnaireFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getquestionarieData = res;
          this.fieldListQuesData = this.getquestionarieData;
          var _arrSelectedFieldName: { fieldName: any; id: any }[] = [];
          this.fieldListQuesData.forEach(
            (eachData: {
              questionnaireId: any;
              fieldName: any;
              questionnaireFieldId: any;
            }) => {
              if (eachData.questionnaireId == code) {
                _arrSelectedFieldName.push({
                  fieldName: eachData.fieldName,
                  id: eachData.questionnaireFieldId,
                });
                console.log("test-data", _arrSelectedFieldName);
              }
            }
          );
          this.fieldListQuesData = _arrSelectedFieldName;
          // this.updateFindingRuleForm.controls["questionnaireFieldId"].setValue(
          //   this.fieldListData[0].id
          // );
          console.log("testdata", this.fieldListQuesData);
        }
      });
  }

  loadFlexTemplateValueFields(code: any) {
    this.programAdministrationService
      .getFlexFormPDFTemplateFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getFormData = res;
          this.fieldValueListData = this.getFormData;
          console.log("data:", this.fieldValueListData);
          var _arrSelectedFieldName: { fieldName: any; id: any }[] = [];
          this.fieldValueListData.forEach(
            (eachData: { flexFormPdftemplateFields: any[] }) => {
              eachData.flexFormPdftemplateFields.forEach((fieldData) => {
                if (fieldData.flexFormPdftemplateId == code) {
                  _arrSelectedFieldName.push({
                    fieldName: fieldData.name,
                    id: fieldData.flexFormPdftemplateFieldId,
                  });
                  console.log("test-data", _arrSelectedFieldName);
                }
              });
            }
          );
          this.fieldValueListData = _arrSelectedFieldName;
          // this.updateFindingRuleForm.controls["flexFormPdftemplateFieldIdValue"].setValue(
          //   this.fieldValueListData[0].id
          // );
          console.log("testdata", this.fieldListData);
        }
      });
  }

  loadQuestionnaireValueFields(code: any) {
    this.programAdministrationService
      .getAllQuestionnaireFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getquestionarieData = res;
          this.fieldValueListData = this.getquestionarieData;
          var _arrSelectedFieldName: { fieldName: any; id: any }[] = [];
          this.fieldValueListData.forEach(
            (eachData: {
              questionnaireId: any;
              fieldName: any;
              questionnaireFieldId: any;
            }) => {
              if (eachData.questionnaireId == code) {
                _arrSelectedFieldName.push({
                  fieldName: eachData.fieldName,
                  id: eachData.questionnaireFieldId,
                });
                console.log("test-data", _arrSelectedFieldName);
              }
            }
          );
          this.fieldValueListData = _arrSelectedFieldName;
          // this.updateFindingRuleForm.controls["questionnaireFieldIdValue"].setValue(
          //   this.fieldValueListData[0].id
          // );
          console.log("testdata", this.fieldListData);
        }
      });
  }

  loadFlexFormOperator(code: any) {
    this.programAdministrationService
      .getFlexFormPDFTemplateFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getFormData = res;
          this.operatorList = this.getFormData;
          var _arrSelectedOperator = [];
          this.operatorList.forEach(
            (eachData: { flexFormPdftemplateFields: any[] }) => {
              //console.log(eachData.addEmployee.firstName);
              eachData.flexFormPdftemplateFields.forEach((fieldData) => {
                if (fieldData.flexFormPdftemplateFieldId == code) {
                  //_arrSelectedFieldName.push(fieldData.name);
                  //_arrSelectedOperator.push({'fieldType' : fieldData.fieldType});
                  this.getOperatorData = fieldData.fieldType;
                  console.log("test-data", this.getOperatorData);
                }
              });
            }
          );
          switch (this.getOperatorData) {
            case "TextBoxField":
              console.log("TextBoxField");
              this.operatorList = this.operatorTextBoxList;
              break;
            case "CheckboxField":
              console.log("CheckboxField");
              this.operatorList = this.operatorCheckBoxList;
              break;
            case "checkbox":
              console.log("checkbox");
              this.operatorList = this.operatorCheckBoxList;
              break;
            default:
              console.log("All");
              this.operatorList = this.operatorDataList;
              break;
          }
          //  this.operatorList = _arrSelectedOperator;
          // this.updateFindingRuleForm.controls["operator"].setValue(
          //   this.operatorList[0].item_id
          // );
        }
      });
  }

  loadQuestionnaireOperator(code: any) {
    this.programAdministrationService
      .getAllQuestionnaireFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getquestionarieData = res;
          this.operatorList = this.getquestionarieData;
          var _arrSelectedOperator = [];
          this.operatorList.forEach(
            (eachData: {
              fieldName: any;
              fieldType: string;
              questionnaireFieldId: any;
            }) => {
              //console.log(eachData.addEmployee.firstName);
              if (eachData.questionnaireFieldId == code) {
                this.getOperatorData = eachData.fieldType;
                console.log("test-data", this.getOperatorData);
              }
            }
          );
          switch (this.getOperatorData) {
            case "TextBoxField":
              console.log("TextBoxList");
              this.operatorList = this.operatorTextBoxList;
              break;
            case "CheckboxField":
              console.log("CheckboxField");
              this.operatorList = this.operatorCheckBoxList;
              break;
            case "checkbox":
              console.log("checkbox");
              this.operatorList = this.operatorCheckBoxList;
              break;
            default:
              console.log("All");
              this.operatorList = this.operatorDataList;
              break;
          }
          //  this.operatorList = _arrSelectedOperator;
          // this.updateFindingRuleForm.controls["operator"].setValue(
          //   this.operatorList[0].item_id
          // );
        }
      });
  }

  getOperator(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    if (
      this.selectedFormQuest == "FORM" ||
      this.findingRuleResultData[0].findingRuleCriteria.sourceType == "FORM"
    ) {
      this.loadFlexFormOperator(value);
      this.disableOperatorData = false;
    } else {
      console.log("selected Questionarie");
      this.loadQuestionnaireOperator(value);
      this.disableOperatorData = false;
    }
  }

  addNewRule() {}

  openAddRule(element: any): void {
    const dialogRef = this.dialog.open(FindingRuleAddDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      minHeight: "60%",
      width: "80%",
      //panelClass: "full-screen-modal",
      panelClass: [
        "full-screen-modal",
        "animate__animated",
        "animate__slideInRight",
      ],
      autoFocus: false,
      disableClose: true,
      data: {
        //data: data,
        tableList: element,
        findingRuleListSet: this._arrfindingsRulesListData,
        andOr: this.findingRuleResultData.length>0? true:false,
        // dataSourceUsers: this.dataSourceUsers,
        // areaOfResponsbilityList: this.areaOfResponsbilityList,
        // consolReviewResponsbilityList: this.consolReviewResponsbilityList,
        // assignedContactNameLists: this.assignedContactNameLists,
        // dataSourceAddUser: this.dataSourceAddUser,
      },
    });
    dialogRef.componentInstance.emitService.subscribe((emmitedValue) => {
      console.log(emmitedValue);
    });
    dialogRef.afterClosed().subscribe((data) => {
      console.log(`Dialog result: ${data}`);
      if (data.result) {
        if (this.dataSource) {
          this.dataSource.data.unshift(data.result);
          console.log("final JSon:" +this.dataSource.data )
          var _arrArrayList = [];
          _arrArrayList.push(data.result);
          _arrArrayList.map((criteria:any)=>{
            // this.formQuestMethod(criteria.sourceType,criteria);      
            // this.getFieldMethod(criteria.sourceType,criteria.flexFormPdftemplateId,criteria);
            // this.getOperator(criteria.sourceType,criteria);
            // this.formTextQuestMethod(criteria.valueType,criteria);
            // this.getValueFieldMethod(criteria.valueType,criteria.flexFormPdftemplateIdValue,criteria);
          });
        } else {
          let temp = [];
          temp.unshift(data.result);
          this.dataSource = new MatTableDataSource(temp);
        }
        console.log(this.dataSource.data);
        console.log(data.result);
        this.dataSource._updateChangeSubscription();
        this.cd.markForCheck(); //or  cd.detectChanges();
      }
      
    });
  }

  openAddFinding(element: any): void {
    let data = {
      citation: "",
      findings: "",
      ARC: "",
    };
    data.citation = this.citationValue;
    data.findings = this.findingValue;
    data.ARC = this.arcValue;

    const dialogRef = this.dialog.open(FindingsAddDialogComponent, {
      maxWidth: "100vw",
      maxHeight: "100vh",
      minHeight: "70%",
      width: "80%",
      //panelClass: "full-screen-modal",
      panelClass: [
        "full-screen-modal",
        "animate__animated",
        "animate__slideInRight",
      ],
      autoFocus: false,
      disableClose: true,
      data: {
        data: data,
        loadFindingRuleArcData: this.getFindingRuleArcData,
        // dataSourceUsers: this.dataSourceUsers,
        // areaOfResponsbilityList: this.areaOfResponsbilityList,
        // consolReviewResponsbilityList: this.consolReviewResponsbilityList,
        // assignedContactNameLists: this.assignedContactNameLists,
        // dataSourceAddUser: this.dataSourceAddUser,
      },
    });
    dialogRef.componentInstance.emitService.subscribe((emmitedValue) => {
      console.log(emmitedValue);
    });
    dialogRef.afterClosed().subscribe((data) => {
      console.log(`Dialog result: ${data}`);
      this.getFindingRuleArcData = data.result;
      this.isGetCitationData = true;
      this.isGetFindingData = true;
      this.isGetARCData = true;
    });
  }

  private loadFindingRule() {
    this.isLoaded = true;
    this.programAdministrationService
      .getFindingRuleResult(1, "EarlyOn", 1)
      .subscribe({
        next: (data) => {
          this.rules = data;
          this.isLoaded = false;
          this.rules.map((rule: any) => {
            let ruleCriterias = [];
            ruleCriterias = rule.findingRuleCriteria.filter(
              (ruleCriteria: any) => {
                return (ruleCriteria.findingRuleId = rule.findingRuleId);
              }
            );
            rule.findingRuleCriteria = ruleCriterias;
          });
          this.dataSourceRules = new MatTableDataSource(this.rules);
          console.log({ dataSourceRules: this.dataSourceRules });
        },
        error: (err) => {
          alert(`Error ${err}!`);
          this.isLoaded = false;
        },
      });
  }

  refresh() {
    this.doSomething().subscribe((data: FindingRule[]) => {
      this.dataSource.data = data;
    });
  }

  onSubmit() {
    console.log(this.updateFindingRuleForm.value);

    // if (this.updateFindingRuleForm.controls.groupId.value == true) {
    //   var getIsChecked = "A";
    // } else {
    //   var getIsChecked = "";
    // }
    // //validate form
    // if (this.updateFindingRuleForm.valid) {
    //   this.updateNewFindingRule = {
    //     findingRuleId: this._arrfindingsRulesListData.findingRuleId,
    //     name: this._arrfindingsRulesListData.name,
    //     grantPgmId: this._arrfindingsRulesListData.grantPgmId,
    //     rvwType: this._arrfindingsRulesListData.rvwType,
    //     cfXrefId: 46740,
    //     cfaXrefId: 68938,
    //     createDt: null,
    //     createId: 0,
    //     lastUpdDt: null,
    //     lastUpdId: 0,
    //     recStat: getIsChecked,
    //     findingRuleCriteria: [
    //       {
    //         findingRuleCriteriaId: 0,
    //         findingRuleId: this._arrfindingsRulesListData.findingRuleId,
    //         ordinal: 0,
    //         groupId: 0,
    //         andOr: this.updateFindingRuleForm.controls.andOrList.value,
    //         flexFormPdftemplateId:
    //           this.updateFindingRuleForm.controls.formDataList.value,
    //         flexFormPdftemplateFieldId:
    //           this.updateFindingRuleForm.controls.formFieldData.value,
    //         operator:
    //           this.updateFindingRuleForm.controls.formOperatorData.value,
    //         valueType:
    //           this.updateFindingRuleForm.controls.formQuestValueData.value,
    //         valueText: this.updateFindingRuleForm.controls.textAreaData.value,
    //         flexFormPdftemplateIdValue:
    //           this.updateFindingRuleForm.controls.formTextData.value,
    //         flexFormPdftemplateFieldIdValue:
    //           this.updateFindingRuleForm.controls.formFieldTextData.value,
    //         createDt: null,
    //         createId: 0,
    //         lastUpdDt: null,
    //         lastUpdId: 0,
    //         questionnaireId:
    //           this.updateFindingRuleForm.controls.questDataList.value,
    //         questionnaireFieldId:
    //           this.updateFindingRuleForm.controls.questFieldData.value,
    //         questionnaireIdValue:
    //           this.updateFindingRuleForm.controls.questTextData.value,
    //         questionnaireFieldIdValue:
    //           this.updateFindingRuleForm.controls.questFieldTextData.value,
    //         sourceType: this.updateFindingRuleForm.controls.formQuestName.value,
    //       },
    //     ],
    //   };
    // }
    console.log("_arrGetFindingRulesData :", this.updateNewFindingRule);
  }

  doSomething(): Observable<FindingRule[]> {
    // commonly something like:
    // return this.httpClient.get('https://example.org/rest-api/items/');

    let randomlyFilledList = this.getTenRandomElements();
    return of(randomlyFilledList);
  }

  private getTenRandomElements(): FindingRule[] {
    let result: FindingRule[] = [];

    for (let i = 0; i < 10; i++) {
      let randomInt = Math.floor(Math.random() * (this.findingRuleResultData.length - 1));
      result.push(this.findingRuleResultData[randomInt]);
    }

    return result;
  }
}


