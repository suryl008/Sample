using Demo.Services.Common;
using Demo.Services.Interfaces.Services;
using Demo.Services.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Demo.API.Controllers
{
    [ApiController]
    public class QuestionnaireMGMTController : ControllerBase
    {
        private const string ScriptsForbiddenMessage = "You do not have permission to maintain questionnaire scripts.";

        private readonly IQuestionnaireMGMTService _service;
        private readonly IUserAdminService _userAdminService;
        private readonly ILogger<QuestionnaireMGMTController> _logger;

        public QuestionnaireMGMTController(
            IQuestionnaireMGMTService service,
            IUserAdminService userAdminService,
            ILogger<QuestionnaireMGMTController> logger)
        {
            _service = service;
            _userAdminService = userAdminService;
            _logger = logger;
        }

        [HttpGet]
        [Route("GetAllQuestionnaireLookup")]
        public IActionResult GetAllQuestionnaireLookup(string? questionnaire)
        {
            var result = _service.GetQuestionnaireLookup(questionnaire);
            return Ok(result);
        }

        [HttpGet]
        [Route("SearchQuestionnaries")]
        public IActionResult SearchQuestionnaries(int questionnaireId)
        {
            var result = _service.SearchQuestionnaries(questionnaireId);
            return Ok(result);
        }

        [HttpGet]
        [Route("GetScriptsByQuestionnaire")]
        public IActionResult GetScriptsByQuestionnaire(int questionnaireId)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            var result = _service.GetScriptsByQuestionnaireId(questionnaireId);
            return Ok(result);
        }

        [HttpGet]
        [Route("GetScriptById")]
        public IActionResult GetScriptById(int scriptId)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            var result = _service.GetScriptById(scriptId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet]
        [Route("GetScriptHistory")]
        public IActionResult GetScriptHistory(int scriptId)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            var result = _service.GetScriptHistory(scriptId);
            return Ok(result);
        }

        [HttpPost]
        [Route("SaveQuestionnaireScript")]
        public IActionResult SaveScript([FromBody] QuestionnaireScriptModel model)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = _service.SaveQuestionnaireScript(model);
                return Ok(new
                {
                    success = true,
                    message = "Questionnaire script saved successfully.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                var errorMessage = "The questionnaire script could not be saved. No changes were made.";
                _logger.LogError(ex, "Failed to save questionnaire script.");
                return StatusCode(500, new { message = errorMessage, details = ex.InnerException?.Message });
            }
        }

        [HttpPost]
        [Route("RestoreQuestionnaireScript")]
        public IActionResult RestoreScript([FromBody] RestoreScriptRequestParms model)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = _service.RestoreQuestionnaireScript(model);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Route("GenerateScriptHistoryBaseline")]
        public async Task<IActionResult> GenerateScriptHistoryBaseline()
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            await _service.GenerateBaselineAsync();
            return Ok(new { message = "Baseline history records were created for existing questionnaire scripts." });
        }

        [HttpGet]
        [Route("GetHistoryList")]
        public async Task<IActionResult> GetHistoryList(int scriptId)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            var history = await _service.GetHistoryListAsync(scriptId);
            return Ok(history);
        }

        [HttpGet]
        [Route("GetHistoryVersion")]
        public async Task<IActionResult> GetHistoryVersion(int historyId, int? scriptId = null)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            var version = await _service.GetHistoryVersionAsync(historyId);
            if (version == null) return NotFound(new { message = "The selected questionnaire script version could not be loaded." });
            if (scriptId.HasValue && scriptId.Value > 0 && version.QuestionnaireScriptId != scriptId.Value)
                return BadRequest(new { message = "The selected script is not associated with this questionnaire." });
            return Ok(version);
        }


        [HttpPost]
        [Route("RestoreVersion")]
        public async Task<IActionResult> RestoreVersion([FromBody] RestoreScriptRequestParms request)
        {
            var forbidden = ForbidScriptsIfUnauthorized();
            if (forbidden != null) return forbidden;

            var userId = request.CurrentUserId;
            if (userId <= 0)
                userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            try
            {
                var changeNote = request.ChangeNote ?? string.Empty;
                bool success = await _service.RestoreVersionAsync(request.QuestionnaireScriptId, request.SourceVersionNumber, userId, changeNote);
                if (!success) return BadRequest(new { message = "The questionnaire script version could not be restored. No changes were made." });

                return Ok(new { message = $"Version {request.SourceVersionNumber} was restored successfully. The previous active version remains available in history." });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        private IActionResult? ForbidScriptsIfUnauthorized()
        {
            var (userId, role) = ReadUserContext();
            if (_userAdminService.CanMaintainQuestionnaireScripts(userId, role))
            {
                return null;
            }

            _logger.LogWarning("Denied questionnaire script access for userId {UserId} role {Role}.", userId, role);
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ScriptsForbiddenMessage });
        }

        private (int userId, string? role) ReadUserContext()
        {
            var userId = 0;
            string? role = null;

            if (Request.Headers.TryGetValue("X-User-Id", out var userIdHeader)
                && int.TryParse(userIdHeader.FirstOrDefault(), out var parsedUserId))
            {
                userId = parsedUserId;
            }

            if (Request.Headers.TryGetValue("X-User-Role", out var roleHeader))
            {
                role = roleHeader.FirstOrDefault();
            }

            if (userId <= 0 && int.TryParse(Request.Query["userId"].FirstOrDefault(), out var queryUserId))
            {
                userId = queryUserId;
            }

            if (string.IsNullOrWhiteSpace(role))
            {
                role = Request.Query["userRole"].FirstOrDefault() ?? Request.Query["role"].FirstOrDefault();
            }

            if (userId <= 0)
            {
                int.TryParse(User.FindFirst("UserId")?.Value, out userId);
            }

            return (userId, role);
        }
    }
}
