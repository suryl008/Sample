import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserSecurityRoutingModule } from './UserSecurityRouting.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserSecurityLandingComponent } from './UserSecurityLanding/UserSecurityLanding.component';
import { GEMSUserSearchComponent } from './GEMSUserSearch/GEMSUserSearch.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CTEUserComponent } from './CTEUser/cteuser.component';

@NgModule({
  declarations: [
    UserSecurityLandingComponent,
    GEMSUserSearchComponent,
    CTEUserComponent
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
