import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DynamicEditableTableComponent } from './dynamic-editable-table/dynamic-editable-table.component';
import { MsWordTablePopupComponent } from './ms-word-table-popup/ms-word-table-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    DynamicEditableTableComponent,
    MsWordTablePopupComponent,
  ],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
