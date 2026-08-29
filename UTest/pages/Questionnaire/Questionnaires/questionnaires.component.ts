import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { ClassicEditor, type EditorConfig } from 'ckeditor5';
import { GLOBAL_EDITOR_CONFIG } from "src/app/shared/config/ckeditor.config";
import { SharedService } from "src/app/shared/services/shared.service";
import { Questionnaire } from "src/app/pages/program-administration/models/questionnaire.model";

@Component({
    selector: "app-questionnaires",
    templateUrl: "./questionnaires.component.html",
    styleUrls: ["./questionnaires.component.scss"],
    standalone: false
})
export class QuestionnairesComponent implements OnChanges {
  @Input() selectedQuestionnaire: any;
  @Output() navigateToScripts = new EventEmitter<any>();
  @Output() emitSelectedQuestionnaire = new EventEmitter();

  public showSpinner = false;
  public Editor = ClassicEditor;
  public editorConfig: EditorConfig = GLOBAL_EDITOR_CONFIG;
  public questionnaire: Questionnaire | any = {};
  private originalQuestionnaire: any = {};

  constructor(private sharedService: SharedService) {}

  get canMaintainQuestionnaireScripts(): boolean {
    return this.sharedService.canMaintainQuestionnaireScripts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedQuestionnaire']) {
      this.originalQuestionnaire = this.cloneQuestionnaire(this.selectedQuestionnaire);
      this.applyQuestionnaire(this.originalQuestionnaire);
    }
  }

  openQuestionnaireScripts(): void {
    if (!this.questionnaire?.id && !this.questionnaire?.questionnaireId) {
      return;
    }
    if (!this.canMaintainQuestionnaireScripts) {
      return;
    }
    this.navigateToScripts.emit(this.questionnaire);
  }

  clearForm(): void {
    try {
      this.applyQuestionnaire(this.originalQuestionnaire);
    } catch (error) {
      console.error('Failed to clear questionnaire form', error);
    }
  }

  close(): void {
    try {
      this.clearForm();
      this.emitSelectedQuestionnaire.emit({ selectedPage: 'search', showDetails: false });
    } catch (error) {
      console.error('Failed to close questionnaire', error);
    }
  }

  private applyQuestionnaire(source: any): void {
    const data = this.cloneQuestionnaire(source);
    this.questionnaire = {
      ...data,
      id: data?.id ?? data?.questionnaireId,
      questionnaireId: data?.questionnaireId ?? data?.id,
      name: data?.name ?? data?.itemName ?? '',
      createDate: data?.createDate ?? data?.createdDate,
      modifyDate: data?.modifyDate ?? data?.modifiedDate,
      homeMeisrespondButtonLabel: data?.homeMeisrespondButtonLabel ?? data?.homeMEISRespondButtonLabel
    };
  }

  private cloneQuestionnaire(source: any): any {
    try {
      return JSON.parse(JSON.stringify(source || {}));
    } catch (error) {
      console.error('Failed to clone questionnaire data', error);
      return { ...(source || {}) };
    }
  }
}
