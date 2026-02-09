import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  SimpleChanges,
  OnChanges,
  Inject,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  tap,
  takeUntil,
} from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { of, Subject } from "rxjs";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

interface SubRecipient {
  agency_id: number;
  sub_rec_cd: string;
  sub_rec_name: string;
  sub_rec_type_label: string;
}

interface DialogData {
  pageName: string;
  mode: string;
  headerName: string;
  subrecData: any;
  grantPgmId: number;
  grantPgm: string;
  reviewType: string;
  reviewYear: string;
  currentTabId: string;
  currentTabTitle: string;
}

@Component({
  selector: "app-add-sub-recipient",
  templateUrl: "./add-sub-recipient.component.html",
  styleUrls: ["./add-sub-recipient.component.scss"],
})
export class AddSubRecipientComponent implements OnInit, OnChanges {
  @Output() formItemEvent = new EventEmitter<any>();

  // Form Controls
  searchFormRulesCtrl = new FormControl();
  formRulesForm: FormGroup;

  // Data
  allFormRules: SubRecipient[] = [];
  filteredFormRules: SubRecipient[] = [];
  selectedSubRecipient: SubRecipient | null = null;
  isLoading = false;
  errorMsg = "";
  showSpinner: boolean = false;
  totalCount: number = 0;
  maxResults: number = 10;
  grantPgmId: number = 570;
  grantPgm: string = "";
  reviewType: string = "DRT";
  reviewYear: string;

  public reviewTypeList: any[] = [];
  public selectedReviewTypeList: any[] = [];
  public userDetails: any;

  // Search subject for debouncing API calls
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private httpClient: HttpClient,
    private formBuilder: FormBuilder,
    private programAdministrationService: ProgramAdministrationService,
    public dialogRef: MatDialogRef<AddSubRecipientComponent>,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.initializeForms();
    this.setupSearchSubscription();

    // Set grantPgmId from dialog data
    if (this.data?.grantPgmId) {
      this.grantPgmId = this.data.grantPgmId;
    }

    if (this.data?.grantPgm) {
      this.grantPgm = this.data.grantPgm;
    }

    if (this.data?.reviewType) {
      this.reviewType = this.data.reviewType;
    }

    if (this.data?.reviewYear) {
      this.reviewYear = this.data.reviewYear;
    }
  }

  ngOnInit(): void {
    this.userDetails = this.programAdministrationService.getUserDetails();
    this.initializeData();
    this.setupFormChanges();
    if (this.data?.currentTabId === "ltclaimexcep") {
      this.loadReviewTypeList();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {}

  private initializeForms(): void {
    this.formRulesForm = this.formBuilder.group({
      formId: ["", Validators.required],
    });
  }

  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading = true;
          this.errorMsg = "";
        }),
        switchMap((searchTerm) => {
          if (!searchTerm || searchTerm.length < 2) {
            this.filteredFormRules = [];
            this.totalCount = 0;
            this.isLoading = false;
            return of({ data: [], totalCount: 0 });
          }
          const payload = {
            input: searchTerm,
            maxResults: this.maxResults,
            grantPgmId: this.grantPgmId,
          };

          return this.httpClient
            .get<
              any[]
            >("assets/api-data/ConsolidatedReview/GetConsSubRecInfoAuto.json")
            .pipe(
              catchError((error) => {
                console.error("Search error:", error);
                this.errorMsg =
                  "Error searching sub-recipients. Please try again.";
                return of({ data: [], totalCount: 0 });
              }),
            );
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (Array.isArray(response) && response.length >= 2) {
            const dataArray = response[0] || [];
            const countArray = response[1] || [];

            this.allFormRules = dataArray.map((item: any) => ({
              agency_id: item.agency_id || 0,
              sub_rec_cd: item.sub_rec_cd || "",
              sub_rec_name: item.sub_rec_name || "",
              sub_rec_type_label: item.sub_rec_type_label || "",
            }));

            this.filteredFormRules = [...this.allFormRules];

            if (countArray.length > 0 && countArray[0].Column1) {
              this.totalCount = countArray[0].Column1;
            } else {
              this.totalCount = dataArray.length;
            }
          } else {
            this.allFormRules = [];
            this.filteredFormRules = [];
            this.totalCount = 0;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMsg = "Error loading sub-recipients. Please try again.";
          console.error("Error loading sub-recipients:", error);
          this.allFormRules = [];
          this.filteredFormRules = [];
          this.totalCount = 0;
        },
      });
  }

  private initializeData(): void {
    if (this.data) {
      this.populateFormData();
    }
    this.formRulesForm.enable();
    this.searchFormRulesCtrl.enable();
  }

  private populateFormData(): void {
    if (!this.data) return;

    if (this.data.subrecData && this.data.subrecData.sub_rec_name) {
      const subRecipient: SubRecipient = {
        agency_id: this.data.subrecData.agency_id || 0,
        sub_rec_cd: this.data.subrecData.sub_rec_cd || "",
        sub_rec_name: this.data.subrecData.sub_rec_name || "",
        sub_rec_type_label: this.data.subrecData.sub_rec_type_label || "",
      };

      this.formRulesForm.patchValue({
        formId: this.data.subrecData.sub_rec_cd || "",
      });

      this.selectedSubRecipient = subRecipient;
      this.searchFormRulesCtrl.setValue(subRecipient);
    }
  }

  private setupFormChanges(): void {
    this.searchFormRulesCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe({
        next: (searchTerm: string | SubRecipient) => {
          if (typeof searchTerm === "string") {
            this.searchSubject.next(searchTerm);
          } else if (searchTerm && typeof searchTerm === "object") {
            this.selectedSubRecipient = searchTerm;
            this.formRulesForm.patchValue({
              formId: searchTerm.sub_rec_cd,
            });
            this.emitFormData();
          }
        },
      });

    this.formRulesForm.valueChanges.subscribe(() => {
      this.emitFormData();
    });
  }

  displayWithForm(value: SubRecipient): string {
    if (!value) return "";
    if (typeof value === "string") return value;

    return value.sub_rec_name || value.sub_rec_cd || "";
  }

  onSelect(subRecipient: SubRecipient): void {
    if (!subRecipient) return;

    this.selectedSubRecipient = subRecipient;

    this.formRulesForm.patchValue({
      formId: subRecipient.sub_rec_cd,
    });

    this.searchFormRulesCtrl.setValue(subRecipient);
    this.emitFormData();
  }

  clearSelection(): void {
    this.selectedSubRecipient = null;
    this.searchFormRulesCtrl.setValue("");
    this.filteredFormRules = [];
    this.totalCount = 0;

    this.formRulesForm.patchValue({
      formId: "",
    });

    this.emitFormData();
  }

  saveForm(): void {
    if (this.formRulesForm.valid && this.selectedSubRecipient) {
      const formData = this.getFormData();
      formData.grantPgmId = this.grantPgmId;
      formData.grantPgm = this.grantPgm;
      formData.reviewType = this.reviewType;
      formData.reviewYear = this.reviewYear;
      formData.reviewStage = "SCHED";
      formData.userId = this.userDetails?.userId;
      formData.currentTabId = this.data?.currentTabId;
      formData.currentTabTitle = this.data?.currentTabTitle;
      this.formItemEvent.emit(formData);
      this.closePopup(formData);
    } else {
      this.markFormAsTouched();
    }
  }

  private markFormAsTouched(): void {
    Object.keys(this.formRulesForm.controls).forEach((key) => {
      const control = this.formRulesForm.get(key);
      control?.markAsTouched();
    });
  }

  private emitFormData(): void {
    if (this.formRulesForm.valid && this.selectedSubRecipient) {
      this.formItemEvent.emit(this.getFormData());
    }
  }

  getFormData(): any {
    return {
      formId: this.formRulesForm.get("formId")?.value,
      selectedSubRecipient: this.selectedSubRecipient,
      sub_rec_name: this.selectedSubRecipient?.sub_rec_name,
      sub_rec_cd: this.selectedSubRecipient?.sub_rec_cd,
      agency_id: this.selectedSubRecipient?.agency_id,
      sub_rec_type_label: this.selectedSubRecipient?.sub_rec_type_label,
      grantPgmId: this.grantPgmId,
      grantPgm: this.grantPgm,
      reviewType: this.reviewType,
      reviewYear: this.reviewYear,
      reviewStage: "SCHED",
      userId: this.userDetails?.userId,
    };
  }

  closePopup(result?: any): void {
    this.dialogRef.close(result);
  }

  // Form Validation Helpers
  isFormValid(): boolean {
    return this.formRulesForm.valid && this.selectedSubRecipient !== null;
  }

  loadReviewTypeList() {
    this.reviewTypeList = [];
    let payload = {
      grantPgmId: this.grantPgmId,
      rvwType: "",
      rvwTypeDesc: "",
      option: "R",
      recStat: "O",
      orderBy: "",
      userId: this.userDetails?.userId,
    };
    this.showSpinner = true;

    this.httpClient
      .get("assets/api-data/ConsolidatedReview/GetRvwTypeLookUp.json")
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(
        (res: any) => {
          if (res != null) {
            ((this.reviewTypeList = res[0]?.map((x) => {
              return {
                id: x["rvw_type"],
                itemName: x["rvw_desc"] + " (" + x["rvw_type"] + ")",
                ...x,
              };
            })),
              (this.showSpinner = false));
            this.cd.detectChanges();
          }
        },
        (error) => {
          this.showSpinner = false;
        },
      );
  }

  async updatedSelectedValue(selectedList: any): Promise<void> {
    this.selectedReviewTypeList = selectedList?.selectedItemsValues;
    this.reviewType = this.selectedReviewTypeList[0]?.rvw_type || null;
  }
}
