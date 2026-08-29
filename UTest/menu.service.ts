import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface MenuItem {
  menuId: number;
  menuName: string;
  menuCode: string;
  redirectUrl: string;
  subMenu: boolean;
  parentMenuId: number;
  sortOrder: number;
  children?: MenuItem[];
}

@Injectable({
  providedIn: "root",
})
export class MenuService {
  private apiUrl = "api/menu"; // Your API endpoint

  constructor(private http: HttpClient) {}

  getConsolidatedReviewMenu(): Observable<MenuItem[]> {
    return this.http
      .get<any[]>("api/GetUserMenuDetails")
      .pipe(map((menus) => this.buildMenuHierarchy(menus)));
  }

  private buildMenuHierarchy(menus: any[]): MenuItem[] {
    // Find Consolidated Review menu (MenuID: 25)
    const consolidatedReview = menus.find((m) => m.menuId === 25);
    if (!consolidatedReview) return [];

    // Get all items with parentMenuId = 25
    const consolidatedItems = menus.filter((m) => m.parentMenuId === 25);

    // Build hierarchy
    return consolidatedItems.map((item) => ({
      menuId: item.menuId,
      menuName: item.menuName,
      menuCode: item.menuCode,
      redirectUrl: item.redirectUrl,
      subMenu: item.subMenu,
      parentMenuId: item.parentMenuId,
      sortOrder: item.sortOrder,
      children: menus.filter((child) => child.parentMenuId === item.menuId),
    }));
  }

  getMenuByCode(menuCode: string): Observable<MenuItem | null> {
    return this.getConsolidatedReviewMenu().pipe(
      map((menus) => {
        const allItems = this.flattenMenu(menus);
        return allItems.find((item) => item.menuCode === menuCode) || null;
      }),
    );
  }

  private flattenMenu(menus: MenuItem[]): MenuItem[] {
    let result: MenuItem[] = [];
    menus.forEach((menu) => {
      result.push(menu);
      if (menu.children) {
        result = result.concat(this.flattenMenu(menu.children));
      }
    });
    return result;
  }
}
