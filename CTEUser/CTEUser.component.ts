import { Component } from '@angular/core';

@Component({
  selector: 'app-cteuser',
  templateUrl: './CTEUser.component.html',
  styleUrls: ['./CTEUser.component.css']
})
export class CTEUserComponent {

  public cepdList: any = [];
  public selectedRCEPDId: any;
  public cepdAdminList : any = [];
  public buildingList : any = [];
  public displayedColumns : any = [];
  public selectedIndex: number;
  public showSpinner: boolean = false;



  ngOnInit() {
    try {
      this.selectedIndex = 1;
      this.displayedColumns= [
        "user",
        "psNo",
        "action",
      ];
      this.getCEPDList();
      this.getBuildingList();
    } catch (error) {
    }
  }

  getCEPDList() {
    try {
      this.cepdList = [
        { id: 1, itemName: 'List1' },
        { id: 2, itemName: 'List2' },
      ]
    } catch (error) {
    }
  }

  getBuildingList(){
    try {

      this.cepdAdminList = [
        {
          user : 'XTZ',
          isSaved : true
        }
      ]
      this.buildingList = [
        {
          buildingName : "Building 1",
          buildingUsers : [],
          buildingTeachers : [],
        },
        {
          buildingName : "Building 2",
          buildingUsers : [],
          buildingTeachers : [],
        }
      ]
    } catch (error) {
      
    }
  }

  selectedCEPDList(role, event) {
    try {
      if (event.isUserInput) {
        this.selectedRCEPDId = role.id;
      }
    } catch (error) {

    }
  }

}
