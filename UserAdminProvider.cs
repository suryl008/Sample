
using Demo.Entities;
using Demo.Repository.Interfaces.UnitOfWork;
using Demo.Services.Interfaces.Providers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace Demo.Services.Providers
{
    public class UserAdminProvider : IUserAdminProvider
    {
        private const int DefaultUserPreviewCount = 25;
        private const int MaxUserSearchResults = 50;

        private readonly IDemoUnitOfWork _unitOfWork;
        private readonly ILogger<UserAdminProvider> _logger;
        private readonly string _jsonDataPath;
        
        public UserAdminProvider(IDemoUnitOfWork unitOfWork, ILogger<UserAdminProvider> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _jsonDataPath = @"D:\AngularClientApp\src\assets\api-data\ConsolidatedReview\";
        }

        // Existing: Get all menus for admin (flat list)
        public IEnumerable<MenuList> GetAllMenus()
        {
            return _unitOfWork.Repository<MenuList>().Entity()
                .Select(x => new MenuList()
                {
                    MenuId = x.MenuId,
                    Code = x.Code,
                    Name = x.Name,
                    SubMenu = x.SubMenu,
                    ParentMenuId = x.ParentMenuId,
                    SortOrder = x.SortOrder,
                    Active = x.Active,
                    RedirectUrl = x.RedirectUrl,
                    ActiveMenu = x.ActiveMenu,
                    MenuType = x.MenuType
                })
                .OrderBy(x => x.SortOrder)
                .ToList();
        }

        // Existing: Get user roles
        public IQueryable<RefDatum> GetAllUserRoles()
        {
            return _unitOfWork.Repository<RefDatum>().Entity()
                .Where(x => x.RefType == "ROL" && x.RefSubType == "000000")
                .Select(x => new RefDatum()
                {
                    RefType = x.RefType,
                    RefSubType = x.RefSubType,
                    RefCode = x.RefCode,
                    RefDesc = x.RefDesc,
                    RefAddlInfo = x.RefAddlInfo,
                });
        }

        // Existing: Get role-menu mappings (for admin grid) - updated to include MenuType
        public IEnumerable<RoleMenuMapping> GetUserMenuDetails(string userRole)
        {
            var result = _unitOfWork.Repository<RoleMenuMapping>().Entity()
                .Where(x => x.UserRole == userRole)
                .Join(_unitOfWork.Repository<MenuList>().Entity().Where(x => x.Active),
                    ri => ri.MenuId,
                    rt => rt.MenuId,
                    (ri, rt) => new RoleMenuMapping()
                    {
                        MappingId = ri.MappingId,
                        UserRole = ri.UserRole ?? string.Empty,
                        MenuId = ri.MenuId,
                        Active = ri.Active,
                        Edit = ri.Edit,
                        // Extended properties (not in entity but used for DTO)
                        MenuCode = rt.Code,
                        MenuName = rt.Name,
                        ActiveMenu = rt.Active,
                        RedirectUrl = rt.RedirectUrl,
                        SubMenu = rt.SubMenu,
                        ParentMenuId = rt.ParentMenuId ?? 0,
                        SortOrder = rt.SortOrder ?? 0,
                        MenuType = rt.MenuType   // new
                    })
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.MenuId)
                .ToList();

            return result;
        }

        // Existing: Save role-menu mappings (updated to handle MenuType)
        public IEnumerable<RoleMenuMapping> SaveUserRoleMenu(List<RoleMenuMapping> roleMenuEntities)
        {
            try
            {
                foreach (var roleMenuEntity in roleMenuEntities)
                {
                    var isNewEntity = roleMenuEntity.MappingId <= 0;

                    if (isNewEntity)
                    {
                        _unitOfWork.Repository<RoleMenuMapping>().Add(roleMenuEntity);
                        if (roleMenuEntity.MenuId > 0)
                        {
                            var dbMenuEntity = _unitOfWork.Repository<MenuList>().Entity()
                                .FirstOrDefault(r => r.MenuId == roleMenuEntity.MenuId);
                            if (dbMenuEntity != null)
                            {
                                dbMenuEntity.Active = roleMenuEntity.ActiveMenu;
                                dbMenuEntity.Name = roleMenuEntity.MenuName;
                                dbMenuEntity.SubMenu = roleMenuEntity.SubMenu;
                                dbMenuEntity.ParentMenuId = roleMenuEntity.ParentMenuId;
                                dbMenuEntity.SortOrder = roleMenuEntity.SortOrder;
                                dbMenuEntity.MenuType = roleMenuEntity.MenuType;   // new
                                dbMenuEntity.ModifiedBy = roleMenuEntity.ModifiedBy;
                                dbMenuEntity.ModifyDate = roleMenuEntity.ModifyDate;
                            }
                        }
                    }
                    else
                    {
                        try
                        {
                            var dbEntity = _unitOfWork.Repository<RoleMenuMapping>().Entity(x => x.Menu)
                                .FirstOrDefault(x => x.MappingId == roleMenuEntity.MappingId);

                            if (dbEntity != null && dbEntity.Menu != null)
                            {
                                dbEntity.Active = roleMenuEntity.Active;
                                dbEntity.Edit = roleMenuEntity.Edit;
                                dbEntity.ModifiedBy = roleMenuEntity.ModifiedBy;
                                dbEntity.ModifyDate = roleMenuEntity.ModifyDate;

                                dbEntity.Menu.Active = roleMenuEntity.ActiveMenu;
                                dbEntity.Menu.Name = roleMenuEntity.MenuName;
                                dbEntity.Menu.SubMenu = roleMenuEntity.SubMenu;
                                dbEntity.Menu.ParentMenuId = roleMenuEntity.ParentMenuId;
                                dbEntity.Menu.SortOrder = roleMenuEntity.SortOrder;
                                dbEntity.Menu.MenuType = roleMenuEntity.MenuType;   // new
                                dbEntity.Menu.ModifiedBy = roleMenuEntity.ModifiedBy;
                                dbEntity.Menu.ModifyDate = roleMenuEntity.ModifyDate;
                            }
                        }
                        catch { }
                    }
                }

                _unitOfWork.SaveChanges();
            }
            catch
            {
                throw;
            }
            return GetUserMenuDetails(roleMenuEntities[0].UserRole);
        }

        public List<UserMenuDto> GetUserMenuTree(int userId, string role)
        {
            var ctx = LoadMenuAccess(userId, role, activeOnly: true);

            var accessibleMenuIds = ctx.Menus
                .Where(m => !IsNavHiddenMenu(m) && !IsConsolidatedReviewSectionMenu(m, ctx.ConsRvwMenuId, ctx.MenuById))
                .Where(m =>
                {
                    var roleActive = IsMappedActive(ctx.RoleMappings, m.MenuId);
                    return IsConsRvwMenu(m, ctx.ConsRvwMenuId)
                        ? roleActive || IsMappedActive(ctx.UserMappings, m.MenuId)
                        : roleActive;
                })
                .Select(m => m.MenuId)
                .ToHashSet();

            var accessibleMenus = ctx.Menus.Where(m => accessibleMenuIds.Contains(m.MenuId)).ToList();
            var lookup = accessibleMenus.ToLookup(ParentKey);
            var roots = accessibleMenus.Where(m =>
                ParentKey(m) == 0 || m.ParentMenuId == null || !accessibleMenuIds.Contains(m.ParentMenuId.Value));

            return roots
                .OrderBy(r => r.SortOrder)
                .ThenBy(r => r.MenuId)
                .Select(r => ToUserMenuDto(r, ctx.ConsRvwMenuId, lookup))
                .ToList();
        }

        public List<AdminMenuDto> GetAdminMenus(string roleCode, int? userId)
        {
            var allMenus = _unitOfWork.Repository<MenuList>().Entity().AsNoTracking().ToList();
            var menuDict = IndexBy(allMenus, m => m.MenuId);

            var roleMappings = IndexBy(
                _unitOfWork.Repository<RoleMenuMapping>().Entity().AsNoTracking().Where(r => r.UserRole == roleCode).ToList(),
                r => r.MenuId);

            Dictionary<int, UserMenuMapping>? userMappings = null;
            if (userId.HasValue)
            {
                userMappings = IndexBy(
                    _unitOfWork.Repository<UserMenuMapping>().Entity()
                        .AsNoTracking()
                        .Where(u => u.UserId == userId.Value)
                        .ToList(),
                    u => u.MenuID);
            }

            AdminMenuDto MapMenu(MenuList menu, int depth)
            {
                return new AdminMenuDto
                {
                    MenuId = menu.MenuId,
                    MenuName = menu.Name,
                    MenuCode = menu.Code,
                    ParentMenuId = menu.ParentMenuId,
                    SortOrder = menu.SortOrder,
                    RedirectUrl = menu.RedirectUrl,
                    ActiveMenu = menu.ActiveMenu,
                    MenuType = menu.MenuType,
                    Depth = depth,
                    RoleActive = roleMappings.ContainsKey(menu.MenuId) && roleMappings[menu.MenuId].Active,
                    RoleEdit = roleMappings.ContainsKey(menu.MenuId) && roleMappings[menu.MenuId].Edit,
                    UserActive = userMappings?.ContainsKey(menu.MenuId) == true ? userMappings[menu.MenuId].Active : null,
                    UserEdit = userMappings?.ContainsKey(menu.MenuId) == true ? userMappings[menu.MenuId].Edit : null
                };
            }

            int GetDepth(MenuList menu)
            {
                int depth = 0;
                var current = menu;
                var visited = new HashSet<int>();
                while (current.ParentMenuId != null && current.ParentMenuId != 0
                    && menuDict.ContainsKey(current.ParentMenuId.Value)
                    && visited.Add(current.MenuId))
                {
                    depth++;
                    current = menuDict[current.ParentMenuId.Value];
                }
                return depth;
            }

            var byParent = allMenus.ToLookup(ParentKey);
            var result = new List<AdminMenuDto>(allMenus.Count);
            var included = new HashSet<int>();

            void Walk(int parentId, int depth)
            {
                foreach (var menu in byParent[parentId]
                    .OrderBy(m => m.SortOrder ?? int.MaxValue)
                    .ThenBy(m => m.MenuId))
                {
                    if (!included.Add(menu.MenuId))
                    {
                        continue;
                    }

                    result.Add(MapMenu(menu, depth));
                    Walk(menu.MenuId, depth + 1);
                }
            }

            Walk(0, 0);

            foreach (var menu in allMenus
                .Where(m => !included.Contains(m.MenuId))
                .OrderBy(m => m.SortOrder ?? int.MaxValue)
                .ThenBy(m => m.MenuId))
            {
                result.Add(MapMenu(menu, GetDepth(menu)));
            }

            return result;
        }

        private static int ParentKey(MenuList menu)
        {
            return menu.ParentMenuId == null || menu.ParentMenuId == 0 ? 0 : menu.ParentMenuId.Value;
        }

        public bool CanMaintainQuestionnaireScripts(int userId, string? role)
        {
            var menu = _unitOfWork.Repository<MenuList>().Entity()
                .AsNoTracking()
                .FirstOrDefault(m => m.Code == "QSCR");

            if (menu == null)
            {
                return false;
            }

            UserMenuMapping? userMapping = null;
            if (userId > 0)
            {
                userMapping = _unitOfWork.Repository<UserMenuMapping>().Entity()
                    .AsNoTracking()
                    .FirstOrDefault(u => u.UserId == userId && u.MenuID == menu.MenuId);
            }

            RoleMenuMapping? roleMapping = null;
            if (!string.IsNullOrWhiteSpace(role))
            {
                var normalizedRole = role.Trim();
                roleMapping = _unitOfWork.Repository<RoleMenuMapping>().Entity()
                    .AsNoTracking()
                    .FirstOrDefault(r => r.UserRole == normalizedRole && r.MenuId == menu.MenuId);
            }

            var visible = userMapping != null ? userMapping.Active : (roleMapping?.Active ?? false);
            var edit = userMapping != null ? userMapping.Edit : (roleMapping?.Edit ?? false);
            return visible && edit;
        }


        public void SaveMenus(List<AdminMenuDto> menuDtos, int modifiedBy)
        {
            try
            {
                if (menuDtos == null || menuDtos.Count == 0)
                {
                    return;
                }

                var allMenus = _unitOfWork.Repository<MenuList>().Entity().ToList();
                var byId = allMenus.ToDictionary(m => m.MenuId);
                var now = DateTime.Now;
                var affectedParents = new HashSet<int>();

                foreach (var dto in menuDtos)
                {
                    if (!byId.TryGetValue(dto.MenuId, out var menu))
                    {
                        _logger.LogWarning("SaveMenus skipped missing menu {MenuId}.", dto.MenuId);
                        continue;
                    }

                    affectedParents.Add(ParentKey(menu));
                    menu.Name = dto.MenuName;
                    menu.Code = dto.MenuCode;
                    menu.ParentMenuId = dto.ParentMenuId;
                    menu.RedirectUrl = dto.RedirectUrl;
                    menu.ActiveMenu = dto.ActiveMenu;
                    if (!string.IsNullOrWhiteSpace(dto.MenuType))
                    {
                        menu.MenuType = dto.MenuType;
                    }
                    menu.ModifiedBy = modifiedBy;
                    menu.ModifyDate = now;
                    affectedParents.Add(ParentKeyFromDto(dto));
                }

                foreach (var menu in allMenus)
                {
                    affectedParents.Add(ParentKey(menu));
                }

                var orderedByParent = BuildSiblingOrder(allMenus, byId, menuDtos, affectedParents);
                ApplySortOrders(orderedByParent, modifiedBy, now, useTemporary: true);
                _unitOfWork.SaveChanges();

                ApplySortOrders(orderedByParent, modifiedBy, now, useTemporary: false);
                _unitOfWork.SaveChanges();
                _logger.LogInformation("SaveMenus updated {Count} menus by user {ModifiedBy}.", menuDtos.Count, modifiedBy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SaveMenus failed for {Count} menus by user {ModifiedBy}.", menuDtos.Count, modifiedBy);
                throw;
            }
        }

        private static int ParentKeyFromDto(AdminMenuDto dto)
        {
            return dto.ParentMenuId == null || dto.ParentMenuId == 0 ? 0 : dto.ParentMenuId.Value;
        }

        private static Dictionary<int, List<MenuList>> BuildSiblingOrder(
            List<MenuList> allMenus,
            Dictionary<int, MenuList> byId,
            List<AdminMenuDto> menuDtos,
            HashSet<int> affectedParents)
        {
            var incomingByParent = menuDtos
                .Select((dto, index) => new { dto, index })
                .Where(x => byId.ContainsKey(x.dto.MenuId))
                .GroupBy(x => ParentKeyFromDto(x.dto))
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderBy(x => x.dto.SortOrder ?? int.MaxValue).ThenBy(x => x.index).ToList());

            var orderedByParent = new Dictionary<int, List<MenuList>>();
            foreach (var parentId in affectedParents)
            {
                var siblings = allMenus.Where(m => ParentKey(m) == parentId).ToList();
                if (!incomingByParent.TryGetValue(parentId, out var incoming) || incoming.Count == 0)
                {
                    orderedByParent[parentId] = siblings
                        .OrderBy(m => m.SortOrder ?? int.MaxValue)
                        .ThenBy(m => m.MenuId)
                        .ToList();
                    continue;
                }

                var incomingIds = incoming.Select(x => x.dto.MenuId).ToHashSet();
                var ordered = siblings
                    .Where(m => !incomingIds.Contains(m.MenuId))
                    .OrderBy(m => m.SortOrder ?? int.MaxValue)
                    .ThenBy(m => m.MenuId)
                    .ToList();

                foreach (var entry in incoming)
                {
                    var item = byId[entry.dto.MenuId];
                    var requested = entry.dto.SortOrder ?? (ordered.Count + 1);
                    var index = Math.Clamp(requested - 1, 0, ordered.Count);
                    ordered.Insert(index, item);
                }

                orderedByParent[parentId] = ordered;
            }

            return orderedByParent;
        }

        private static void ApplySortOrders(
            Dictionary<int, List<MenuList>> orderedByParent,
            int modifiedBy,
            DateTime now,
            bool useTemporary)
        {
            foreach (var ordered in orderedByParent.Values)
            {
                for (var i = 0; i < ordered.Count; i++)
                {
                    var menu = ordered[i];
                    menu.SortOrder = useTemporary ? -menu.MenuId : i + 1;
                    menu.ModifiedBy = modifiedBy;
                    menu.ModifyDate = now;
                }
            }
        }

        // NEW: Save role-menu mappings (bulk update)
        public void SaveRoleMenus(string roleCode, List<AdminMenuDto> dtos, int modifiedBy)
        {
            foreach (var dto in dtos)
            {
                var mapping = _unitOfWork.Repository<RoleMenuMapping>().Entity()
                    .FirstOrDefault(r => r.UserRole == roleCode && r.MenuId == dto.MenuId);
                if (mapping == null)
                {
                    mapping = new RoleMenuMapping
                    {
                        UserRole = roleCode,
                        MenuId = dto.MenuId,
                        Active = dto.RoleActive,
                        Edit = dto.RoleEdit,
                        CreatedBy = modifiedBy,
                        CreateDate = DateTime.Now
                    };
                    _unitOfWork.Repository<RoleMenuMapping>().Add(mapping);
                }
                else
                {
                    mapping.Active = dto.RoleActive;
                    mapping.Edit = dto.RoleEdit;
                    mapping.ModifiedBy = modifiedBy;
                    mapping.ModifyDate = DateTime.Now;
                }
            }
            _unitOfWork.SaveChanges();
        }

        // NEW: Save user-menu mappings
        public void SaveUserMenus(int userId, List<AdminMenuDto> dtos, int modifiedBy)
        {
            foreach (var dto in dtos)
            {
                var mapping = _unitOfWork.Repository<UserMenuMapping>().Entity()
                    .FirstOrDefault(u => u.UserId == userId && u.MenuID == dto.MenuId);
                if (mapping == null)
                {
                    mapping = new UserMenuMapping
                    {
                        UserId = userId,
                        MenuID = dto.MenuId,
                        Active = dto.UserActive ?? false,
                        Edit = dto.UserEdit ?? false,
                        CreatedBy = modifiedBy,
                        CreateDate = DateTime.Now
                    };
                    _unitOfWork.Repository<UserMenuMapping>().Add(mapping);
                }
                else
                {
                    mapping.Active = dto.UserActive ?? false;
                    mapping.Edit = dto.UserEdit ?? false;
                    mapping.ModifiedBy = modifiedBy;
                    mapping.ModifyDate = DateTime.Now;
                }
            }
            _unitOfWork.SaveChanges();
        }

        // NEW: Get list of tab configurations from static JSON file
        public List<TabConfigReference> GetTabConfigs()
        {
            string jsonFilePath = Path.Combine(_jsonDataPath, $"tab-configurations.json");
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), jsonFilePath);
            var json = System.IO.File.ReadAllText(filePath);
            return JsonSerializer.Deserialize<List<TabConfigReference>>(json);
        }

        public List<UserInfoDto> GetAllUsers(string? search)
        {
            try
            {
                var query = _unitOfWork.Repository<UserInfo>().Entity()
                    .Where(u => u.RecStat == "A");

                var term = search?.Trim();
                if (!string.IsNullOrWhiteSpace(term))
                {
                    var parsedId = 0;
                    var hasUserId = int.TryParse(term, out parsedId);
                    query = query.Where(u =>
                        u.DisplayName.Contains(term)
                        || u.UserName.Contains(term)
                        || (u.UserEmail != null && u.UserEmail.Contains(term))
                        || (u.UserRole != null && u.UserRole.Contains(term))
                        || (hasUserId && u.UserId == parsedId));
                }

                var take = string.IsNullOrWhiteSpace(term) ? DefaultUserPreviewCount : MaxUserSearchResults;
                var users = query
                    .OrderBy(u => u.DisplayName)
                    .Take(take)
                    .Select(u => new UserInfoDto
                    {
                        UserId = u.UserId,
                        UserName = u.UserName,
                        DisplayName = u.DisplayName,
                        UserRole = u.UserRole,
                        UserEmail = u.UserEmail,
                        RecStat = u.RecStat
                    })
                    .ToList();

                _logger.LogInformation("GetAllUsers returned {Count} active users for search '{Search}'.", users.Count, term);
                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAllUsers failed for search '{Search}'.", search);
                throw;
            }
        }

        public List<TabMenuItemDto> GetConsUserTabMenus(int userId, string role)
        {
            var ctx = LoadMenuAccess(userId, role, activeOnly: true);
            if (!IsMappedActive(ctx.RoleMappings, ctx.ConsRvwMenuId)
                && !IsMappedActive(ctx.UserMappings, ctx.ConsRvwMenuId))
            {
                return new List<TabMenuItemDto>();
            }

            var tabMenus = ctx.Menus
                .Where(m => IsConsolidatedReviewSectionMenu(m, ctx.ConsRvwMenuId, ctx.MenuById) && !IsFiscalOrCteParent(m))
                .ToList();

            var userTabIds = tabMenus
                .Where(m => IsMappedActive(ctx.UserMappings, m.MenuId))
                .Select(m => m.MenuId)
                .ToHashSet();

            var accessibleTabs = userTabIds.Count > 0
                ? tabMenus.Where(m => userTabIds.Contains(m.MenuId))
                : IsMappedActive(ctx.RoleMappings, ctx.ConsRvwMenuId)
                    ? tabMenus.AsEnumerable()
                    : Enumerable.Empty<MenuList>();

            return accessibleTabs
                .Select(m => new TabMenuItemDto
                {
                    Id = ResolveTabRouteId(m),
                    Title = m.Name,
                    ParentName = ResolveParentName(m, ctx.MenuById),
                    SortOrder = m.SortOrder ?? 0
                })
                .OrderBy(t => t.SortOrder)
                .ToList();
        }

        private sealed class MenuAccessContext
        {
            public List<MenuList> Menus { get; init; } = new();
            public Dictionary<int, MenuList> MenuById { get; init; } = new();
            public Dictionary<int, RoleMenuMapping> RoleMappings { get; init; } = new();
            public Dictionary<int, UserMenuMapping> UserMappings { get; init; } = new();
            public int ConsRvwMenuId { get; init; }
        }

        private MenuAccessContext LoadMenuAccess(int userId, string? role, bool activeOnly)
        {
            IQueryable<MenuList> menusQuery = _unitOfWork.Repository<MenuList>().Entity().AsNoTracking();
            if (activeOnly)
            {
                menusQuery = menusQuery.Where(m => m.Active || m.ActiveMenu);
            }

            var menus = menusQuery.ToList();
            var normalizedRole = role?.Trim();
            return new MenuAccessContext
            {
                Menus = menus,
                MenuById = IndexBy(menus, m => m.MenuId),
                RoleMappings = string.IsNullOrWhiteSpace(normalizedRole)
                    ? new Dictionary<int, RoleMenuMapping>()
                    : IndexBy(
                        _unitOfWork.Repository<RoleMenuMapping>().Entity()
                            .AsNoTracking()
                            .Where(r => r.UserRole == normalizedRole)
                            .ToList(),
                        r => r.MenuId),
                UserMappings = userId > 0
                    ? IndexBy(
                        _unitOfWork.Repository<UserMenuMapping>().Entity()
                            .AsNoTracking()
                            .Where(u => u.UserId == userId)
                            .ToList(),
                        u => u.MenuID)
                    : new Dictionary<int, UserMenuMapping>(),
                ConsRvwMenuId = ResolveConsRvwMenuId(menus)
            };
        }

        private static Dictionary<int, T> IndexBy<T>(IEnumerable<T> source, Func<T, int> keySelector)
        {
            var map = new Dictionary<int, T>();
            foreach (var item in source)
            {
                var key = keySelector(item);
                if (!map.ContainsKey(key))
                {
                    map[key] = item;
                }
            }

            return map;
        }

        private static bool IsMappedActive(IReadOnlyDictionary<int, RoleMenuMapping> map, int menuId)
        {
            return map.TryGetValue(menuId, out var row) && row.Active;
        }

        private static bool IsMappedActive(IReadOnlyDictionary<int, UserMenuMapping> map, int menuId)
        {
            return map.TryGetValue(menuId, out var row) && row.Active;
        }

        private static UserMenuDto ToUserMenuDto(MenuList menu, int consRvwMenuId, ILookup<int, MenuList> children)
        {
            return new UserMenuDto
            {
                MenuId = menu.MenuId,
                MenuName = menu.Name,
                MenuCode = menu.Code,
                RedirectUrl = ResolveHeaderRedirectUrl(menu, consRvwMenuId),
                MenuType = menu.MenuType,
                Order = menu.SortOrder ?? 0,
                Children = children[menu.MenuId]
                    .OrderBy(child => child.SortOrder)
                    .ThenBy(child => child.MenuId)
                    .Select(child => ToUserMenuDto(child, consRvwMenuId, children))
                    .ToList()
            };
        }

        private static string ResolveHeaderRedirectUrl(MenuList menu, int consRvwMenuId)
        {
            if (!string.IsNullOrWhiteSpace(menu.RedirectUrl))
            {
                return menu.RedirectUrl;
            }

            return IsConsRvwMenu(menu, consRvwMenuId) ? "consolidatedreview" : (menu.RedirectUrl ?? string.Empty);
        }

        private static int ResolveConsRvwMenuId(IEnumerable<MenuList> menus)
        {
            var consRvw = menus.FirstOrDefault(m =>
                string.Equals(m.Code, "ConsRvw", StringComparison.OrdinalIgnoreCase));
            return consRvw?.MenuId ?? 25;
        }

        private static bool IsTabMenu(MenuList menu)
        {
            return string.Equals(menu.MenuType, "Tab", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsFiscalOrCteParent(MenuList menu)
        {
            return string.Equals(menu.Code, "FiscAdmServ", StringComparison.OrdinalIgnoreCase)
                || string.Equals(menu.Code, "CTEPgms", StringComparison.OrdinalIgnoreCase)
                || string.Equals(menu.Name, "Fiscal and Admin Services Cust", StringComparison.OrdinalIgnoreCase)
                || string.Equals(menu.Name, "CTE Programs", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsConsolidatedReviewSectionMenu(
            MenuList menu,
            int consRvwMenuId,
            IReadOnlyDictionary<int, MenuList> menuById)
        {
            if (IsConsRvwMenu(menu, consRvwMenuId))
            {
                return false;
            }

            if (IsTabMenu(menu) || IsFiscalOrCteParent(menu) || menu.ParentMenuId == consRvwMenuId)
            {
                return true;
            }

            if (menu.ParentMenuId == null || menu.ParentMenuId == 0)
            {
                return false;
            }

            return menuById.TryGetValue(menu.ParentMenuId.Value, out var parent)
                && (parent.MenuId == consRvwMenuId || IsFiscalOrCteParent(parent) || IsTabMenu(parent));
        }

        private static bool IsNavHiddenMenu(MenuList menu)
        {
            return IsNavHiddenMenu(menu.Code, menu.MenuType);
        }

        private static bool IsNavHiddenMenu(string? menuCode, string? menuType)
        {
            if (string.Equals(menuType, "Permission", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return string.Equals(menuCode, "QSCR", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsConsRvwMenu(MenuList menu, int consRvwMenuId)
        {
            return menu.MenuId == consRvwMenuId
                || string.Equals(menu.Code, "ConsRvw", StringComparison.OrdinalIgnoreCase);
        }

        private static string ResolveTabRouteId(MenuList menu)
        {
            if (!string.IsNullOrWhiteSpace(menu.RedirectUrl))
            {
                var segment = menu.RedirectUrl
                    .Split('/', StringSplitOptions.RemoveEmptyEntries)
                    .LastOrDefault(part =>
                        !string.Equals(part, "consolidatedreview", StringComparison.OrdinalIgnoreCase)
                        && !string.Equals(part, "selectVisit", StringComparison.OrdinalIgnoreCase)
                        && !string.Equals(part, "visitDetails", StringComparison.OrdinalIgnoreCase));
                if (!string.IsNullOrWhiteSpace(segment))
                {
                    return segment.ToLowerInvariant();
                }
            }

            return (menu.Code ?? string.Empty).ToLowerInvariant();
        }

        private static string? ResolveParentName(MenuList menu, IReadOnlyDictionary<int, MenuList> menuById)
        {
            if (menu.ParentMenuId == null || menu.ParentMenuId == 0)
            {
                return null;
            }

            return menuById.TryGetValue(menu.ParentMenuId.Value, out var parent) ? parent.Name : null;
        }
    }

    // DTOs
    public class UserMenuDto
    {
        public int MenuId { get; set; }
        public string MenuName { get; set; }
        public string MenuCode { get; set; }
        public string RedirectUrl { get; set; }
        public string MenuType { get; set; }
        public int Order { get; set; }
        public List<UserMenuDto> Children { get; set; }
    }

    public class AdminMenuDto
    {
        public int MenuId { get; set; }
        public string MenuName { get; set; }
        public string MenuCode { get; set; }
        public int? ParentMenuId { get; set; }
        public int? SortOrder { get; set; }
        public string? RedirectUrl { get; set; }
        public bool ActiveMenu { get; set; }
        public string? MenuType { get; set; }
        public bool RoleActive { get; set; }
        public bool RoleEdit { get; set; }
        public bool? UserActive { get; set; }
        public bool? UserEdit { get; set; }
        public int Depth { get; set; }
    }

    public class TabConfigReference
    {
        public string Id { get; set; }
        public string Title { get; set; }
    }

    public class UserInfoDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? UserRole { get; set; }
        public string? UserEmail { get; set; }
        public string? RecStat { get; set; }
    }

    public class TabMenuItemDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string ParentName { get; set; }
        public int SortOrder { get; set; }
    }
}
