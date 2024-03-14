import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PopupComponent } from '../Popup/popup.component';

@Component({
  selector: 'app-errand',
  templateUrl: './errand.component.html',
  styleUrls: ['./errand.component.scss']
})
export class ErrandComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public refresh : boolean = false;
  public showSpinner: boolean = false;
  public responseData = new MatTableDataSource()

  public data: any =
    {
      "isEdit" : true,
      "errandId": null,
      "errandName": "",
      "errandType": "",
      "errandCommand": "",
      "includeHeaderInResults": "",
      "attachmentFilename Prefix": null,
      "deleteAttachmentFileAfterSend": null,
      "emailAddressColumnName": "",
      "emailToAddresses": "",
      "emailCcAddresses": null,
      "email8ccAddresses": null,
      "emailSubject": "",
      "emailTemplate": "",
      "recStat": "",
      "createDt": null,
      "createId": null,
      "lastUpdDt": null,
      "lastUpdId": null,
      "preview": null,
      "errandSchedules": []
    }
  public sampleData: any = [{
    "errandId": 1,
    "errandName": "Task Reminders",
    "errandType": "query",
    "errandCommand": "Tasks",
    "includeHeaderInResults": "N",
    "attachmentFilename Prefix": null,
    "deleteAttachmentFileAfterSend": null,
    "emailAddressColumnName": "user_email",
    "emailToAddresses": "long310@michigan.gov",
    "emailCcAddresses": null,
    "email8ccAddresses": null,
    "emailSubject": "GEMS/MARS Automated Notification",
    "emailTemplate": "GEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated Notification",
    "recStat": "A",
    "createDt": null,
    "createId": null,
    "lastUpdDt": null,
    "lastUpdId": null,
    "preview": null,
    "errandSchedules": [
      {
        "errandScheduleId": 14,
        "errandId": 0,
        "scheduleType": "dayofweek",
        "scheduleValue": 0,
        "scheduleTime": null,
        "createDt": null,
        "createId": null,
        "lastUpdDt": null,
        "lastUpdId": null,
        "errand": null
      },
      {
        "errandScheduleId": 15,
        "errandId": 0,
        "scheduleType": "dayofweek",
        "scheduleValue": 7,
        "scheduleTime": null,
        "createDt": null,
        "createId": null,
        "lastUpdDt": null,
        "lastUpdId": null,
        "errand": null
      }
    ]
  },
  {
    "errandId": 1,
    "errandName": "Task Reminders",
    "errandType": "query",
    "errandCommand": "Tasks",
    "includeHeaderInResults": "N",
    "attachmentFilename Prefix": null,
    "deleteAttachmentFileAfterSend": null,
    "emailAddressColumnName": "user_email",
    "emailToAddresses": "long310@michigan.gov",
    "emailCcAddresses": null,
    "email8ccAddresses": null,
    "emailSubject": "GEMS/MARS Automated Notification",
    "emailTemplate": "GEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated Notification",
    "recStat": "A",
    "createDt": null,
    "createId": null,
    "lastUpdDt": null,
    "lastUpdId": null,
    "preview": null,
    "errandSchedules": [
      {
        "errandScheduleId": 14,
        "errandId": 0,
        "scheduleType": "dayofweek",
        "scheduleValue": 0,
        "scheduleTime": null,
        "createDt": null,
        "createId": null,
        "lastUpdDt": null,
        "lastUpdId": null,
        "errand": null
      },
      {
        "errandScheduleId": 15,
        "errandId": 0,
        "scheduleType": "dayofweek",
        "scheduleValue": 7,
        "scheduleTime": null,
        "createDt": null,
        "createId": null,
        "lastUpdDt": null,
        "lastUpdId": null,
        "errand": null
      }
    ]
  },
  {
    "errandId": 1,
    "errandName": "Task Reminders",
    "errandType": "query",
    "errandCommand": "Tasks",
    "includeHeaderInResults": "N",
    "attachmentFilename Prefix": null,
    "deleteAttachmentFileAfterSend": null,
    "emailAddressColumnName": "user_email",
    "emailToAddresses": "long310@michigan.gov",
    "emailCcAddresses": null,
    "email8ccAddresses": null,
    "emailSubject": "GEMS/MARS Automated Notification",
    "emailTemplate": "GEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated NotificationGEMS/MARS Automated Notification",
    "recStat": "A",
    "createDt": null,
    "createId": null,
    "lastUpdDt": null,
    "lastUpdId": null,
    "preview": null,
    "errandSchedules": [
      {
        "errandScheduleId": 14,
        "errandId": 0,
        "scheduleType": "dayofweek",
        "scheduleValue": 0,
        "scheduleTime": null,
        "createDt": null,
        "createId": null,
        "lastUpdDt": null,
        "lastUpdId": null,
        "errand": null
      },
      {
        "errandScheduleId": 15,
        "errandId": 0,
        "scheduleType": "dayofweek",
        "scheduleValue": 7,
        "scheduleTime": null,
        "createDt": null,
        "createId": null,
        "lastUpdDt": null,
        "lastUpdId": null,
        "errand": null
      }
    ]
  }
  ];
  public displayedColumns = [
    "action",
    "errandId",
    "errandName",
    "errandType",
    "errandCommand",
    "includeHeaderInResults",
    "attachmentFilename Prefix",
    "deleteAttachmentFileAfterSend",
    "emailAddressColumnName",
    "emailToAddresses",
    "emailCcAddresses",
    "emailbccAddresses",
    "emailSubject",
    "emailTemplate",
    "recStat",
    "lastUpdDt",
    "preview"
  ];
  public matColumnConfig = [
    {
      "id": "errandId",
      "name": "Errand ID"
    },
    {
      "id": "errandName",
      "name": "Errand Name"
    },
    {
      "id": "errandType",
      "name": "Errand Type"
    },
    {
      "id": "errandCommand",
      "name": "Errand Command"
    },
    {
      "id": "includeHeaderInResults",
      "name": "Results"
    },
    {
      "id": "attachmentFilename Prefix",
      "name": "Attachment Filename Prefix"
    },
    {
      "id": "deleteAttachmentFileAfterSend",
      "name": "Delete Attachment File After Send"
    },
    {
      "id": "emailAddressColumnName",
      "name": "Email Address Column Name"
    },
    {
      "id": "emailToAddresses",
      "name": "Email To Addresses"
    },
    {
      "id": "emailCcAddresses",
      "name": "Email Cc Addresses"
    },
    {
      "id": "emailbccAddresses",
      "name": "Email Bcc Addresses"
    },
    {
      "id": "emailSubject",
      "name": "Email Subject"
    },
    {
      "id": "emailTemplate",
      "name": "Email Template"
    },
    {
      "id": "recStat",
      "name": "Status"
    },
    {
      "id": "lastUpdDt",
      "name": "Last Update"
    },
    {
      "id": "preview",
      "name": "Preview"
    }
  ]

  constructor(private cd : ChangeDetectorRef, public dialog: MatDialog, private httpClient: HttpClient, private sharedService: SharedService){}

  async ngOnInit() {
    this.responseData = new MatTableDataSource(this.sampleData);
    this.responseData?.data?.forEach((element:any) => {
      element.isEdit = false;
    });
    setTimeout(() => this.responseData.paginator = this.paginator);
  }

  addNewErrand() {
    this.refresh = true;
    let data = JSON.parse(JSON.stringify(this.data))
    this.responseData.data.push(data);
    this.cd.detectChanges();
    this.responseData._updateChangeSubscription();
    this.refresh = false;
    let id = "errandName_"+ (this.responseData.data?.length - 1);
    console.log(id)
    setTimeout(() => {
      document.getElementById(id)?.focus();
    }, 100);
  }

  enableSaveButton(){
    return this.responseData?.data.filter((x:any) => x.errandName == '')?.length > 0 || this.responseData?.data.filter((x:any) => x.isEdit)?.length > 0
  }

  saveOrUpdate(data :any){
    console.log(data);
    data.isEdit = !data.isEdit;
  }

  openErrandSchedules(element) {
    const dialogRef = this.dialog.open(PopupComponent, {
      maxWidth: "150vw",
      maxHeight: "200vh",

      width: "60%",
      height: "60%",
      data: { pageName: 'errand', headerName: 'Errand Schedules', emitdata: element },
      autoFocus: false
    });

  }

}
