using Demo.Entities;
using Demo.Services.Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Services.Interfaces.Providers
{
    public interface IUserAdminProvider
    {
        List<AdminMenuDto> GetAdminMenus(string roleCode, int? userId);
        IEnumerable<MenuList> GetAllMenus();
        IQueryable<RefDatum> GetAllUserRoles();
        List<UserInfoDto> GetAllUsers(string? search);
        List<TabMenuItemDto> GetConsUserTabMenus(int userId, string role);
        IEnumerable<RoleMenuMapping> GetUserMenuDetails(string userRole);
        List<UserMenuDto> GetUserMenuTree(int userId, string role);
        void SaveMenus(List<AdminMenuDto> menus, int modifiedBy);
        void SaveRoleMenus(string roleCode, List<AdminMenuDto> menus, int userId);
        void SaveUserMenus(int userId, List<AdminMenuDto> menus, int currentUserId);
        IEnumerable<RoleMenuMapping> SaveUserRoleMenu(List<RoleMenuMapping> roleMenuEntities);
        bool CanMaintainQuestionnaireScripts(int userId, string? role);
    }
}
