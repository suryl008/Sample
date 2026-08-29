import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommunicationRoutingModule } from './CommunicationRouting.module';
import { EmailTemplateComponent } from './EmailTemplate/EmailTemplate.component';
import { EmailTemplatePopUpComponent } from './EmailTemplatePopup/EmailTemplatePopup.component';


@NgModule({
  declarations: [
    EmailTemplateComponent,
    EmailTemplatePopUpComponent,
  ],
  imports: [
    CommonModule,
    CommunicationRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CommunicationModule { }
