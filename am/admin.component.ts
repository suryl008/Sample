import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";

export interface AdminMenuItem {
  menuId: number;
  menuName: string;
  menuCode: string;
  parentMenuId: number | null;
  sortOrder: number | null;
  redirectUrl: string;
  activeMenu: boolean;
  menuType: "Standard" | "Tab";
  roleActive: boolean;
  roleEdit: boolean;
  userActive: boolean | null;
  userEdit: boolean | null;
  depth: number;
}

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  @ViewChild("paginator") paginator: MatPaginator;

  userRoleList: any[] = [];
  userList: any[] = [];
  tabConfigs: { id: string; title: string }[] = [];

  selectedRole: string = "AADM";
  selectedUserId: number | null = null;
  overrideRole: boolean = false;

  isMenuEdit: boolean = false;
  dataSource = new MatTableDataSource<AdminMenuItem>([]);
  initialData: AdminMenuItem[] = [];

  displayedColumns: string[] = [
    "menuName",
    "menuCode",
    "parentMenuId",
    "sortOrder",
    // "redirectUrl",
    // "menuType",
    "activeMenu",
    "roleActive",
    "roleEdit",
    "userActive",
    "userEdit",
  ];

  constructor(
    private programAdminService: ProgramAdministrationService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadUserRoles();
    this.loadUsers();
    this.loadTabConfigs();
    this.loadMenuData();
  }

  loadUserRoles() {
    this.programAdminService.getAllUserRoles().subscribe((res) => {
      this.userRoleList = res;
    });
  }

  loadUsers() {
    this.programAdminService.getAllUsers().subscribe((res) => {
      this.userList = res;
    });
  }

  loadTabConfigs() {
    this.programAdminService.getTabConfigs().subscribe((res) => {
      this.tabConfigs = res;
    });
  }

  loadMenuData() {
    this.programAdminService
      .getAdminMenus(this.selectedRole, this.selectedUserId)
      .subscribe((res) => {
        this.initialData = JSON.parse(JSON.stringify(res));
        this.dataSource.data = res;
        this.dataSource.paginator = this.paginator;
      });
  }

  onRoleChange() {
    this.selectedUserId = null;
    this.loadMenuData();
  }

  onUserChange() {
    this.loadMenuData();
  }

  editMenu() {
    this.isMenuEdit = true;
  }

  cancelMenu() {
    this.isMenuEdit = false;
    this.dataSource.data = JSON.parse(JSON.stringify(this.initialData));
  }

  saveMenuMapping() {
    const modifiedRows = this.dataSource.data.filter((row, index) => {
      return JSON.stringify(row) !== JSON.stringify(this.initialData[index]);
    });

    if (modifiedRows.length === 0) {
      this.toastr.info("No changes detected");
      this.isMenuEdit = false;
      return;
    }

    console.log(
      "Modified Rows:",
      modifiedRows,
      "Selected User ID:",
      this.selectedUserId,
      "Override Role:",
      this.overrideRole,
    );

    if (this.selectedUserId && this.overrideRole) {
      this.programAdminService
        .saveUserMenus(this.selectedUserId, modifiedRows)
        .subscribe(() => {
          this.toastr.success("User menu permissions updated");
          this.isMenuEdit = false;
          this.loadMenuData();
        });
    } else {
      this.programAdminService
        .saveRoleMenus(this.selectedRole, modifiedRows)
        .subscribe(() => {
          this.toastr.success("Role menu permissions updated");
          this.isMenuEdit = false;
          this.loadMenuData();
        });
    }
  }
}

// import { ToastrService } from "ngx-toastr";
// import { ProgramAdministrationService } from "src/app/shared/services/program-administration.service";
// import { HttpClient } from "@angular/common/http";
// import {
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
//   ViewChild,
// } from "@angular/core";
// import { MatDialog } from "@angular/material/dialog";
// import { MatPaginator } from "@angular/material/paginator";
// import { MatTable, MatTableDataSource } from "@angular/material/table";
// import { Router } from "@angular/router";

// @Component({
//   selector: "app-admin",
//   templateUrl: "./admin.component.html",
//   styleUrls: ["./admin.component.scss"],
// })
// export class AdminComponent {
//   constructor(
//     private programAdministrationService: ProgramAdministrationService,
//     private toastrService: ToastrService
//   ) {}

//   @ViewChild("menuListPaginator") menuListPaginator: MatPaginator;
//   // @ViewChild('employeeMapPaginator') employeeMapPaginator: MatPaginator;

//   //public activeMenu: boolean = false;
//   public userRoleList: any = [];
//   public roleAndMenuMapping: any = [];
//   public initialRoleAndMenuMapping: any = [];
//   // public employeeRoleMapping: any = [];
//   // public intialEmployeeRoleMapping: any = [];

//   public menuList = [];
//   userDetails: any;

//   public selectedRole: string = "AADM";
//   public displayedRoleMenuColumns = [
//     "menuId",
//     "menuName",
//     "subMenu",
//     "parentMenuId",
//     "sortOrder",
//     "active",
//     "edit",
//   ];
//   public isMenuEdit: boolean = false;
//   //public displayedEmployeeMapColumns = ['employeeName', 'roleId'];

//   ngOnInit() {
//     this.userDetails = this.programAdministrationService.getUserDetails();
//     this.getUserRoleList();
//     this.getMenuList();
//   }

//   // showMenu(mapName) {
//   //   this.activeMenu = mapName == 'emp';
//   //   if (this.activeMenu) {
//   //     this.selectedRole = 0;
//   //     this.getEmployeeMappingList();
//   //   } else {
//   //     this.selectedRole = this.userRoleList.length > 0 ? this.userRoleList[0].id : 0;
//   //     this.getMenuList();
//   //   }
//   // }

//   getUserRoleList() {
//     this.programAdministrationService
//       .getAllUserRoles()
//       .subscribe((res: any) => {
//         if (res != null) {
//           this.userRoleList = res;
//         }
//       });
//   }

//   getMenuList() {
//     this.programAdministrationService.getAllMenus().subscribe((res: any) => {
//       if (res != null) {
//         this.menuList = res;
//         this.getUserMenuList();
//       }
//     });
//   }

//   getUserMenuList() {
//     this.programAdministrationService
//       .getUserMenuDetails(this.selectedRole)
//       .subscribe((res: any) => {
//         if (res != null) {
//           let resData = [];
//           resData = res;
//           let roleMappingArray = [];
//           this.menuList.forEach((element) => {
//             if (resData.filter((x) => x.menuId == element.menuId).length > 0) {
//               let menuDetails = resData.filter(
//                 (x) => x.menuId == element.menuId
//               )[0];
//               roleMappingArray.push({
//                 mappingId: menuDetails.mappingId,
//                 userRole: menuDetails.userRole,
//                 menuId: menuDetails.menuId,
//                 active: menuDetails.active,
//                 edit: menuDetails.edit,
//                 menuName: element.name,
//                 activeMenu: element.active,
//                 subMenu: element.subMenu,
//                 parentMenuId: element.parentMenuId,
//                 sortOrder: element.sortOrder,
//                 modifiedBy: this.userDetails?.userId,
//                 modifyDate: new Date(),
//               });
//             } else {
//               roleMappingArray.push({
//                 mappingId: 0,
//                 userRole: this.selectedRole,
//                 menuId: element.menuId,
//                 active: false,
//                 edit: false,
//                 menuName: element.name,
//                 activeMenu: element.active,
//                 subMenu: element.subMenu,
//                 parentMenuId: element.parentMenuId,
//                 sortOrder: element.sortOrder,
//                 createdBy: this.userDetails?.userId,
//                 createDate: new Date(),
//               });
//             }
//           });
//           this.initialRoleAndMenuMapping = JSON.parse(
//             JSON.stringify(roleMappingArray)
//           );
//           this.roleAndMenuMapping = new MatTableDataSource(roleMappingArray);
//           setTimeout(
//             () => (this.roleAndMenuMapping.paginator = this.menuListPaginator)
//           );
//         }
//       });
//   }

//   // getEmployeeMappingList() {
//   //   let data = [
//   //     { userId: 1, roleId: 1, employeeName: 'Test-1', role: 'Admin' },
//   //     { userId: 2, roleId: 1, employeeName: 'Test-2', role: 'Admin' },
//   //     { userId: 3, roleId: 1, employeeName: 'Test-3', role: 'Admin' },
//   //   ]
//   //   this.intialEmployeeRoleMapping = JSON.parse(JSON.stringify(data));
//   //   this.employeeRoleMapping = new MatTableDataSource(data);
//   //   setTimeout(() => this.employeeRoleMapping.paginator = this.employeeMapPaginator);
//   // }

//   checkManuMappingData() {
//     return (
//       JSON.stringify(this.initialRoleAndMenuMapping) !=
//       JSON.stringify(this.roleAndMenuMapping.filteredData)
//     );
//   }

//   // checkEmployeeMappingData() {
//   //   return JSON.stringify(this.intialEmployeeRoleMapping) != JSON.stringify(this.employeeRoleMapping.filteredData)
//   // }

//   // checkSubmitButton() {
//   //   return false
//   // }

//   selectedUserRole(role, event) {
//     if (event.isUserInput) {
//       this.selectedRole = role.refCode;
//       this.getMenuList();
//     }
//   }

//   // saveUsers(data: any) {
//   //   this.programAdministrationService.saveAdminUserDetails(data).subscribe(
//   //     (res: any) => {
//   //       this.selectedRole = "";
//   //       this.toastrService.success(
//   //         "",
//   //         "The record has been updated successfully"
//   //       );
//   //     },
//   //     (error) => {}
//   //   );
//   // }

//   saveMenuMapping() {
//     const modifiedRows = this.roleAndMenuMapping?.data?.filter(
//       (currentRow, index) => {
//         const originalRow = this.initialRoleAndMenuMapping[index];
//         return JSON.stringify(currentRow) != JSON.stringify(originalRow);
//       }
//     );

//     console.log(modifiedRows);

//     if (modifiedRows.length > 0) {
//       this.programAdministrationService
//         .saveUserRoleMenu(modifiedRows)
//         .subscribe(
//           (res: any) => {
//             this.getMenuList();
//             this.isMenuEdit = false;
//             setTimeout(() => {
//               window.location.reload();
//             }, 2000);
//             this.toastrService.success(
//               "",
//               "The record has been updated successfully"
//             );
//           },
//           (error) => {}
//         );
//     }
//   }

//   editMenu() {
//     this.isMenuEdit = !this.isMenuEdit;
//   }

//   cancelMenu() {
//     this.getUserMenuList();
//     this.isMenuEdit = !this.isMenuEdit;
//   }
// }
