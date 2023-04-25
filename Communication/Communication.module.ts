import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/services/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommunicationRoutingModule } from './CommunicationRouting.module';
import { LandingHeaderComponent } from 'src/app/shared/Landing/Landing.component';
import { EmailTemplateComponent } from './EmailTemplate/EmailTemplate.component';
import { EmailTemplatePopUpComponent } from './EmailTemplatePopup/EmailTemplatePopup.component';
import { CKEditorModule } from 'ng2-ckeditor';

@NgModule({
  declarations: [
    EmailTemplateComponent,
    LandingHeaderComponent,
    EmailTemplatePopUpComponent,
  ],
  imports: [
    CommonModule,
    CommunicationRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule
  ]
})
export class CommunicationModule { }
