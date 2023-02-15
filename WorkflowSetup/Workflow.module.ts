import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/services/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WorkflowLandingComponent } from './WorkflowLanding/WorkflowLanding.component';
import { WorkflowRoutingModule } from './WorkflowRouting.module';
import { CopyWorkflowComponent } from './CopyWorkflow/CopyWorkflow.component';

@NgModule({
  declarations: [
    WorkflowLandingComponent,
    CopyWorkflowComponent
  ],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class WorkflowSetupModule { }
