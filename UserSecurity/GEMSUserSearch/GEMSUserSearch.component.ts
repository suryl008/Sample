import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PopUpComponent } from 'src/app/shared/PopUp/PopUp.component';

export type labelPosition = "before" | "after";
const ELEMENT_DATA = [
  { name: 'User-1', subrecipient: 'Holt Publich Scholl', systemrole: 'SubRecipient User' },
  { name: 'User-2', subrecipient: 'Holt Publich Scholl', systemrole: 'SubRecipient User' },
  { name: 'User-3', subrecipient: 'Holt Publich Scholl', systemrole: 'SubRecipient User' },
  { name: 'User-4', subrecipient: 'Holt Publich Scholl', systemrole: 'SubRecipient User' },
  { name: 'User-5', subrecipient: 'Holt Publich Scholl', systemrole: 'SubRecipient User' },
];

@Component({
  selector: 'app-gems-user-search',
  templateUrl: './GEMSUserSearch.component.html',
  styleUrls: ['./GEMSUserSearch.component.css', '../UserSecurity.css']
})
export class GEMSUserSearchComponent implements OnInit {

  constructor( private formBuilder : FormBuilder,  public dialog: MatDialog ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  myLabelPosition: labelPosition = "before";
  myLabelPosition1: labelPosition = "after";
  public selectedIndex: number;
  public usersearchForm: FormGroup;
  public userDetailsForm: FormGroup;
  public initialData: any = [];
  public responseData = new MatTableDataSource();
  public subRecipientData = new MatTableDataSource();
  public displayedColumns : any = [];
  public displayedColumnsSubRecipient : any = [];
  public systemRoleDropdownList = [];
  public subRecipientDropdownList = [];
  public searchColumns = [];
  public showSearchPanel: boolean;
  public showSpinner: boolean;
  public showUserDetails :boolean
  public isOpen : boolean = true;
  public isHideSearchUser : boolean = true;
  public isEditMode : boolean = true;
  
  public columnsHeaders = [
    { fieldName: 'name', headerName: 'Name', visible: true },
    { fieldName: 'subrecipient', headerName: 'Sub-Recipient/Agency', visible: true },
    { fieldName: 'systemrole', headerName: 'System Role', visible: true },
    // { fieldName: 'action', headerName : 'Action', visible: true },
  ]

  public newEmptySubRecipientRow = {
    findId: 0,
    findCd: "",
    findSeq: 0,
    findDesc: "",
    findCat: "",
    editAppl: 'N',
    arcAppl: "",
    findCatDesc: "",
    cfXrefId: 0,
    cfXrefSeq: 0,
    arcId: 0,
    arcCd: "",
    arcSeq: 0,
    arcDesc: "",
    arcCat: "",
    editArc: "",
    cfaXrefSeq: 0,
    pcInd: "",
  };

  ngOnInit() {
    this.showSpinner = true;
    this.selectedIndex = 0;
    this.initFormGroup()
    this.columnsHeaderForDataTable();
    this.bindDropdownData();
    this.searchFormData();
    setTimeout(() => {
      this.showSpinner = false;
    }, 2000);
  }

  initFormGroup(){
    this.usersearchForm =  this.formBuilder.group({
      username: [""],
      firstname: [""],
      lastname: [""],
      activeinactive: [""],
      systemrole: [""],
      email: [""],
      subrecipient: [""],
    })
    this.userDetailsForm = this.formBuilder.group({
      loginName: [""],
      firstName: [""],
      lastName: [""],
      emailAddress: [""],
      addressLine1: [""],
      addressLine2: [""],
      city: [""],
      State: [""],
      zip1: [""],
      zip2: [""],
      Fax: [""],
      phone: [""],
      extension: [""],
      displayName: [""],
      title: [""],
      role: [""],
      office: [""],
      menuFlag: [""],
      status: [""],
      foodServiceMenu: [""],
      psaContractUser: [""],
      centUser: [""],
      entityInformation: [""],
      assignAllReview: [""],
      passWordReset: [""],
    });
  }

  bindDropdownData() {
    this.systemRoleDropdownList = [
      { id: 1, itemName: 'India' },
      { id: 2, itemName: 'Singapore' },
      { id: 3, itemName: 'Australia' },
      { id: 4, itemName: 'Canada' },
      { id: 5, itemName: 'South Korea' },
    ];

    this.subRecipientDropdownList = [
      { id: 6, itemName: 'Germany' },
      { id: 7, itemName: 'France' },
      { id: 8, itemName: 'Russia' },
      { id: 9, itemName: 'Italy' },
      { id: 10, itemName: 'Sweden' }
    ];
  }

  searchFormData() {
    this.searchColumns = [
      { formName: 'username', searchColumnName: 'User Name(Include MEIS ID, MEIS UserName, MILogin Id', type: 'autocomplete', visible: true },
      { formName: 'firstname', searchColumnName: 'First Name', type: 'textbox', visible: true },
      { formName: 'lastname', searchColumnName: 'Last Name', type: 'textbox', visible: true },
      { formName: 'activeinactive', searchColumnName: 'Status', type: 'radioButton', visible: true },
      { formName: 'systemrole', searchColumnName: 'System Role', type: 'dropdown', visible: true, isMultiSelect: true, dropdownList: this.systemRoleDropdownList },
      { formName: 'email', searchColumnName: 'Email', type: 'textbox', visible: true },
      { formName: 'subrecipient', searchColumnName: 'Sub-Recipient/Entity', type: 'dropdown', visible: true, isMultiSelect: true, dropdownList: this.subRecipientDropdownList },
    ]
  }

  ngAfterViewInit() {
    this.responseData.paginator = this.paginator;
  }

  columnsHeaderForDataTable() {
    // User Serach Table
    this.columnsHeaders.forEach(element => {
      this.displayedColumns.push(element.fieldName);
    })
    this.displayedColumns.push('Action');

    // Sub Recipient Table
    this.displayedColumnsSubRecipient= [
      "subRecipient",
      "primary",
      "delete",
    ];
  }

  filterUserSearchData() {
    this.showSpinner = true;
    this.showUserDetails = false;
    this.initialData = ELEMENT_DATA;
    this.responseData = new MatTableDataSource(ELEMENT_DATA);
    setTimeout(() => this.responseData.paginator = this.paginator);
    this.showSpinner = false;
  }

  checkUndefinedOrNull(data: any) {
    return data != null && data != undefined ? data.toString().trim() ? true : false : false;
  }

  clearUserFilterData() {
    this.showSpinner = true;
    this.showUserDetails = false;
    this.searchColumns.forEach(element =>{
      this.usersearchForm.controls[element.formName].setValue(null)
    })
    this.responseData = new MatTableDataSource([]);
    setTimeout(() => this.responseData.paginator = this.paginator);
    setTimeout(() => {
      this.showSpinner = false;
    }, 1000);
  }

  bindUserDetails(){
    this.showSpinner = true;
    this.isEditMode = true; 
    this.isHideSearchUser = false;
    this.showUserDetails = true;
    this.showSpinner = false;
    window.scrollTo(0,0);
  }

  addNewSubRecipientRow() {
    this.isOpen = true;
    let temp = [];
    let temp1 = [];
    temp.push(this.newEmptySubRecipientRow);
    if (this.subRecipientData?.filteredData?.length == undefined || this.subRecipientData?.filteredData?.length == 0) {
      this.subRecipientData = new MatTableDataSource(temp);
      setTimeout(() => this.subRecipientData.paginator = this.paginator);
    }
    else {
      temp1 = temp.concat(this.subRecipientData?.filteredData);
      this.subRecipientData = new MatTableDataSource(temp1);
      this.subRecipientData.paginator = this.paginator;
    }
    this.subRecipientData._updateChangeSubscription();
  }

  setPrimayContact(rowData:any, index:number){
  }

  deleteSubRecipientRow(rowData:any, rowIndex:number){
    let data = this.subRecipientData.filteredData;
    if (this.subRecipientData.filteredData.length > 0) {
      this.subRecipientData.filteredData.splice(rowIndex, 1)
      this.subRecipientData = new MatTableDataSource(data);
      this.subRecipientData._updateChangeSubscription();
      this.subRecipientData.paginator = this.paginator;
    }
  }

  addNewUser(){
    this.isEditMode = false;
    this.subRecipientData = new MatTableDataSource([]);
    this.responseData = new MatTableDataSource([]);
    this.isHideSearchUser = false;
    this.showUserDetails = true;
    this.userDetailsForm.reset();
  }

  cancelUserDetails(){
    this.isEditMode = false;
    this.isHideSearchUser = true;
    this.showUserDetails = false;
  }

  openUserInfoPopup(){
    const dialogRef = this.dialog.open(PopUpComponent, {
      maxWidth: "150vw",
      maxHeight: "200vh",

      width: "80%",
      height : "80%",
      data: {PageName : 'gemsUserInfo', headerName : 'User Info'},
      autoFocus: false
    });

    dialogRef.componentInstance.emitService.subscribe((emmitedValue) => {
      console.log(emmitedValue);
    });
  }

}
