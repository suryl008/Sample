import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/services/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConsolidatedReviewContainerComponent } from "./ConsolidatedReviewContainer/ConsolidatedReviewContainer.component";
import { ConsolidatedReviewSearchComponent } from "./ConsolidatedReviewSearch/ConsolidatedReviewSearch.component";
//import { ConsolidatedReviewPopupcomponent } from "./ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";
import { ConsolidatedReviewDetailsComponent } from "./ConsolidatedReviewDetails/ConsolidatedReviewDetails.component";
import { ConsolidatedReviewRoutingModule } from "./ConsolidatedReviewRouting.module";
import { MiscdataConfirmDialogComponent } from "./AdditionalSupport/components/miscdata-confirm-dialog/miscdata-confirm-dialog.component";
import { AttachmentComponent } from "./AdditionalSupport/components/attachment/attachment.component";
import { FormComponent } from "./AdditionalSupport/components/form/form.component";
import { AdditionalSupportDialogComponent } from "./AdditionalSupport/additional-support-dialog/additional-support-dialog.component";
import { MiscdataDialogComponent } from "./AdditionalSupport/components/miscdata-dialog/miscdata-dialog.component";
import { MaterialExampleModule } from "src/app/material.module";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ConsolidatedReviewPopupComponent } from "./ConsolidatedReviewPopup/ConsolidatedReviewPopup.component";

@NgModule({
  declarations: [
    ConsolidatedReviewContainerComponent,
    ConsolidatedReviewSearchComponent,
    ConsolidatedReviewDetailsComponent,
    // ConsolidatedReviewPopupcomponent,
    ConsolidatedReviewPopupComponent,
    AdditionalSupportDialogComponent,
    MiscdataDialogComponent,
    MiscdataConfirmDialogComponent,
    AttachmentComponent,
    FormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ConsolidatedReviewRoutingModule,
    MaterialExampleModule,
    CKEditorModule,
  ],
})
export class ConsolidatedReviewModule {}
