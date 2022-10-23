import { EventEmitter, Inject, ViewChild } from "@angular/core";
import { Component, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import { FindingRule } from "../../../models/finding-rule.model";
import { FlexFormPdftemplateField } from "../../../models/flex-form-pdf-template-field.model";
import { FlexFormPdftemplate } from "../../../models/flex-form-pdf-template.model";
import { VwQuestionnaireFields } from "../../../models/vw-questionnaire-fields.model";
import { FindingsAddDialogComponent } from "../findings-add-dialog/findings-add-dialog.component";

export type group = "left" | "right" | "above" | "below";
export type labelgroup = "before" | "after";
export type labelPosition = "before" | "after";
//import { MatTableDataSource } from "@angular/material";
//import { MatPaginator } from "@angular/material/paginator";

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
  selector: "app-finding-rule-add-dialog",
  templateUrl: "./finding-rule-add-dialog.component.html",
  styleUrls: ["./finding-rule-add-dialog.component.css"],
})
export class FindingRuleAddDialogComponent implements OnInit {
  @Output() emitService = new EventEmitter();

  tooltipgroup: group = "above";
  myLabelgroup: labelgroup = "before";
  myLabelgroup1: labelgroup = "after";
  recStat: boolean = false;
  myLabelPosition1: labelPosition = "after";
  getFormData: FlexFormPdftemplate;
  getquestionarieData: VwQuestionnaireFields;
  selectedList: any = [];
  selectedValueList: any = [];
  fieldList: FlexFormPdftemplateField[];
  fieldListData: any = [];
  questionariesFieldsTemplate: any = [];
  //operatorList: FlexFormPdftemplateField[];
  operatorList: any = [];
  operatorListItem: FlexFormPdftemplateField;
  //fieldList: any = [];
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
  isFormData = true;
  isQuestData = false;
  isFormFieldData = true;
  isQuestFieldData = false;
  isFormOperatorData = true;
  isQuestOperatorData = false;
  isFormValueData = true;
  isQuestValueData = false;
  isFormFieldValueData = true;
  isQuestFieldValueData = false;

  operatorTextBoxList: any = [];
  operatorCheckBoxList: any = [];
  operatorDataList: any = [];
  andOrList: any = [];
  formQuestionnaireList: any = [];
  formTextQuestionnaireList: any = [];
  _arrSelectedValueList: any = [];
  _arrSelectedList: any = [];
  findingRuleResult: any = [];

  getOperatorData: string;
  selectedFormQuest: string;
  selectedFormTextQuest: string;

  addNewFindingRule: any;
  public findingsRulesList: FindingRule[];

  public addFindingRuleForm: FormGroup;
  selectedType: any;
  flexFormPdftemplateList: any=[];

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    public fb: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FindingsAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
 
    
    findingRuleCriteria ={
      "findingRuleCriteriaId": 0,
      "findingRuleId": 0,
      "ordinal": 0,
      "groupId": 0,
      "andOr": "",
      "flexFormPdftemplateId": null,
      "flexFormPdftemplateFieldId": null,
      "operator": null,
      "valueType": null,
      "valueText": null,
      "flexFormPdftemplateIdValue": null,
      "flexFormPdftemplateFieldIdValue": null,
      "createDt": null,
      "createId": 0,
      "lastUpdDt": null,
      "lastUpdId": 0,
      "questionnaireId": null,
      "questionnaireFieldId": null,
      "questionnaireIdValue": null,
      "questionnaireFieldIdValue": null,
      "sourceType": null
  }
  
  ngOnInit(): void {

    this.addFindingRuleForm = this.fb.group({
      groupId: null,
      andOr: null,
      sourceType: null,
      flexFormPdftemplateId: null,
      flexFormPdftemplateFieldId: null,
      questionnaireId:null,
      questionnaireIdValue:null,
      questionnaireFieldIdValue:null,
    //  formFieldData: null,
      //questFieldData: null,
      operator: null,
    //  questOperatorData: null,
      valueType: null,
      flexFormPdftemplateIdValue: null,
      flexFormPdftemplateFieldIdValue: null,
      questTextData: null,
      questionnaireFieldId: null,
      valueText: null,
    });

    this.andOrList = [
      { item_id: "", item_text: "" },
      { item_id: "And", item_text: "And" },
      { item_id: "Or", item_text: "Or" },
    ];

    this.formQuestionnaireList = [
      { item_id: "", item_text: "" },
      { item_id: "FORM", item_text: "Form" },
      { item_id: "QUESTIONNAIRE", item_text: "Questionnaire" },
    ];
    this.formTextQuestionnaireList = [
      { item_id: "", item_text: "" },
      { item_id: "FORM", item_text: "Form" },
      { item_id: "TEXT", item_text: "Text" },
      { item_id: "QUESTIONNAIRE", item_text: "Questionnaire" },
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

    this.getFindingRuleResult();
  
  }

  displayedColumns: string[] = [
    "group",
    "andOr",
    "formQuestionnaire",
    "operator",
    "value",
  ];

  dataSource = new MatTableDataSource(ELEMENT_DATA);

  close() {
    document
      .getElementsByClassName("animate__animated")[0]
      .classList.remove("animate__slideInLeft");
    document
      .getElementsByClassName("animate__animated")[0]
      .classList.add("animate__slideOutRight");
    setTimeout(() => {
      this.dialog.closeAll();
    }, 1000);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getFlexFormPDFTemplateFields() {
    this.programAdministrationService
      .getFlexFormPDFTemplateFields(1565, "EarlyOn")
      .subscribe((res: any) => {
        if (res != null) {
          this.getFormData = res;
          this.selectedList = this.getFormData;
          this.flexFormPdftemplateList = [];
          this.selectedList.forEach(
            (eachData: { flexFormPdftemplateId: any; name: any }) => {
              if (eachData) {
                this.flexFormPdftemplateList.push({
                  id: eachData.flexFormPdftemplateId,
                  name: eachData.name,
                });
                console.log("test-data", this.flexFormPdftemplateList);
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
          this._arrSelectedValueList = [];
          this.selectedValueList.forEach(
            (eachData: { flexFormPdftemplateId: any; name: any }) => {
              if (eachData) {
                this._arrSelectedValueList.push({
                  id: eachData.flexFormPdftemplateId,
                  name: eachData.name,
                });
                console.log("test-data", this._arrSelectedValueList);
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
          this._arrSelectedList = [];
          this.selectedList.forEach(
            (eachData: { questionnaireId: any; questionnaireName: any }) => {
              if (eachData) {
                this._arrSelectedList.push({
                  id: eachData.questionnaireId,
                  name: eachData.questionnaireName,
                });
                console.log("test-data", this._arrSelectedList);
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
          this._arrSelectedValueList = [];
          this.selectedValueList.forEach(
            (eachData: { questionnaireId: any; questionnaireName: any }) => {
              if (eachData) {
                this._arrSelectedValueList.push({
                  id: eachData.questionnaireId,
                  name: eachData.questionnaireName,
                });
                console.log("test-data", this._arrSelectedValueList);
              }
            }
          );
          console.log({ getquestionarieData: this.getquestionarieData });
        }
      });
  }

  selectRuleType(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    this.selectedFormQuest = element.formQuestionnaire = value;
    console.log("selected Form2", this.selectedFormQuest);
    this.selectedType = value;
    if (value == "FORM") {
      console.log("selected Form");
      this.disableFormQuestData = false;
      this.getFlexFormPDFTemplateFields();
      this.addFindingRuleForm.patchValue({
        questionnaireId: null,
        questionnaireFieldId: null
      });
      this.isFormData = true;
      this.isQuestData = false;
      this.isFormFieldData = true;
      this.isQuestFieldData = false;
      this.isFormOperatorData = true;
      this.isQuestOperatorData = false;
    } else {
      console.log("selected Questionarie");
      this.disableFormQuestData = false;
      this.isFormData = false;
      this.isQuestData = true;
      this.isFormFieldData = false;
      this.isQuestFieldData = true;
      this.isFormOperatorData = false;
      this.isQuestOperatorData = true;
      this.getAllQuestionnaireFields();
      this.addFindingRuleForm.patchValue({
        flexFormPdftemplateId: null,
        flexFormPdftemplateFieldId: null
      });
    }
  }

  formTextQuestMethod(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    this.selectedFormTextQuest = element.value = value;
    console.log("selected Form2", this.selectedFormTextQuest);
    if (value == "TEXT") {
      this.isTextBox = true;
      this.disableFormTextQuestData = false;
      this.isFormValueData = false;
      this.isQuestValueData = false;
      this.isFormFieldValueData = false;
      this.isQuestFieldValueData = false;
      // var getTextData =
      //   this.addFindingRuleForm.controls.formTextQuestData.value;
      //console.log("selected Form2", getTextData);
    } else if (value == "FORM") {
      console.log("selected Form");
      this.disableFormTextQuestData = false;
      this.getFlexFormPDFTemplateValueFields();
      this.isFormValueData = true;
      this.isQuestValueData = false;
      this.isFormFieldValueData = true;
      this.isQuestFieldValueData = false;
      this.isTextBox = false;
    } else {
      console.log("selected Questionarie");
      this.disableFormTextQuestData = false;
      this.isFormValueData = false;
      this.isQuestValueData = true;
      this.isFormFieldValueData = false;
      this.isQuestFieldValueData = true;
      this.getAllQuestionnaireValueFields();
      this.isTextBox = false;
    }
  }

  getFieldMethod(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    if (this.selectedFormQuest == "FORM") {
      this.loadFlexTemplateFields(value);
      this.disableFieldData = false;
    } else {
      console.log("selected Questionarie");
      this.loadQuestionnaireFields(value);
      this.disableFieldData = false;
    }
  }

  getValueFieldMethod(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    if (this.selectedFormTextQuest == "FORM") {
      this.loadFlexTemplateValueFields(value);
      this.disableFieldTextData = false;
    } else {
      console.log("selected Questionarie");
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
          console.log("data:", this.fieldList);
          var _arrSelectedFieldName: any = [];
          this.fieldListData.forEach(
            (eachData: { flexFormPdftemplateFields: any[] }) => {
              eachData.flexFormPdftemplateFields.forEach((fieldData) => {
                if (fieldData.flexFormPdftemplateId == code) {
                  _arrSelectedFieldName.push({
                    fieldName: fieldData.name,
                    id: fieldData.flexFormPdftemplateFieldId
                  });
                  console.log("test-data", _arrSelectedFieldName);
                }
              });
            }
          );
          this.fieldListData = _arrSelectedFieldName;
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
          this.questionariesFieldsTemplate = this.getquestionarieData;
          var _arrSelectedFieldName: { fieldName: any, id: any }[] = [];
          this.questionariesFieldsTemplate.forEach(
            (eachData: { questionnaireId: any; fieldName: any, questionnaireFieldId: any }) => {
              if (eachData.questionnaireId == code) {
                _arrSelectedFieldName.push({ 
                  fieldName: eachData.fieldName, id: eachData.questionnaireFieldId });
                console.log("test-data", _arrSelectedFieldName);
              }
            }
          );
          this.questionariesFieldsTemplate = _arrSelectedFieldName;
          console.log("testdata", this.questionariesFieldsTemplate);
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
          var _arrSelectedFieldName: { fieldName: any, id: any}[] = [];
          this.fieldValueListData.forEach(
            (eachData: { flexFormPdftemplateFields: any[] }) => {
              eachData.flexFormPdftemplateFields.forEach((fieldData) => {
                if (fieldData.flexFormPdftemplateId == code) {
                  _arrSelectedFieldName.push({
                    fieldName: fieldData.name,
                    id: fieldData.flexFormPdftemplateFieldId
                    
                  });
                  console.log("test-data", _arrSelectedFieldName);
                }
              });
            }
          );
          this.fieldValueListData = _arrSelectedFieldName;
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
          var _arrSelectedFieldName: { fieldName: any, id:any }[] = [];
          this.fieldValueListData.forEach(
            (eachData: { questionnaireId: any; fieldName: any, questionnaireFieldId: any }) => {
              if (eachData.questionnaireId == code) {
                _arrSelectedFieldName.push({ fieldName: eachData.fieldName,
                  id: eachData.questionnaireFieldId });
                console.log("test-data", _arrSelectedFieldName);
              }
            }
          );
          this.fieldValueListData = _arrSelectedFieldName;
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
            (eachData: { fieldName: any; fieldType: string, questionnaireFieldId: any }) => {
              //console.log(eachData.addEmployee.firstName);
              if (eachData.questionnaireFieldId == code) {
                //_arrSelectedFieldName.push(fieldData.name);
                //_arrSelectedOperator.push({'fieldType' : fieldData.fieldType});
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
        }
      });
  }

  getOperator(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    if (this.selectedFormQuest == "FORM") {
      this.loadFlexFormOperator(value);
      this.disableOperatorData = false;
    } else {
      console.log("selected Questionarie");
      this.loadQuestionnaireOperator(value);
      this.disableOperatorData = false;
    }
  }

  
  getFindingRuleResult() {
    this.programAdministrationService
      .getFindingRuleResult(1565, "EarlyOn", 8311)
      .subscribe((res: any) => {
        if (res != null) {
          this.findingRuleResult = res;
          // if(this.findingsRulesList.length > 0){
          //   this.disableAndOrList = false;
          //   this.andOrList;
          // }
          console.log({ findingRuleResult: this.findingRuleResult });
          
        }
      });
  }

  public onSubmit() {
    // if (this.addFindingRuleForm.controls.textAreaData.value == null) {
    //   var getFormQuest = this.addFindingRuleForm.controls.formQuest.value;
    //   var getFormQuestData =
    //     this.addFindingRuleForm.controls.formQuestData.value;
    //   if (getFormQuest == "FORM") {
    //     this.getFlexFormPDFTemplateFields();
    //     var code = this.selectedList.find(
    //       (x: { flexFormPdftemplateId: any }) =>
    //         x.flexFormPdftemplateId === getFormQuestData
    //     );
    //     var codeName = code.name;
    //   } else {
    //     this.getAllQuestionnaireFields();
    //     var code = this.selectedList.find(
    //       (x: { questionnaireId: any }) =>
    //         x.questionnaireId === getFormQuestData
    //     );
    //     var codeName = code.questionnaireName;
    //   }
    //   var getFormQuestValue = this.addFindingRuleForm.controls.valueData.value;
    //   var getFormQuestDataValue =
    //     this.addFindingRuleForm.controls.formTextQuestData.value;
    //   if (getFormQuestValue == "FORM") {
    //     this.getFlexFormPDFTemplateValueFields();
    //     var codeValue = this.selectedValueList.find(
    //       (x: { flexFormPdftemplateId: any }) =>
    //         x.flexFormPdftemplateId === getFormQuestDataValue
    //     );
    //     var codeValueName = code.name;
    //   } else {
    //     this.getAllQuestionnaireValueFields();
    //     var codeValue = this.selectedValueList.find(
    //       (x: { questionnaireId: any }) =>
    //         x.questionnaireId === getFormQuestDataValue
    //     );
    //     var codeValueName = codeValue.questionnaireName;
    //   }

     
    // } 
    
    // else {
    //   var getFormQuest = this.addFindingRuleForm.controls.formQuest.value;
    //   var getFormQuestData =
    //     this.addFindingRuleForm.controls.formQuestData.value;
    //   if (getFormQuest == "FORM") {
    //     this.getFlexFormPDFTemplateFields();
    //     var code = this.selectedList.find(
    //       (x: { flexFormPdftemplateId: any }) =>
    //         x.flexFormPdftemplateId === getFormQuestData
    //     );
    //     var codeName = code.name;
    //   } else {
    //     this.getAllQuestionnaireFields();
    //     var code = this.selectedList.find(
    //       (x: { questionnaireId: any }) =>
    //         x.questionnaireId === getFormQuestData
    //     );
    //     var codeName = code.questionnaireName;
    //   }

    //   this.addNewFindingRule = {
    //     isChecked: this.addFindingRuleForm.controls.isChecked.value,
    //     andOrListData: this.addFindingRuleForm.controls.andOrList.value,
    //     formQuest: this.addFindingRuleForm.controls.formQuest.value,
    //     formQuestName: codeName,
    //     fieldData: this.addFindingRuleForm.controls.fieldData.value,
    //     operator: this.addFindingRuleForm.controls.operatorData.value,
    //     formQuestvalue: this.addFindingRuleForm.controls.valueData.value,
    //     formQuestNameValue: null,
    //     fieldValueData: null,
    //     textAreavalue: this.addFindingRuleForm.controls.textAreaData.value,
    //   };
    // }

    //var _arrGetFindingRulesData = [];
    //_arrGetFindingRulesData.push(data);

    
    this.findingRuleCriteria.andOr = this.addFindingRuleForm.controls['andOr'].value;
    this.findingRuleCriteria.sourceType = this.addFindingRuleForm.controls['sourceType'].value;
    this.findingRuleCriteria.flexFormPdftemplateId = this.addFindingRuleForm.controls['flexFormPdftemplateId'].value;
    this.findingRuleCriteria.flexFormPdftemplateFieldId = this.addFindingRuleForm.controls['flexFormPdftemplateFieldId'].value;
    this.findingRuleCriteria.questionnaireId = this.addFindingRuleForm.controls['questionnaireId'].value;
    this.findingRuleCriteria.questionnaireFieldId = this.addFindingRuleForm.controls['questionnaireFieldId'].value;
    this.findingRuleCriteria.operator = this.addFindingRuleForm.controls['operator'].value;

    this.findingRuleCriteria.valueType = this.addFindingRuleForm.controls['valueType'].value;
    this.findingRuleCriteria.valueText = this.addFindingRuleForm.controls['valueText'].value;
    this.findingRuleCriteria.flexFormPdftemplateIdValue = this.addFindingRuleForm.controls['flexFormPdftemplateIdValue'].value;
    this.findingRuleCriteria.flexFormPdftemplateFieldIdValue = this.addFindingRuleForm.controls['flexFormPdftemplateFieldIdValue'].value;
    this.findingRuleCriteria.questionnaireIdValue = this.addFindingRuleForm.controls['questionnaireIdValue'].value;
    this.findingRuleCriteria.questionnaireFieldIdValue = this.addFindingRuleForm.controls['questionnaireFieldIdValue'].value;
    

  //   this.addNewFindingRule = 
   
  //  {
  //         "findingRuleCriteriaId": 0,
  //         "findingRuleId": this.data.findingRuleListSet.findingRuleId,
  //         "ordinal": 0,
  //         "groupId": 0,
  //         "andOr": this.addFindingRuleForm.controls.andOrList.value,
  //         "flexFormPdftemplateId": this.addFindingRuleForm.controls.formDataList.value,
  //         "flexFormPdftemplateFieldId": this.addFindingRuleForm.controls.formFieldData.value,
  //         "operator": this.addFindingRuleForm.controls.formOperatorData.value,
  //         "valueType": this.addFindingRuleForm.controls.formQuestValueData.value,
  //         "valueText": this.addFindingRuleForm.controls.textAreaData.value,
  //         "flexFormPdftemplateIdValue": this.addFindingRuleForm.controls.formTextData.value,
  //         "flexFormPdftemplateFieldIdValue": this.addFindingRuleForm.controls.formFieldTextData.value,
  //         "createDt": null,
  //         "createId": 0,
  //         "lastUpdDt": null,
  //         "lastUpdId": 0,
  //         "questionnaireId": this.addFindingRuleForm.controls.questDataList.value,
  //         "questionnaireFieldId": this.addFindingRuleForm.controls.questFieldData.value,
  //         "questionnaireIdValue": this.addFindingRuleForm.controls.questTextData.value,
  //         "questionnaireFieldIdValue": this.addFindingRuleForm.controls.questFieldTextData.value,
  //         "sourceType": this.addFindingRuleForm.controls.sourceType.value
  //     }
  
    
    console.log("_arrGetFindingRulesData :", this.findingRuleCriteria);
    this.dialogRef.close({ result: this.findingRuleCriteria });
  }

  
}
