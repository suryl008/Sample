import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { ClassicEditor } from 'ckeditor5';
import { GLOBAL_EDITOR_CONFIG } from "src/app/shared/config/ckeditor.config";
import { SharedService } from "src/app/shared/services/shared.service";
import { Questionnaire } from "src/app/pages/program-administration/models/questionnaire.model";

@Component({
  selector: "app-questionnaires",
  templateUrl: "./questionnaires.component.html",
  styleUrls: ["./questionnaires.component.scss"],
})
export class QuestionnairesComponent implements OnChanges {
  @Input() selectedQuestionnaire: any;
  @Output() navigateToScripts = new EventEmitter<any>();

  public showSpinner = false;
  public Editor = ClassicEditor;
  public editorConfig = GLOBAL_EDITOR_CONFIG;
  public questionnaire: Questionnaire | any = {};

  constructor(private sharedService: SharedService) {}

  get canMaintainQuestionnaireScripts(): boolean {
    return this.sharedService.canMaintainQuestionnaireScripts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedQuestionnaire']) {
      this.questionnaire = {
        ...(this.selectedQuestionnaire || {}),
        id: this.selectedQuestionnaire?.id ?? this.selectedQuestionnaire?.questionnaireId,
        questionnaireId: this.selectedQuestionnaire?.questionnaireId ?? this.selectedQuestionnaire?.id,
        name: this.selectedQuestionnaire?.name ?? this.selectedQuestionnaire?.itemName
      };
    }
  }

  openQuestionnaireScripts(): void {
    if (!this.questionnaire?.id && !this.questionnaire?.questionnaireId) return;
    if (!this.canMaintainQuestionnaireScripts) return;
    this.navigateToScripts.emit(this.questionnaire);
  }
}
