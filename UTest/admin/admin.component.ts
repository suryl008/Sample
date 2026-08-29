import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { forkJoin, of } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  switchMap,
  tap,
} from "rxjs/operators";
import { AdminUserLog } from "src/app/pages/program-administration/models/admin-user-log.model";
import {
  AdminMenuItem,
  ProgramAdministrationService,
  UserInfoDto,
} from "src/app/shared/services/program-administration.service";

export type AdminMappingMode = "role" | "user";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
  standalone: false,
})
export class AdminComponent implements OnInit {
  @ViewChild("paginator") paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<AdminMenuItem>;
  @ViewChild("editBtn", { read: ElementRef }) editBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild("saveBtn", { read: ElementRef }) saveBtn?: ElementRef<HTMLButtonElement>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly menuColumns = [
    "reorder",
    "menuName",
    "menuCode",
    "parentMenuId",
    "sortOrder",
    "activeMenu",
  ];

  userRoleList: any[] = [];
  filteredUsers: UserInfoDto[] = [];
  currentUser: AdminUserLog | null = null;

  selectedRole = "AADM";
  selectedUser: UserInfoDto | null = null;
  mappingMode: AdminMappingMode = "role";
  userSearchCtrl = new FormControl<string | UserInfoDto>("");
  minLengthTerm = 2;
  isUserLoading = false;
  isMenuLoading = false;
  isSaving = false;
  isMenuEdit = false;

  dataSource = new MatTableDataSource<AdminMenuItem>([]);
  initialData: AdminMenuItem[] = [];
  displayedColumns = [...this.menuColumns, "roleActive", "roleEdit"];
  readonly paginatorSelectConfig = { panelClass: "admin-paginator-panel" };

  readonly displayUser = (user: UserInfoDto | string | null): string => {
    if (!user) {
      return "";
    }
    if (typeof user === "string") {
      return user;
    }
    return user.displayName || user.userName || `User ${user.userId}`;
  };

  constructor(
    private programAdminService: ProgramAdministrationService,
    private toastr: ToastrService,
  ) {}

  get selectedUserId(): number | null {
    return this.selectedUser?.userId ?? null;
  }

  get isUserMode(): boolean {
    return this.mappingMode === "user" && this.selectedUserId != null;
  }

  get currentUserLabel(): string {
    if (!this.currentUser) {
      return "";
    }
    const name =
      this.currentUser.fullName ||
      this.currentUser.userName ||
      `User ${this.currentUser.userId}`;
    return this.currentUser.userRole
      ? `${name} (${this.currentUser.userRole})`
      : name;
  }

  get mappingHint(): string {
    if (this.mappingMode === "user") {
      if (this.selectedUser) {
        return `User-level overrides for ${this.displayUser(this.selectedUser)}. Type at least ${this.minLengthTerm} characters to search another user.`;
      }
      return `Search and select a user to load their menu permissions. Type at least ${this.minLengthTerm} characters to search.`;
    }
    return "Role-level defaults for the selected role.";
  }

  get tableCaption(): string {
    if (this.mappingMode === "user") {
      if (this.selectedUser) {
        return `Menu permissions for ${this.displayUser(this.selectedUser)}`;
      }
      return "Menu permissions for a selected user";
    }
    return `Menu permissions for role ${this.selectedRole || "the selected role"}`;
  }

  get liveStatus(): string {
    if (this.isSaving) {
      return "Saving menu changes";
    }
    if (this.isMenuLoading) {
      return "Loading menus";
    }
    if (this.isUserLoading) {
      return "Searching users";
    }
    const value = this.userSearchCtrl.value;
    const term = typeof value === "string" ? value.trim() : "";
    if (term.length > 0 && term.length < this.minLengthTerm) {
      return `Type at least ${this.minLengthTerm} characters to search users`;
    }
    if (term.length >= this.minLengthTerm && this.filteredUsers.length === 0) {
      return "No matching users";
    }
    return "";
  }

  ngOnInit(): void {
    this.currentUser = this.programAdminService.getUserDetails() || null;
    this.bindUserSearch();
    this.loadUserRoles();
    this.loadMenuData();
  }

  onMappingModeChange(mode: AdminMappingMode): void {
    if (this.mappingMode === mode) {
      return;
    }
    if (this.isMenuEdit) {
      this.cancelMenu();
    }
    this.mappingMode = mode;
    this.selectedUser = null;
    this.userSearchCtrl.setValue("", { emitEvent: false });
    this.filteredUsers = [];
    this.refreshColumns();
    if (mode === "role") {
      this.loadMenuData();
      return;
    }
    this.applyMenuRows([]);
    this.initialData = [];
    this.attachPaginator();
    this.toastr.info("Search and select a user to edit user-level permissions");
  }

  onRoleChange(): void {
    if (this.isMenuEdit) {
      this.cancelMenu();
    }
    this.loadMenuData();
  }

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as UserInfoDto;
    if (!user?.userId) {
      return;
    }
    this.selectedUser = user;
    this.mappingMode = "user";
    if (user.userRole) {
      this.selectedRole = user.userRole;
    }
    this.refreshColumns();
    this.loadMenuData();
  }

  onUserSearchFocus(): void {
    const value = this.userSearchCtrl.value;
    if (typeof value === "object" && value?.userId) {
      return;
    }
    this.searchUsers(typeof value === "string" ? value : "");
  }

  clearSelectedUser(): void {
    this.selectedUser = null;
    this.userSearchCtrl.setValue("", { emitEvent: false });
    this.filteredUsers = [];
    this.refreshColumns();
    if (this.mappingMode === "role") {
      this.loadMenuData();
      return;
    }
    this.applyMenuRows([]);
    this.initialData = [];
    this.attachPaginator();
  }

  editMenu(): void {
    if (this.mappingMode === "user" && !this.selectedUserId) {
      this.toastr.info("Select a user before editing user-level permissions");
      return;
    }
    this.isMenuEdit = true;
    this.dataSource.paginator = null;
    this.focusControl(this.saveBtn);
  }

  cancelMenu(): void {
    this.isMenuEdit = false;
    this.applyMenuRows(JSON.parse(JSON.stringify(this.initialData)));
    this.attachPaginator();
    this.focusControl(this.editBtn);
  }

  canMoveMenu(item: AdminMenuItem, delta: -1 | 1): boolean {
    const siblings = this.siblingsOf(item);
    const index = siblings.findIndex((row) => row.menuId === item.menuId);
    const next = index + delta;
    return index >= 0 && next >= 0 && next < siblings.length;
  }

  moveAriaLabel(item: AdminMenuItem, delta: -1 | 1): string {
    const direction = delta < 0 ? "up" : "down";
    const name = item.menuName || "menu";
    if (!this.isMenuEdit) {
      return `Move ${name} ${direction}. Choose Edit to reorder.`;
    }
    if (!this.canMoveMenu(item, delta)) {
      return `${name} cannot move ${direction}`;
    }
    return `Move ${name} ${direction}`;
  }

  moveMenu(item: AdminMenuItem, delta: -1 | 1, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (!this.isMenuEdit || !this.canMoveMenu(item, delta)) {
      return;
    }

    const siblings = this.siblingsOf(item);
    const from = siblings.findIndex((row) => row.menuId === item.menuId);
    this.placeAmongSiblings(item, this.parentKey(item), from + delta);
  }

  onMenuDrop(event: CdkDragDrop<AdminMenuItem[]>): void {
    if (!this.isMenuEdit) {
      return;
    }

    const data = this.dataSource.data;
    const dragged = (event.item.data as AdminMenuItem) || data[event.previousIndex];
    const target = data[event.currentIndex];
    if (!dragged || !target || dragged.menuId === target.menuId) {
      return;
    }
    if (this.isInSubtree(dragged, target, data)) {
      this.toastr.info("A menu cannot be moved under itself");
      return;
    }

    if (this.parentKey(dragged) === this.parentKey(target)) {
      const owner = this.siblingOwningRow(this.parentKey(dragged), target, data);
      if (!owner) {
        return;
      }
      const to = this.siblingsOf(dragged).findIndex((row) => row.menuId === owner.menuId);
      this.placeAmongSiblings(dragged, this.parentKey(dragged), to);
      return;
    }

    if (this.hasChildRows(target, data)) {
      this.nestUnder(dragged, target);
      return;
    }

    this.adoptAsSibling(dragged, target);
  }

  saveMenuMapping(): void {
    const currentUserId = this.currentUser?.userId ?? 0;
    if (currentUserId <= 0) {
      this.toastr.error("A logged-in user is required to save permissions");
      return;
    }

    const originalById = new Map(this.initialData.map((row) => [row.menuId, row]));
    const definitionRows = this.dataSource.data.filter((row) =>
      this.isDefinitionChange(row, originalById.get(row.menuId)),
    );
    const permissionRows = this.dataSource.data.filter((row) =>
      this.isPermissionChange(row, originalById.get(row.menuId)),
    );

    if (definitionRows.length === 0 && permissionRows.length === 0) {
      this.toastr.info("No changes detected");
      this.isMenuEdit = false;
      this.attachPaginator();
      this.focusControl(this.editBtn);
      return;
    }

    if (this.mappingMode === "user" && permissionRows.length > 0 && !this.selectedUserId) {
      this.toastr.info("Select a user before saving user-level permissions");
      return;
    }

    const requests = [];
    if (definitionRows.length > 0) {
      requests.push(this.programAdminService.saveMenus(definitionRows, currentUserId));
    }
    if (permissionRows.length > 0 && this.mappingMode === "user" && this.selectedUserId) {
      requests.push(
        this.programAdminService.saveUserMenus(this.selectedUserId, permissionRows, currentUserId),
      );
    } else if (permissionRows.length > 0) {
      requests.push(
        this.programAdminService.saveRoleMenus(this.selectedRole, permissionRows, currentUserId),
      );
    }

    this.isSaving = true;
    forkJoin(requests)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          const parts: string[] = [];
          if (definitionRows.length > 0) {
            parts.push("menu order");
          }
          if (permissionRows.length > 0) {
            parts.push(this.mappingMode === "user" ? "user permissions" : "role permissions");
          }
          this.toastr.success(`${this.capitalize(parts.join(" and "))} updated`);
          this.isMenuEdit = false;
          this.loadMenuData();
          this.focusControl(this.editBtn);
        },
        error: (err) => {
          console.error("Save menu mapping failed", err);
          this.toastr.error(this.readErrorMessage(err, "Unable to save menu changes"));
        },
      });
  }

  private bindUserSearch(): void {
    this.userSearchCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300),
        distinctUntilChanged(
          (prior, next) => this.normalizeSearch(prior) === this.normalizeSearch(next),
        ),
        tap((value) => {
          if (typeof value === "string" && this.selectedUser) {
            this.selectedUser = null;
            this.refreshColumns();
            this.applyMenuRows([]);
            this.initialData = [];
          }
        }),
        filter((value): value is string => typeof value === "string"),
        switchMap((term) => this.searchUsers$(term)),
      )
      .subscribe((users) => {
        this.filteredUsers = users;
      });
  }

  private searchUsers(term: string): void {
    this.searchUsers$(term)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
        this.filteredUsers = users;
      });
  }

  private searchUsers$(term: string) {
    const search = (term || "").trim();
    if (search.length > 0 && search.length < this.minLengthTerm) {
      this.filteredUsers = [];
      this.isUserLoading = false;
      return of([] as UserInfoDto[]);
    }

    this.isUserLoading = true;
    return this.programAdminService.getAllUsers(search).pipe(
      catchError((err) => {
        console.error("GetAllUsers failed", err);
        this.toastr.error("Unable to search users");
        return of([] as UserInfoDto[]);
      }),
      finalize(() => {
        this.isUserLoading = false;
      }),
    );
  }

  private loadUserRoles(): void {
    this.programAdminService.getAllUserRoles().subscribe({
      next: (res) => {
        this.userRoleList = res || [];
      },
      error: (err) => {
        console.error("GetAllUserRoles failed", err);
        this.toastr.error("Unable to load user roles");
      },
    });
  }

  private loadMenuData(): void {
    this.refreshColumns();
    if (this.mappingMode === "user" && !this.selectedUserId) {
      this.applyMenuRows([]);
      this.initialData = [];
      this.attachPaginator();
      return;
    }

    const roleCode =
      this.mappingMode === "user"
        ? this.selectedUser?.userRole || this.selectedRole
        : this.selectedRole;
    this.isMenuLoading = true;
    this.programAdminService
      .getAdminMenus(roleCode, this.mappingMode === "user" ? this.selectedUserId : null)
      .pipe(finalize(() => (this.isMenuLoading = false)))
      .subscribe({
        next: (res) => {
          const rows = this.rebuildTreeOrder(JSON.parse(JSON.stringify(res || [])));
          this.initialData = JSON.parse(JSON.stringify(rows));
          this.applyMenuRows(rows);
          this.attachPaginator();
        },
        error: (err) => {
          console.error("GetAdminMenus failed", err);
          this.toastr.error("Unable to load menu permissions");
        },
      });
  }

  private refreshColumns(): void {
    this.displayedColumns = this.mappingMode === "user"
      ? [...this.menuColumns, "userActive", "userEdit"]
      : [...this.menuColumns, "roleActive", "roleEdit"];
  }

  private attachPaginator(): void {
    if (this.isMenuEdit) {
      this.dataSource.paginator = null;
      return;
    }
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  private focusControl(control?: ElementRef<HTMLButtonElement>): void {
    setTimeout(() => control?.nativeElement?.focus());
  }

  private applyMenuRows(rows: AdminMenuItem[]): void {
    this.dataSource.data = [...rows];
    this.table?.renderRows();
  }

  private parentKey(item: AdminMenuItem): number {
    const parent = Number(item.parentMenuId);
    return !parent ? 0 : parent;
  }

  private siblingsOf(item: AdminMenuItem, items: AdminMenuItem[] = this.dataSource.data): AdminMenuItem[] {
    const parent = this.parentKey(item);
    return items.filter((row) => this.parentKey(row) === parent);
  }

  private childrenOf(parentId: number, items: AdminMenuItem[] = this.dataSource.data): AdminMenuItem[] {
    return items.filter((row) => this.parentKey(row) === parentId);
  }

  private hasChildRows(item: AdminMenuItem, items: AdminMenuItem[]): boolean {
    return items.some((row) => this.parentKey(row) === item.menuId);
  }

  private isInSubtree(
    ancestor: AdminMenuItem,
    node: AdminMenuItem,
    items: AdminMenuItem[],
  ): boolean {
    const start = items.findIndex((row) => row.menuId === ancestor.menuId);
    if (start < 0) {
      return false;
    }
    const end = start + this.getSubtreeLength(items, start);
    const index = items.findIndex((row) => row.menuId === node.menuId);
    return index > start && index < end;
  }

  private siblingOwningRow(
    parentId: number,
    row: AdminMenuItem,
    items: AdminMenuItem[],
  ): AdminMenuItem | null {
    for (const sibling of this.childrenOf(parentId, items)) {
      if (sibling.menuId === row.menuId || this.isInSubtree(sibling, row, items)) {
        return sibling;
      }
    }
    return null;
  }

  private placeAmongSiblings(item: AdminMenuItem, parentId: number, toIndex: number): void {
    const siblings = this.childrenOf(parentId).filter((row) => row.menuId !== item.menuId);
    const bounded = Math.max(0, Math.min(toIndex, siblings.length));
    item.parentMenuId = parentId === 0 ? 0 : parentId;
    siblings.splice(bounded, 0, item);
    siblings.forEach((row, index) => {
      row.sortOrder = index + 1;
    });
    this.applyMenuRows(this.rebuildTreeOrder(this.dataSource.data));
  }

  private nestUnder(item: AdminMenuItem, parent: AdminMenuItem): void {
    const previousParent = this.parentKey(item);
    item.parentMenuId = parent.menuId;
    const children = this.childrenOf(parent.menuId).filter((row) => row.menuId !== item.menuId);
    children.push(item);
    children.forEach((row, index) => {
      row.sortOrder = index + 1;
    });
    this.renumberParent(previousParent);
    this.applyMenuRows(this.rebuildTreeOrder(this.dataSource.data));
  }

  private adoptAsSibling(item: AdminMenuItem, target: AdminMenuItem): void {
    const previousParent = this.parentKey(item);
    const nextParent = this.parentKey(target);
    const siblings = this.childrenOf(nextParent).filter((row) => row.menuId !== item.menuId);
    const targetIndex = siblings.findIndex((row) => row.menuId === target.menuId);
    item.parentMenuId = nextParent === 0 ? 0 : nextParent;
    siblings.splice(targetIndex < 0 ? siblings.length : targetIndex, 0, item);
    siblings.forEach((row, index) => {
      row.sortOrder = index + 1;
    });
    if (previousParent !== nextParent) {
      this.renumberParent(previousParent);
    }
    this.applyMenuRows(this.rebuildTreeOrder(this.dataSource.data));
  }

  private renumberParent(parentId: number): void {
    this.childrenOf(parentId).forEach((row, index) => {
      row.sortOrder = index + 1;
    });
  }

  private getSubtreeLength(data: AdminMenuItem[], index: number): number {
    const depth = data[index].depth;
    let length = 1;
    while (index + length < data.length && data[index + length].depth > depth) {
      length++;
    }
    return length;
  }

  private rebuildTreeOrder(items: AdminMenuItem[]): AdminMenuItem[] {
    const byParent = new Map<number, AdminMenuItem[]>();
    for (const item of items) {
      const key = this.parentKey(item);
      const group = byParent.get(key) || [];
      group.push(item);
      byParent.set(key, group);
    }
    for (const group of byParent.values()) {
      group.sort(
        (left, right) =>
          (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.menuId - right.menuId,
      );
    }

    const result: AdminMenuItem[] = [];
    const seen = new Set<number>();
    const walk = (parentId: number, depth: number) => {
      for (const item of byParent.get(parentId) || []) {
        if (seen.has(item.menuId)) {
          continue;
        }
        seen.add(item.menuId);
        item.depth = depth;
        result.push(item);
        walk(item.menuId, depth + 1);
      }
    };
    walk(0, 0);

    for (const item of items) {
      if (!seen.has(item.menuId)) {
        result.push(item);
      }
    }
    return result;
  }

  private isDefinitionChange(current: AdminMenuItem, original?: AdminMenuItem): boolean {
    if (!original) {
      return true;
    }
    return (
      current.menuName !== original.menuName ||
      current.menuCode !== original.menuCode ||
      current.parentMenuId !== original.parentMenuId ||
      current.sortOrder !== original.sortOrder ||
      current.activeMenu !== original.activeMenu ||
      current.redirectUrl !== original.redirectUrl ||
      current.menuType !== original.menuType
    );
  }

  private isPermissionChange(current: AdminMenuItem, original?: AdminMenuItem): boolean {
    if (!original) {
      return true;
    }
    if (this.mappingMode === "user") {
      return current.userActive !== original.userActive || current.userEdit !== original.userEdit;
    }
    return current.roleActive !== original.roleActive || current.roleEdit !== original.roleEdit;
  }

  private capitalize(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  private normalizeSearch(value: string | UserInfoDto | null): string {
    if (!value) {
      return "";
    }
    if (typeof value === "string") {
      return value.trim().toLowerCase();
    }
    return `id:${value.userId}`;
  }

  private readErrorMessage(err: any, fallback: string): string {
    if (typeof err?.error === "string" && err.error.trim()) {
      return err.error;
    }
    return err?.error?.message || fallback;
  }
}
