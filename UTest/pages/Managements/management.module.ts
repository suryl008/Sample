import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ManagementRoutingModule } from "./management-routing.module";
import { ErrandComponent } from "./Errand/errand.component";
import { PopupComponent } from "./Popup/popup.component";
import { TemplateComponent } from "./Template/template.component";
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { SetupComponent } from "./Review/Setup/setup.component";
import { ReviewPopupComponent } from "./Review/ReviewPopup/review-popup.component";
import { NumbersOnlyDirective } from "src/app/shared/Directive/numberonly.directive";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SubRecipientSearchComponent } from "./SubRecipient/SubRecipientSearch/SubRecipientSearch.component";
import { SubRecipientPopupComponent } from "./SubRecipient/SubRecipientPopup/SubRecipientPopup.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [
    ErrandComponent,
    PopupComponent,
    TemplateComponent,
    //CTEPortalComponent,
    SubRecipientSearchComponent,
    SubRecipientPopupComponent,

    //SearchComponent,
    // QuestionnairesComponent,
    // SectionsComponent,
    // FieldsComponent,
    // QusPopupComponent,
    // QusContainerComponent,
    SetupComponent,
    ReviewPopupComponent,
    NumbersOnlyDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ManagementRoutingModule,
    CKEditorModule,
    DragDropModule,
    SharedModule,
  ],
})
export class ManagementModule {}
