import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ReviewPopupComponent } from '../ReviewPopup/review-popup.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;

  public showSpinner: boolean = false;
  public searchObj: any = {};
  public programList: any[] = [];
  public reviewTypeList: any[] = [];
  public selectedReviewTypeList: any[] = [];
  public parentList: any[] = [];
  public reviewYears: any = [];
  public selectedReviewYear: string;
  public responseData = new MatTableDataSource();
  public matColumnConfig = [
    {
      "id": "sub_rec_name",
      "name": "Parent"
    },
    {
      "id": "row_ref_no",
      "name": "Review Number"
    },
    {
      "id": "child",
      "name": "Child"
    },
    {
      "id": "docs",
      "name": "Docs"
    },
    {
      "id": "contact",
      "name": "Contacts"
    },
    {
      "id": "rvw_start",
      "name": "Review Date"
    },
    {
      "id": "notify_ind",
      "name": "Notify Status"
    },
    {
      "id": "select",
      "name": "Select"
    },
    {
      "id": "stage_stat",
      "name": "Status"
    },
  ]
  public displayedColumns = [
    "sub_rec_name",
    "row_ref_no",
    "child",
    "docs",
    "contact",
    "rvw_start",
    "notify_ind",
    "select",
    "stage_stat"
  ];

  constructor(public dialog: MatDialog, private cd: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.showSpinner = true;
    this.loadProgramList();
    this.loadReviewTypeList();
    this.loadParentList();
    this.showSpinner = false;
  }

  loadProgramList() {
    let programList: any = [] = [
      {
        "grant_PgmId": 14490,
        "grantPgm": "GSRPSAS",
        "grant_PgaDesc": "GSRP SAS-2020",
        "recStat": ['2023', '2024'],
      },
      {
        "grant_PgmId": 14491,
        "grantPgm": "GSRPSAS-1",
        "grant_PgaDesc": "GSRP SAS-2020-1",
        "recStat": null,
      },
      {
        "grant_PgmId": 14492,
        "grantPgm": "GSRPSAS-2",
        "grant_PgaDesc": "GSRP SAS-2020-2",
        "recStat": null,
      },
      {
        "grant_PgmId": 14493,
        "grantPgm": "GSRPSA-3",
        "grant_PgaDesc": "GSRP SAS-2020-3",
        "recStat": null,
      }
    ];

    this.programList = programList?.map(x => {
      return {
        id: x['grant_PgmId'],
        itemName: x['grant_PgaDesc'] + ' (' + x['grantPgm'] + ')',
        ...x
      }
    })
  }

  loadReviewTypeList() {
    let reviewTypeList: any = [] = [
      {
        "rvwTypel": "DRT",
        "rvwDesc": "Default Review Type",
      },
      {
        "rvwTypel": "DRT-1",
        "rvwDesc": "Default Review Type-1",
      },
      {
        "rvwTypel": "DRT-2",
        "rvwDesc": "Default Review Type-2",
      },
      {
        "rvwTypel": "DRT-3",
        "rvwDesc": "Default Review Type-4",
      }
    ]

    this.reviewTypeList = reviewTypeList?.map(x => {
      return {
        id: x['rvwTypel'],
        itemName: x['rvwDesc'] + ' (' + x['rvwTypel'] + ')',
        ...x
      }
    })
    this.cd.detectChanges();
  }

  loadParentList() {
    let parentList: any = [] = [
      {
        "sub_rec_cd": "19000",
        "sub_rec_name": "Clinton County RESA",
        "agency_id": 14,
      },
      {
        "sub_rec_cd": "19000-1",
        "sub_rec_name": "Clinton County RESA-1",
        "agency_id": 15,
      },
      {
        "sub_rec_cd": "19000-2",
        "sub_rec_name": "Clinton County RESA-2",
        "agency_id": 16,
      }
    ]

    this.parentList = parentList?.map(x => {
      return {
        id: x['sub_rec_cd'],
        itemName: x['sub_rec_name'] + ' (' + x['sub_rec_cd'] + ')',
        ...x
      }
    })
  }

  updatedSelectedValue(selectedList: any, field) {
    console.log(selectedList)
    if (field == 'program') {
      this.selectedReviewTypeList = [];
      this.searchObj.grantPgmId = selectedList?.selectedItemsValues[0]?.grant_PgmId || null;
      this.searchObj.grantPgm = selectedList?.selectedItemsValues[0]?.grantPgm || null;
      this.searchObj.grant_PgaDesc = selectedList?.selectedItemsValues[0]?.grant_PgaDesc || null;
      this.reviewTypeList.length ? this.selectedReviewTypeList?.push(this.reviewTypeList[0]) : this.selectedReviewTypeList = [];
      this.searchObj['rvwType'] = this.selectedReviewTypeList[0]?.rvwTypel || null;
      this.searchObj['rvwDesc'] = this.selectedReviewTypeList[0]?.rvwDesc || null;
      this.reviewYears = selectedList?.selectedItemsValues[0]?.recStat || null;
      this.searchObj['rvwYear'] = this.reviewYears?.length ? this.reviewYears[0] : null;
    } if (field == 'reviewType') {
      this.searchObj['rvwDesc'] = selectedList?.selectedItemsValues[0].rvwDesc || null;
      this.searchObj['rvwType'] = selectedList?.selectedItemsValues[0]?.rvwTypel || null;
    } if (field == 'parent') {
      this.searchObj['agency_id'] = selectedList?.selectedItemsValues[0]?.agency_id || null;
      this.searchObj['sub_rec_name'] = selectedList?.selectedItemsValues[0]?.sub_rec_name || null;
    }
  }

  searchSetupList() {
    console.log(this.searchObj)
    this.responseData.data = [
      {
        "sub_rvw_id": 87670,
        "agency_id": 17,
        "sub_rec_cd": "47000",
        "sub_rec_name": "Livingston ESA",
        "rvw_yr": 2023,
        "rvw_arl": 0,
        "ooc_ind": "N",
        "IVW_stage": "RVWCOM",
        "stage_stat": "C",
        "rvw_start": null,
        "rvw_end": "01/09/2024",
        "sub_not_id": 0,
        "notify_or": "N",
        "notify_or_srl": 0,
        "rec_stat": "",
        "reg_cd": "",
        "reg_name": null,
        "risk_score": 0.0,
        "risk_ivi": "",
        "last_rvw_dt": null,
        "risk_id": 0,
        "risk_yr": 0,
        "err_cnt": 0,
        "sub_rec_type": "P",
        "bldg_cnt": 0,
        "p_c_ind": "x",
        "row_ref_no": "2308-00064",
        "cat_desc": "Regular",
        "notify_ind": "N",
        "flw_ind": "N",
        "flv_parent": 0,
        "direct_access": 0
      },
      {
        "sub_rvw_id": 99385,
        "agency_id": 17,
        "sub_rec_cd": "47000",
        "sub_rec_name": "Livingston ESA",
        "row_yr": 2023,
        "rvw_srl": 1,
        "ooc_and": "Y",
        "rv_stage": "SCHED",
        "stage_stat": "P",
        "rvw_start": null,
        "rvw_end": null,
        "sub_not_id": 38859,
        "notify_or": "",
        "notify_or_srl": 0,
        "rec_stat": "",
        "reg_cd": "",
        "reg_name": null,
        "risk_score": 0.0,
        "risk_lvl": "",
        "last_rvw_dt": null,
        "risk_id": 0,
        "risk_yr": 0,
        "err_cnt": 4,
        "sub_rec_type": "P",
        "bldg_cnt": 0,
        "p_c_ind": "p",
        "rv_ref_no": "2406-23473",
        "cat_desc": "Add Schedule",
        "notify_ind": "Y",
        "flv_ind": "",
        "flv_parent": 0,
        "direct_access": 0
      }
    ],
    this.responseData?.data?.forEach((ele: any) => {
      ele.rvw_start = ele.rvw_start ? new Date(ele.rvw_start) : null;
      ele.rvw_end = ele.rvw_end ? new Date(ele.rvw_end) : null;
    })
    setTimeout(() => this.responseData.paginator = this.paginator);
  }

  disableSearch() {
    if (this.searchObj['grantPgmId'] && this.searchObj['rvwType']) {
      return false
    }
    return true;
  }

  openPopup(data: any, pageName: any) {
    let headerName = '';
    let height = '60%';
    data.searchObj = this.searchObj;

    if (pageName == 'child') {
      headerName = 'Child';
    }
    if (pageName == 'error') {
      headerName = 'Errors and Warnings';
    }
    if (pageName == 'document') {
      headerName = 'Add Sub-Recipient Document';
      height = '65%';
    }
    if (pageName == 'addSchedule') {
      headerName = 'Add Schedule Sub-Recipient';
      height = '68%';
    }
    if (pageName == 'saveError') {
      headerName = 'Save Validation Error';
      height = '40%';
    }
    if (pageName == 'contacts') {
      headerName = 'Schdule Contacts';
      height = '80%';
    }
    const dialogRef = this.dialog.open(ReviewPopupComponent, {
      maxWidth: "150vw",
      width: pageName == 'document' ? "80%" : pageName == 'contacts' ? "90%"  : "50%",
      height: height,
      data: { pageName: pageName, headerName: headerName, emitdata: data },
      autoFocus: false
    });
  }

  save() {
    let payLoad = JSON.parse(JSON.stringify(this.responseData?.data));
    let errorData:any[] = [];
    payLoad?.forEach((ele: any, index: number) => {
      ele.rvw_start = ele.rvw_start ? formatDate(ele.rvw_start, 'MM/dd/yyyy', 'en') : null;
      ele.rvw_end = ele.rvw_end ? formatDate(ele.rvw_end, 'MM/dd/yyyy', 'en') : null;
      if (!ele.rvw_start || !ele.rvw_end) {
        let commaSeparator = !ele.rvw_start && !ele.rvw_end ? ', ' : ''
        errorData.push({
          rowNo: index,
          rowName: ele?.sub_rec_name,
          startDate: !ele.rvw_start ? 'Please select Start Date' + commaSeparator: null,
          endDate: !ele.rvw_end ? 'Please select End Date' : null,
          commaSeparator : Boolean(commaSeparator)
        })
      }
    })
    if (!errorData?.length) {

    } else {
      this.openPopup(errorData, 'saveError')
    }
    console.log(payLoad)
  }

}
