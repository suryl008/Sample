using AutoMapper;
using AutoMapper.QueryableExtensions;
using Demo.Entities;
using Demo.Services.Interfaces.Providers;
using Demo.Services.Interfaces.Services;
using Demo.Services.Models;
using Demo.Services.Providers;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace Demo.Services.Services
{
    public class UserAdminService : IUserAdminService
    {
        private readonly IUserAdminProvider _userAdminProvider;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public UserAdminService(IUserAdminProvider userAdminProvider, IMapper mapper, IConfiguration configuration)
        {
            _configuration = configuration;
            _userAdminProvider = userAdminProvider;
            _mapper = mapper;
        }

        public List<AdminMenuDto> GetAdminMenus(string roleCode, int? userId)
        {
            var result = _userAdminProvider.GetAdminMenus(roleCode, userId);
            return result;
        }

        public IQueryable<MenuListModel> GetAllMenus()
        {
            var result = _userAdminProvider.GetAllMenus();
            return result.AsQueryable().ProjectTo<MenuListModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<RefDatumModel> GetAllUserRoles()
        {
            var result = _userAdminProvider.GetAllUserRoles();
            return result.ProjectTo<RefDatumModel>(_mapper.ConfigurationProvider);
        }

        public List<UserInfoDto> GetAllUsers(string? search)
        {
            return _userAdminProvider.GetAllUsers(search);
        }

        public List<TabMenuItemDto> GetConsUserTabMenus(int userId, string role)
        {
            var result = _userAdminProvider.GetConsUserTabMenus(userId, role);
            return result;
        }

        public IQueryable<RoleMenuMappingModel> GetUserMenuDetails(string userRole)
        {
            var result = _userAdminProvider.GetUserMenuDetails(userRole);
            return result.AsQueryable().ProjectTo<RoleMenuMappingModel>(_mapper.ConfigurationProvider);
        }

        public List<UserMenuDto> GetUserMenuTree(int userId, string role)
        {
            var result = _userAdminProvider.GetUserMenuTree(userId, role);
            return result;
        }

        public void SaveMenus(List<AdminMenuDto> menus, int modifiedBy)
        {
            _userAdminProvider.SaveMenus(menus, modifiedBy);
        }

        public void SaveRoleMenus(string roleCode, List<AdminMenuDto> menus, int userId)
        {
            _userAdminProvider.SaveRoleMenus(roleCode, menus, userId);
        }

        public void SaveUserMenus(int userId, List<AdminMenuDto> menus, int currentUserId)
        {
            _userAdminProvider.SaveUserMenus(userId, menus, currentUserId);
        }

        public IQueryable<RoleMenuMappingModel> SaveUserRoleMenu(IList<RoleMenuMappingModel> roleMenuMappingModel)
        {
            var roleMenuEntities = new List<RoleMenuMapping>();
            foreach (var roleMenu in roleMenuMappingModel)
            {
                var menuMappingEntity = _mapper.Map<RoleMenuMapping>(roleMenu);
                roleMenuEntities.Add(menuMappingEntity);
            }
            var result = _userAdminProvider.SaveUserRoleMenu(roleMenuEntities);
            return result.AsQueryable().ProjectTo<RoleMenuMappingModel>(_mapper.ConfigurationProvider);

        }

        public bool CanMaintainQuestionnaireScripts(int userId, string? role)
        {
            return _userAdminProvider.CanMaintainQuestionnaireScripts(userId, role);
        }
    }
}
