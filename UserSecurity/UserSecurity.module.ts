import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserSecurityRoutingModule } from './UserSecurityRouting.module';
import { SharedModule } from 'src/app/shared/services/shared.module';
import { UserSecurityLandingComponent } from './UserSecurityLanding/UserSecurityLanding.component';
import { GEMSUserSearchComponent } from './GEMSUserSearch/GEMSUserSearch.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    UserSecurityLandingComponent,
    GEMSUserSearchComponent,
  ],
  imports: [
    CommonModule,
    UserSecurityRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class UserSecurityModule { }
