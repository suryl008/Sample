import { Component } from '@angular/core';
import { IUserSelection } from './user.selection';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public userSelection(selectedInfoEvent: IUserSelection): void {
    // console.log('event handled by parent component');
    console.log(JSON.stringify(selectedInfoEvent));
    console.log(`row selected - ${selectedInfoEvent.row}`);
    console.log(`col selected - ${selectedInfoEvent.col}`);
  }
}
