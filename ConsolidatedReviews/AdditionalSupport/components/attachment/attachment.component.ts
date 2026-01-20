import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  EventEmitter,
  Input,
  SimpleChanges,
} from "@angular/core";
import { Component, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

@Component({
  selector: "app-attachment",
  templateUrl: "./attachment.component.html",
  styleUrls: ["./attachment.component.css"],
})
export class AttachmentComponent implements OnInit {
  @Output() attachmentEvent = new EventEmitter<any>();
  @Input() data: any;
  @Input() isDocModelEdit: boolean = true;

  isFlipped: boolean = false;
  dataSourceReminder: MatTableDataSource<any>;
  columnsToDisplay: string[];
  attachmentForm: FormGroup;
  fileTypesList: any[] = [];
  attachmentInfo: any;
  showSpinner: boolean = false;
  isShowPDFPg: boolean = false;

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.initializeForm();
    this.loadFormData();
    this.loadFileTypes();

    this.columnsToDisplay = [
      "refType",
      "refDesc",
      "sel",
      "sizeApply",
      "maxSize",
    ];

    this.onChanges();
  }

  private initializeForm(): void {
    this.attachmentForm = this.formBuilder.group({
      helpTxt: [""],
      minNos: [""],
      maxNos: [""],
      fileTypeAppl: [false],
      minPg: [""],
      maxPg: [""],
      pageAppl: [false],
    });
  }

  private loadFormData(): void {
    if (this.data != null) {
      this.attachmentForm.patchValue({
        helpTxt: this.data.documentValue?.helpTxt || "",
        minNos: this.data.documentValue?.minNos || "",
        maxNos: this.data.documentValue?.maxNos || "",
        fileTypeAppl: this.data.documentValue?.fileTypeAppl === "Y",
      });

      if (!this.isDocModelEdit) {
        this.attachmentForm.disable();
      } else {
        this.attachmentForm.enable();
      }
    } else {
      this.isDocModelEdit = true;
    }
  }

  private loadFileTypes(): void {
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/getAllFileTypesInfo.json")
      .subscribe(
        (res: any) => {
          if (res != null) {
            let attachmentDetails = res.map((element: any) => ({
              ...element,
              sel: false,
              size_appl: false,
              maximum_size: 0,
              page_appl: false,
              minLen: 0,
              maxLen: 0,
            }));

            this.showSpinner = false;
            this.dataSourceReminder = new MatTableDataSource(attachmentDetails);

            this.loadExistingFileTypes();
          }
        },
        (error) => {
          this.showSpinner = false;
          console.error("Error loading file types:", error);
        }
      );
  }

  private loadExistingFileTypes(): void {
    if (this.data?.typeInfo?.docListInfo?.[0]?.rvwAttachTypes?.length > 0) {
      this.isShowPDFPg = false;
      this.fileTypesList = this.data.typeInfo.docListInfo[0].rvwAttachTypes;

      this.data.typeInfo.docListInfo[0].rvwAttachTypes.forEach(
        (selectedType: any) => {
          this.dataSourceReminder.data.forEach((type: any) => {
            if (selectedType.fileType === type.refCode) {
              type.sel = true;
              type.size_appl = selectedType.fileSizeAppl === "Y";
              type.maximum_size = selectedType.maxSize;
              type.page_appl = selectedType.pgNosAppl === "Y";
              type.minLen = selectedType.minPg;
              type.maxLen = selectedType.maxPg;

              if (
                selectedType.fileType === "PDF" &&
                selectedType.fileSizeAppl === "Y"
              ) {
                this.isShowPDFPg = true;
                this.attachmentForm.patchValue({
                  minPg: selectedType.minPg,
                  maxPg: selectedType.maxPg,
                  pageAppl: selectedType.pgNosAppl === "Y",
                });
              }
            }
          });
        }
      );

      this.dataSourceReminder._updateChangeSubscription();
      this.cd.markForCheck();
    }
  }

  onChanges() {
    this.attachmentForm.valueChanges.subscribe((val) => {
      this.attachmentInfo = {
        details: val,
        types: this.fileTypesList,
      };
      this.attachmentEvent.emit(this.attachmentInfo);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.isDocModelEdit &&
      changes.isDocModelEdit.currentValue !== undefined
    ) {
      if (changes.isDocModelEdit.currentValue === true) {
        this.attachmentForm.enable();
      } else {
        this.attachmentForm.disable();
      }
    }
  }

  onClickFlip() {
    this.isFlipped = !this.isFlipped;
  }

  cancelFlip() {
    this.isFlipped = false;
  }

  addFileType(element: any, fieldName: string) {
    if (this.isDocModelEdit && this.data !== "new") {
      return;
    }

    const index = this.dataSourceReminder.data.indexOf(element);

    if (fieldName === "select") {
      element.sel = !element.sel;
      if (!element.sel) {
        element.size_appl = false;
        element.maximum_size = 0;
        element.page_appl = false;
        element.minLen = 0;
        element.maxLen = 0;

        // Remove from fileTypesList
        this.fileTypesList = this.fileTypesList.filter(
          (fileType) => fileType.fileType !== element.refCode
        );
      } else {
        // Add to fileTypesList
        const existingIndex = this.fileTypesList.findIndex(
          (fileType) => fileType.fileType === element.refCode
        );

        if (existingIndex === -1) {
          this.fileTypesList.push({
            fileType: element.refCode,
            fileSizeAppl: element.size_appl ? "Y" : "N",
            maxSize: element.maximum_size,
            pgNosAppl: element.page_appl ? "Y" : "N",
            minPg: element.minLen,
            maxPg: element.maxLen,
          });
        }
      }
    } else if (fieldName === "size") {
      element.size_appl = !element.size_appl;
      element.maximum_size = element.size_appl ? element.maximum_size : 0;

      // Update fileTypesList
      const fileType = this.fileTypesList.find(
        (ft) => ft.fileType === element.refCode
      );

      if (fileType) {
        fileType.fileSizeAppl = element.size_appl ? "Y" : "N";
        fileType.maxSize = element.maximum_size;

        if (element.refCode === "PDF" && element.size_appl) {
          this.isShowPDFPg = true;
        }
      }
    }

    // Update the data source
    this.dataSourceReminder.data[index] = element;
    this.dataSourceReminder._updateChangeSubscription();

    // Emit changes
    this.attachmentInfo = {
      details: this.attachmentForm.value,
      types: this.fileTypesList,
    };
    this.attachmentEvent.emit(this.attachmentInfo);

    this.cd.markForCheck();
  }

  updateFileType(event: any, element: any, label: string) {
    const index = this.dataSourceReminder.data.indexOf(element);
    element.maximum_size = event.target.value;

    // Update fileTypesList
    const fileType = this.fileTypesList.find(
      (ft) => ft.fileType === element.refCode
    );

    if (fileType) {
      fileType.maxSize = element.maximum_size;
    }

    // Update the data source
    this.dataSourceReminder.data[index] = element;
    this.dataSourceReminder._updateChangeSubscription();

    // Emit changes
    this.attachmentInfo = {
      details: this.attachmentForm.value,
      types: this.fileTypesList,
    };
    this.attachmentEvent.emit(this.attachmentInfo);

    this.cd.markForCheck();
  }

  updatePDFFileInfo(event: any, fieldName: string) {
    // Update fileTypesList for PDF
    const pdfFileType = this.fileTypesList.find((ft) => ft.fileType === "PDF");

    if (pdfFileType) {
      if (fieldName === "pageAppl") {
        pdfFileType.pgNosAppl = event.checked ? "Y" : "N";
        if (!event.checked) {
          pdfFileType.minPg = 0;
          pdfFileType.maxPg = 0;
          this.attachmentForm.patchValue({
            minPg: 0,
            maxPg: 0,
          });
        }
      } else if (fieldName === "minPg") {
        pdfFileType.minPg = Number(event);
      } else if (fieldName === "maxPg") {
        pdfFileType.maxPg = Number(event);
      }
    }

    // Emit changes
    this.attachmentInfo = {
      details: this.attachmentForm.value,
      types: this.fileTypesList,
    };
    this.attachmentEvent.emit(this.attachmentInfo);
  }
}

// import { HttpClient } from "@angular/common/http";
// import {
//   ChangeDetectorRef,
//   EventEmitter,
//   Input,
//   SimpleChanges,
// } from "@angular/core";
// import { Component, OnInit, Output } from "@angular/core";
// import {
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   Validators,
// } from "@angular/forms";
// import { MatTableDataSource } from "@angular/material/table";
// import {
//   debounceTime,
//   tap,
//   switchMap,
//   finalize,
//   distinctUntilChanged,
//   filter,
// } from "rxjs/operators";
// import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

// @Component({
//   selector: "app-attachment",
//   templateUrl: "./attachment.component.html",
//   styleUrls: ["./attachment.component.css"],
// })
// export class AttachmentComponent implements OnInit {
//   @Output() attachmentEvent = new EventEmitter<string>();
//   @Input() data: any;
//   @Input() isDocModelEdit: boolean;
//   flip: any;
//   dataSourceReminder: any;
//   columnsToDisplay: string[];
//   attachmentForm: FormGroup;
//   fileTypesList: any = [];
//   attachmentInfo: any;
//   showSpinner: boolean = false;
//   isShowPDFPg: boolean = false;

//   constructor(
//     private programAdministrationService: ProgramAdministrationService,
//     private formBuilder: FormBuilder,
//     private httpClient: HttpClient,
//     private cd: ChangeDetectorRef
//   ) {}

//   async ngOnInit(): Promise<void> {
//     this.attachmentForm = this.formBuilder.group({
//       // helpTxt: [""],
//       minNos: [""],
//       maxNos: [""],
//       fileTypeAppl: [false],
//       minPpg: [""],
//       maxPpg: [""],
//       pageAppl: [false],
//     });

//     if (this.data != null) {
//       // this.attachmentForm.controls["helpTxt"].setValue(
//       //   this.data.documentValue.helpTxt
//       // );
//       this.attachmentForm.controls["minNos"].setValue(
//         this.data.documentValue.minNos
//       );
//       this.attachmentForm.controls["maxNos"].setValue(
//         this.data.documentValue.maxNos
//       );
//       if (this.data.documentValue.fileTypeAppl === "Y") {
//         this.attachmentForm.controls["fileTypeAppl"].setValue(true);
//       } else {
//         this.attachmentForm.controls["fileTypeAppl"].setValue(false);
//       }
//       if (!this.isDocModelEdit) {
//         this.attachmentForm.disable();
//       } else {
//         this.attachmentForm.enable();
//       }
//     } else {
//       this.isDocModelEdit = true;
//     }
//     this.showSpinner = true;

//     // this.programAdministrationService
//     //   .getAllFileTypesInfo("FTY", "000000")
//     this.httpClient
//       .get("assets/api-data/ConsolidatedReview/getAllFileTypesInfo.json")
//       .subscribe(
//         (res: any) => {
//           if (res != null) {
//             console.log(res);
//             let attachmentDetails = [];
//             attachmentDetails = res;
//             if (attachmentDetails.length > 0) {
//               attachmentDetails.forEach((element) => {
//                 element.sel = false;
//                 element.size_appl = false;
//                 element.max_size = 0;
//                 element.page_appl = false;
//                 element.minLen = 0;
//                 element.maxLen = 0;
//               });
//             }
//             this.showSpinner = false;
//             this.dataSourceReminder = new MatTableDataSource(attachmentDetails);
//             if (this.data?.typeInfo?.docListInfo[0].rvwAttachTypes.length > 0) {
//               this.isShowPDFPg = false;
//               this.fileTypesList =
//                 this.data.typeInfo.docListInfo[0].rvwAttachTypes;
//               this.data.typeInfo.docListInfo[0].rvwAttachTypes.map(
//                 (selectedtype: any) => {
//                   this.dataSourceReminder.data.map((types: any) => {
//                     if (selectedtype.fileType === types.refCode) {
//                       if (
//                         selectedtype.fileType === "PDF" &&
//                         selectedtype.fileSizeAppl === "Y"
//                       ) {
//                         this.isShowPDFPg = true;
//                         this.attachmentForm.controls["minPg"].setValue(
//                           selectedtype.minPg
//                         );
//                         this.attachmentForm.controls["maxPg"].setValue(
//                           selectedtype.maxPg
//                         );
//                         selectedtype.pgNosAppl === "Y"
//                           ? this.attachmentForm.controls["pageAppl"].setValue(
//                               true
//                             )
//                           : this.attachmentForm.controls["pageAppl"].setValue(
//                               false
//                             );
//                       }
//                       types.refCode = selectedtype.fileType;
//                       types.sel = true;
//                       selectedtype.fileSizeAppl === "Y"
//                         ? (types.size_appl = "Y")
//                         : (types.size_appl = "N");
//                       types.max_size = selectedtype.maxSize;

//                       selectedtype.pgNosAppl === "Y"
//                         ? (types.page_appl = true)
//                         : (types.page_appl = false);
//                       types.minLen = selectedtype.minPg;
//                       types.maxLen = selectedtype.maxPg;
//                     }
//                   });
//                   this.dataSourceReminder._updateChangeSubscription();
//                   this.cd.markForCheck();
//                 }
//               );
//             }
//           }
//         },
//         (error) => {
//           this.showSpinner = false;
//         }
//       );

//     this.columnsToDisplay = [
//       "refType",
//       "refDesc",
//       "sel",
//       "sizeApply",
//       "maxSize",
//     ];
//     this.onChanges();
//   }

//   onChanges() {
//     this.attachmentForm.valueChanges.subscribe((val) => {
//       this.attachmentInfo = {
//         details: val,
//         types: this.fileTypesList,
//       };
//       this.attachmentEvent.emit(this.attachmentInfo);
//     });
//   }

//   ngOnChanges(changes: SimpleChanges) {
//     if (changes.isDocModelEdit.currentValue === true) {
//       this.attachmentForm.enable();
//     } else {
//       this.attachmentForm.disable();
//     }
//   }

//   onclick = () => {
//     const btn = document.getElementById("flip_content");
//     const content = document.getElementById("fl_card1") as HTMLElement;
//     content.classList.toggle("flip");
//     this.flip = !this.flip;
//   };

//   cancelFlip() {
//     this.flip = !this.flip;
//   }

//   addFileType(element: any, fieldName: string) {
//     var index = this.dataSourceReminder.data.indexOf(element);
//     if (
//       element.refCode === "PDF" &&
//       element.sel === true &&
//       element.size_appl === true
//     ) {
//       this.isShowPDFPg = false;
//     }
//     if (this.isDocModelEdit && this.data !== "new") {
//       return;
//     }
//     if (element.sel && fieldName === "select") {
//       element.size_appl = false;
//       element.max_size = 0;
//       if (this.fileTypesList.length > 0) {
//         this.fileTypesList.forEach((fileType, i) => {
//           if (fileType.fileType === element.refCode) {
//             delete this.fileTypesList[i];
//           }
//         });
//       }
//     } else if (element.size_appl && fieldName === "size") {
//       element.max_size = 0;
//       this.fileTypesList.forEach((type: any) => {
//         if (type.fileType === element.refCode) {
//           type["fileSizeAppl"] = element.size_appl === true ? "N" : "Y";
//           type["maxSize"] = element.max_size;
//         }
//       });
//     } else if (element.size_appl && fieldName === "size") {
//       this.fileTypesList.forEach((type: any) => {
//         if (type.fileType === element.refCode) {
//           if (element.refCode === "PDF") {
//             this.isShowPDFPg = true;
//           }
//           type["fileSizeAppl"] = element.size_appl === true ? "N" : "Y";
//         }
//       });
//     }
//     if (!element.sel) {
//       var index = this.dataSourceReminder.data.indexOf(element);
//       if (this.fileTypesList.length > 0) {
//         this.fileTypesList.forEach((fileType, i) => {
//           if (fileType.fileType === element.refCode) {
//             delete this.fileTypesList[i];
//           }
//         });
//       }

//       this.fileTypesList.push({
//         fileType: element.refCode,
//         fileSizeAppl: element.size_appl === true ? "Y" : "N",
//         maxSize: element.max_size,
//         pgNosAppl: element.page_appl === true ? "Y" : "N",
//         minPg: element.minLen,
//         maxPg: element.maxPg,
//       });
//     }

//     this.attachmentInfo = {
//       details: this.attachmentForm.value,
//       types: this.fileTypesList,
//     };

//     this.attachmentEvent.emit(this.attachmentInfo);
//     this.dataSourceReminder.data[index] = element;
//     this.dataSourceReminder._updateChangeSubscription();
//     this.cd.markForCheck();
//   }

//   updateFileType(event: any, element: any, label: string) {
//     var index = this.dataSourceReminder.data.indexOf(element);
//     this.fileTypesList.forEach((type: any) => {
//       if (type.fileType === element.refCode) {
//         type[label] = event.target.value;
//       }
//     });
//     this.attachmentInfo = {
//       details: this.attachmentForm.value,
//       types: this.fileTypesList,
//     };
//     this.attachmentEvent.emit(this.attachmentInfo);
//     this.dataSourceReminder.data[index] = element;
//     this.dataSourceReminder._updateChangeSubscription();
//     this.cd.markForCheck();
//   }

//   updatePDFFileInfo(event: any, fieldName: any) {
//     if (this.attachmentInfo.types.length > 0) {
//       this.attachmentInfo.types.forEach((element) => {
//         if (element.fileType === "PDF") {
//           if (fieldName === "pageAppl") {
//             if (!event.checked) {
//               element.minPg = 0;
//               element.maxPg = 0;
//               this.attachmentForm.controls["minPg"].setValue(element.minPg);
//               this.attachmentForm.controls["maxPg"].setValue(element.maxPg);
//             }
//             element.pgNosAppl = event.checked === true ? "Y" : "N";
//             element.pgNosAppl === "Y"
//               ? this.attachmentForm.controls["pageAppl"].setValue(true)
//               : this.attachmentForm.controls["pageAppl"].setValue(false);
//           }
//           if (fieldName === "minPg") {
//             element.minPg = event;
//             this.attachmentForm.controls["minPg"].setValue(element.minPg);
//           }
//           if (fieldName === "maxPg") {
//             element.maxPg = event;
//             this.attachmentForm.controls["maxPg"].setValue(element.maxPg);
//           }
//         }
//       });
//     }
//     this.attachmentEvent.emit(this.attachmentInfo);
//   }
// }
