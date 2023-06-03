import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/services/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ReportRoutingModule } from './ReportRouting.module';
import { ReportingModuleContainerComponent } from './ReportingModuleContainer/ReportingModuleContainer.component';
import { ReportingModuleListComponent } from './ReportingModuleList/ReportingModuleList.component';
import { ReportingModuleDetailsComponent } from './ReportingModuleDetails/ReportingModuleDetails.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReportingModuleUsersComponent } from './ReportingModuleUsers/ReportingModuleUsers.component';
import { ReportingModulePopupComponent } from './ReportingModulePopup/ReportingModulePopup.component';

@NgModule({
  declarations: [
    ReportingModuleContainerComponent,
    ReportingModuleListComponent,
    ReportingModuleDetailsComponent,
    ReportingModuleUsersComponent,
    ReportingModulePopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ReportRoutingModule,
    DragDropModule
  ]
})
export class ReportModule { }
