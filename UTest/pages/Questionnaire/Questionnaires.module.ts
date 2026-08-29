import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { A11yModule } from "@angular/cdk/a11y";
import { SearchComponent } from "./Search/search.component";
import { QuestionnairesComponent } from "./Questionnaires/questionnaires.component";
import { SectionsComponent } from "./Sections/sections.component";
import { FieldsComponent } from "./Fields/fields.component";
import { QusPopupComponent } from "./QusPopup/qus-popup.component";
import { QusContainerComponent } from "./QusContainer/qus-container.component";
import { QuestionnaireRoutingModule } from "./QuestionnaireRouting.module";
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';
import { QsComponent } from "./QuestionnaireScript/qs.component";
import { ScriptHistoryComponent } from "./script-history/script-history.component";

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: './assets/monaco/min/vs',
  defaultOptions: {
    language: 'javascript',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 13,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    tabSize: 4
  }
};

@NgModule({
  declarations: [
    SearchComponent,
    QuestionnairesComponent,
    SectionsComponent,
    FieldsComponent,
    QusPopupComponent,
    QusContainerComponent,
    QsComponent,
    ScriptHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuestionnaireRoutingModule,
    CKEditorModule,
    MonacoEditorModule.forRoot(monacoConfig),
    DragDropModule,
    A11yModule,
    SharedModule,
  ],
})
export class QuestionnairesModule {}
