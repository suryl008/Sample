import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TimesPipe } from './times.pipe';
import { RowColSelectorComponent } from './rowcolSelectorComponent/rowcol.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, RowColSelectorComponent, TimesPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
