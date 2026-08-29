import { EmailTemplate } from "src/app/pages/program-administration/models/email-template.model";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
export type position = "left" | "right" | "above" | "below";
export type labelPosition = "before" | "after";

@Component({
    selector: "app-approvals",
    templateUrl: "./approvals.component.html",
    styleUrls: ["./approvals.component.scss"],
    standalone: false
})
export class ApprovalsComponent implements OnInit {
  @Output() approvalsItemEvent = new EventEmitter<string>();
  @Input() data: any;
  @Input() isDocModelEdit: boolean;
  myLabelPosition: labelPosition = "before";
  tooltipPosition: position = "above";
  approvalsForm: UntypedFormGroup;
  public emailTemplateList: EmailTemplate[];
  docApprovalsImportList: any = [];

  constructor(
    private programAdministrationService: ProgramAdministrationService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.getEmailTemplates();
    this.docApprovalsImportList = [
      { item_id: "", item_text: "" },
      { item_id: "E", item_text: "EEM" },
      { item_id: "P", item_text: "MEGS+ / CMS" },
      { item_id: "M", item_text: "MEIS" },
      { item_id: "X", item_text: "N/A" },
    ];
    this.approvalsForm = this.formBuilder.group({
      helpTxt: ["", Validators.required],
      approvalEmailTemplateId: ["", Validators.required],
      editableEmail: [false, Validators.required],
      unlimitedRecipients: [false, Validators.required],
      dataSrc: ["", Validators.required],
    });
    if (this.data != "new") {
      this.approvalsForm.controls["helpTxt"].setValue(
        this.data.documentValue.helpTxt
      );
      this.approvalsForm.controls["approvalEmailTemplateId"].setValue(
        this.data.documentValue.approvalEmailTemplateId
      );
      this.approvalsForm.controls["editableEmail"].setValue(
        this.data.documentValue.editableEmail
      );
      this.approvalsForm.controls["unlimitedRecipients"].setValue(
        this.data.documentValue.unlimitedRecipients
      );
      this.approvalsForm.controls["dataSrc"].setValue(
        this.data.documentValue.dataSrc
      );
      if (!this.isDocModelEdit) {
        this.approvalsForm.disable();
      } else {
        this.approvalsForm.enable();
      }
    }
    this.onChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isDocModelEdit.currentValue === true) {
      this.approvalsForm.disable();
    } else {
      this.approvalsForm.enable();
    }
  }

  onChanges() {
    this.approvalsForm.valueChanges.subscribe((val) => {
      this.approvalsItemEvent.emit(val);
    });
  }

  getEmailTemplates() {
    this.programAdministrationService
      .getEmailTemplates()
      .subscribe((res: any) => {
        if (res != null) {
          this.emailTemplateList = res;
          console.log({
            EmailTemplates: this.emailTemplateList,
          });
        }
      });
  }
}
