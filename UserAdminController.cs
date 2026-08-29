using Demo.Services.Interfaces.Services;
using Demo.Services.Models;
using Demo.Services.Providers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.Extensions.Logging;

namespace Demo.API.Controllers
{
    [ApiController]
    public class UserAdminController : ControllerBase
    {
        private readonly IUserAdminService _userAdminService;
        private readonly ILogger<UserAdminController> _logger;

        public UserAdminController(IUserAdminService userAdminService, ILogger<UserAdminController> logger)
        {
            _userAdminService = userAdminService;
            _logger = logger;
        }

        [HttpGet]
        [Route("GetAllUserRoles")]
        [EnableQuery]
        public IActionResult GetAllUserRoles()
        {
            return Ok(_userAdminService.GetAllUserRoles());
        }

        [HttpGet]
        [Route("GetAllMenus")]
        [EnableQuery]
        public IActionResult GetAllMenus()
        {
            return Ok(_userAdminService.GetAllMenus());
        }

        [HttpGet]
        [Route("GetAdminMenus")]
        [EnableQuery]
        public IActionResult GetAdminMenus(string roleCode, int? userId)
        {
            return Ok(_userAdminService.GetAdminMenus(roleCode, userId));
        }

        [HttpGet]
        [Route("GetUserMenuTree")]
        [EnableQuery]
        public IActionResult GetUserMenuTree(int userId, string role)
        {
            return Ok(_userAdminService.GetUserMenuTree(userId, role));
        }

        [HttpGet]
        [Route("GetAllUsers")]
        public IActionResult GetAllUsers([FromQuery] string? search)
        {
            try
            {
                return Ok(_userAdminService.GetAllUsers(search));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAllUsers failed for search '{Search}'.", search);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Unable to search users." });
            }
        }

        [HttpGet]
        [Route("GetUserMenuDetails")]
        [EnableQuery]
        public IActionResult GetUserMenuDetails(string userRole)
        {
            return Ok(_userAdminService.GetUserMenuDetails(userRole));
        }

        [HttpGet("GetConsUserTabMenus")]
        public IActionResult GetConsUserTabMenus(int userId, string role)
        {
            return Ok(_userAdminService.GetConsUserTabMenus(userId, role));
        }

        [HttpPost]
        [Route("SaveUserRoleMenu")]
        public IActionResult SaveUserRoleMenu([FromBody] IList<RoleMenuMappingModel> roleMenuMappingModel)
        {
            return Ok(_userAdminService.SaveUserRoleMenu(roleMenuMappingModel));
        }

        [HttpPost("SaveMenus")]
        public IActionResult SaveMenus([FromBody] List<AdminMenuDto> menus)
        {
            var currentUserId = ReadCurrentUserId();
            if (currentUserId <= 0)
            {
                _logger.LogWarning("SaveMenus called without a logged-in user.");
                return BadRequest("A logged-in user is required to save menu order.");
            }

            if (menus == null || menus.Count == 0)
            {
                return BadRequest("At least one menu is required.");
            }

            try
            {
                _logger.LogInformation("SaveMenus by user {CurrentUserId} with {Count} rows.", currentUserId, menus.Count);
                _userAdminService.SaveMenus(menus, currentUserId);
                return Ok(new { message = "Menu order updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SaveMenus failed for user {CurrentUserId}.", currentUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Unable to save menu order." });
            }
        }

        [HttpPost("SaveRoleMenus")]
        public IActionResult SaveRoleMenus([FromQuery] string roleCode, [FromBody] List<AdminMenuDto> menus)
        {
            if (string.IsNullOrEmpty(roleCode))
                return BadRequest("Role code is required.");

            var currentUserId = ReadCurrentUserId();
            if (currentUserId <= 0)
            {
                _logger.LogWarning("SaveRoleMenus called without a logged-in user for role {RoleCode}.", roleCode);
                return BadRequest("A logged-in user is required to save role permissions.");
            }

            try
            {
                _logger.LogInformation(
                    "SaveRoleMenus for role {RoleCode} by user {CurrentUserId} with {Count} rows.",
                    roleCode,
                    currentUserId,
                    menus?.Count ?? 0);
                _userAdminService.SaveRoleMenus(roleCode, menus ?? new List<AdminMenuDto>(), currentUserId);
                return Ok(new { message = "Role menu permissions updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SaveRoleMenus failed for role {RoleCode} by user {CurrentUserId}.", roleCode, currentUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Unable to save role permissions." });
            }
        }

        [HttpPost("SaveUserMenus")]
        public IActionResult SaveUserMenus([FromQuery] int userId, [FromBody] List<AdminMenuDto> menus)
        {
            if (userId <= 0)
                return BadRequest("Valid user ID is required.");

            var currentUserId = ReadCurrentUserId();
            if (currentUserId <= 0)
            {
                _logger.LogWarning("SaveUserMenus called without a logged-in user for target {UserId}.", userId);
                return BadRequest("A logged-in user is required to save user permissions.");
            }

            try
            {
                _logger.LogInformation(
                    "SaveUserMenus for user {UserId} by user {CurrentUserId} with {Count} rows.",
                    userId,
                    currentUserId,
                    menus?.Count ?? 0);
                _userAdminService.SaveUserMenus(userId, menus ?? new List<AdminMenuDto>(), currentUserId);
                return Ok(new { message = "User menu permissions updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SaveUserMenus failed for user {UserId} by user {CurrentUserId}.", userId, currentUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Unable to save user permissions." });
            }
        }

        private int ReadCurrentUserId()
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var userIdHeader)
                && int.TryParse(userIdHeader.FirstOrDefault(), out var headerUserId)
                && headerUserId > 0)
            {
                return headerUserId;
            }

            if (int.TryParse(Request.Query["currentUserId"].FirstOrDefault(), out var queryUserId)
                && queryUserId > 0)
            {
                return queryUserId;
            }

            return 0;
        }
    }
}
