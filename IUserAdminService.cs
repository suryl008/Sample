using Demo.Services.Models;
using Demo.Services.Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Services.Interfaces.Services
{
    public interface IUserAdminService
    {
        List<AdminMenuDto> GetAdminMenus(string roleCode, int? userId);
        IQueryable<MenuListModel> GetAllMenus();
        IQueryable<RefDatumModel> GetAllUserRoles();
        List<UserInfoDto> GetAllUsers(string? search);
        List<TabMenuItemDto> GetConsUserTabMenus(int userId, string role);
        IQueryable<RoleMenuMappingModel> GetUserMenuDetails(string userRole);
        List<UserMenuDto> GetUserMenuTree(int userId, string role);
        void SaveMenus(List<AdminMenuDto> menus, int modifiedBy);
        void SaveRoleMenus(string roleCode, List<AdminMenuDto> menus, int userId);
        void SaveUserMenus(int userId, List<AdminMenuDto> menus, int currentUserId);
        IQueryable<RoleMenuMappingModel> SaveUserRoleMenu(IList<RoleMenuMappingModel> roleMenuMappingModel);
        bool CanMaintainQuestionnaireScripts(int userId, string? role);
    }
}
