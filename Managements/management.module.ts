import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagementRoutingModule } from './management-routing.module';
import { ErrandComponent } from './Errand/errand.component';
import { SharedModule } from 'src/app/shared/services/shared.module';
import { PopupComponent } from './Popup/popup.component';
import { TemplateComponent } from './Template/template.component';


@NgModule({
  declarations: [
    ErrandComponent,
    PopupComponent,
    TemplateComponent
  ],
  imports: [
    CommonModule,
    ManagementRoutingModule,
    SharedModule,
  ]
})
export class ManagementModule { }
