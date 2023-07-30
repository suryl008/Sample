import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/services/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { EnhancedFlexFormRoutingModule } from './EnhancedFlexFormRouting.module';
import { EnhancedFlexFormSearchComponent } from './EnhancedFlexFormSearch/EnhancedFlexFormSearch.component';
import { EnhancedFlexFormContainerComponent } from './EnhancedFlexFormContainer/EnhancedFlexFormContainer.component';
import { EnhancedFlexFormDetailsComponent } from './EnhancedFlexFormDetails/EnhancedFlexFormDetails.component';
import { EnhancedFlexFormPopupComponent } from './EnhancedFlexFormPopup/EnhancedFlexFormPopup.component';
import { EnhancedFlexFormListComponent } from './EnhancedFlexFormList/EnhancedFlexFormList.component';

@NgModule({
  declarations: [
    EnhancedFlexFormSearchComponent,
    EnhancedFlexFormContainerComponent,
    EnhancedFlexFormDetailsComponent,
    EnhancedFlexFormPopupComponent,
    EnhancedFlexFormListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    EnhancedFlexFormRoutingModule,
  ]
})
export class EnhancedFlexFormModule { }
