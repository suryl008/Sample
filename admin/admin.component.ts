import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  constructor(private route : Router){

  }

  @ViewChild('menuListPaginator') menuListPaginator: MatPaginator;
  @ViewChild('employeeMapPaginator') employeeMapPaginator: MatPaginator;

  public activeMenu: boolean = false;
  public userRoleList: any = [];
  public roleAndMenuMapping: any = [];
  public intialRoleAndMenuMapping: any = [];
  public employeeRoleMapping: any = [];
  public intialEmployeeRoleMapping: any = [];

  public selectedRole: number = 0;

  public displayedRoleMenuColumns = ['menuName', 'isActive', 'isAddorDelete'];
  public displayedEmployeeMapColumns = ['employeeName', 'roleId'];


  ngOnInit() {
    this.getUserRoleList();
    this.showMenu('menu');
  }

  showMenu(mapName) {
    this.activeMenu = mapName == 'emp';
    if (this.activeMenu) {
      this.selectedRole = 0;
      this.getEmployeeMappingList();
    } else {
      this.selectedRole = this.userRoleList.length > 0 ? this.userRoleList[0].id : 0;
      this.getMenuList();
    }
  }

  getUserRoleList() {
    this.userRoleList = [
      { id: 1, itemName: 'Admin' },
      { id: 2, itemName: 'Employee Role' },
    ]
  }

  getMenuList() {
    let data = [
      { mappingId: 1, roleId: 1, menuId: 1, menuName: 'Admin', isActive: true, isAddorDelete: true },
      { mappingId: 1, roleId: 1, menuId: 1, menuName: 'Admin1', isActive: true, isAddorDelete: true },
      { mappingId: 1, roleId: 1, menuId: 1, menuName: 'Admin2', isActive: true, isAddorDelete: true },
    ]
    this.intialRoleAndMenuMapping = JSON.parse(JSON.stringify(data));
    this.roleAndMenuMapping = new MatTableDataSource(data);
    setTimeout(() => this.roleAndMenuMapping.paginator = this.menuListPaginator);
  }

  getEmployeeMappingList() {
    let data = [
      { userId: 1, roleId: 1, employeeName: 'Test-1', role: 'Admin' },
      { userId: 2, roleId: 1, employeeName: 'Test-2', role: 'Admin' },
      { userId: 3, roleId: 1, employeeName: 'Test-3', role: 'Admin' },
    ]
    this.intialEmployeeRoleMapping = JSON.parse(JSON.stringify(data));
    this.employeeRoleMapping = new MatTableDataSource(data);
    setTimeout(() => this.employeeRoleMapping.paginator = this.employeeMapPaginator);
  }

  checkManuMappingData() {
    return JSON.stringify(this.intialRoleAndMenuMapping) != JSON.stringify(this.roleAndMenuMapping.filteredData)
  }

  checkEmployeeMappingData() {
    return JSON.stringify(this.intialEmployeeRoleMapping) != JSON.stringify(this.employeeRoleMapping.filteredData)
  }

  checkSubmitButton() {
    return false
  }

  selectedUserRole(role, event, pageName?) {
    if (event.isUserInput) {
      this.selectedRole = role.id;
      if(pageName == 'menu'){
        this.getMenuList();
      }
    }
  }

  saveNewEmployee() {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.employeeRoleMapping.filter = filterValue.trim().toLowerCase();
  }

  saveMenuorEmpMapping() {
    if(this.activeMenu){
      //EMPLOYEE MAPPING SAVE
      console.log(this.intialEmployeeRoleMapping, this.employeeRoleMapping.filteredData);
    }else{
      //MENU MAPPING SAVE
      console.log(this.intialRoleAndMenuMapping, this.roleAndMenuMapping.filteredData)
    }
  }




}
