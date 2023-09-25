import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/services/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DirectorVisitContainerComponent } from './DirectorVisitContainer/DirectorVisitContainer.component';
import { DirectorVisitSearchComponent } from './DirectorVisitSearch/DirectorVisitSearch.component';
import { DirectorVisitDetailsComponent } from './DirectorVisitDetails/DirectorVisitDetails.component';
import { DirectorVisitPopupcomponent } from './DirectorVisitPopup/DirectorVisitPopup.component';
import { DirectorVisitRoutingModule } from './DirectorVisitRouting.module';



@NgModule({
  declarations: [
    DirectorVisitContainerComponent,
    DirectorVisitSearchComponent,
    DirectorVisitDetailsComponent,
    DirectorVisitPopupcomponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DirectorVisitRoutingModule,
  ]
})
export class DirectorVisitModule { }
