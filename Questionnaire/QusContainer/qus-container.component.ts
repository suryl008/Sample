import { Component } from '@angular/core';

@Component({
  selector: 'app-qus-container',
  templateUrl: './qus-container.component.html',
  styleUrls: ['./qus-container.component.scss']
})
export class QusContainerComponent {

  public headerMenu: any = [];
  public selectedIndex: number = 0;
  public selectedPage: string = 'search';
  public selectedQuestionnaire: any;
  public selectedSection: any;

  constructor() { }

  ngOnInit() {
    this.headerMenu = [
      { tabHeaderName: 'Search', visible: true, selectedPage: 'search' },
      { tabHeaderName: 'Questionnaires', visible: true, selectedPage: 'questionnaires' },
      { tabHeaderName: 'Sections', visible: true, selectedPage: 'section' },
      { tabHeaderName: 'Fields', visible: true, selectedPage: 'field' },
    ]
    this.selectedIndex = 0;
    this.selectedPage = 'search'
  }

  getHeaderTabSelection(event) {
    this.selectedPage = event;
  }

  emitSelectedQuestionnaire(event) {
    this.selectedPage = event.selectedPage;
    this.selectedQuestionnaire = event?.data;
    this.headerMenu.forEach((x, i) => {
      x.visible = event?.showDetails == false && i != 0 ? false : true;
    })

    this.selectedIndex = this.headerMenu.findIndex(object => {
      return object.selectedPage === this.selectedPage;
    });
  }

  emitSelectedSection(event:any){
    console.log(event)
    this.selectedPage = event.selectedPage;
    this.selectedSection = event?.data;
    this.selectedIndex = this.headerMenu.findIndex(object => {
      return object.selectedPage === this.selectedPage;
    });
  }


}
