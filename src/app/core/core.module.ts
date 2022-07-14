import { NotFoundPageComponent } from './../pages/not-found-page/not-found-page.component';
import { LandingComponent } from './../pages/landing/landing.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { FooterComponent } from './components/layout/footer/footer.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    LandingComponent,
    NotFoundPageComponent,
  ],
  imports: [CommonModule, AutocompleteLibModule, CoreRoutingModule],
  exports: [HeaderComponent, FooterComponent, LandingComponent],
})
export class CoreModule {}
