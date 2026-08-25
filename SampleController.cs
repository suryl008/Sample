using Demo.Services.Common;
using Demo.Services.Interfaces.Services;
using Demo.Services.Models;
using Demo.Services.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Demo.API.Controllers
{
    [ApiController]
    public class QuestionnaireMGMTController : ControllerBase
    {
        private readonly IQuestionnaireMGMTService _service;

        public QuestionnaireMGMTController(IQuestionnaireMGMTService service)
        {
            _service = service;
        }

        [HttpGet]
        [Route("GetAllQuestionnaireLookup")]
        public IActionResult GetAllQuestionnaireLookup(string? questionnaire)
        {
            var result = _service.GetQuestionnaireLookup(questionnaire);
            return Ok(result);
        }

        [HttpGet]
        [Route("GetScriptsByQuestionnaire")]
        public IActionResult GetScriptsByQuestionnaire(int questionnaireId)
        {
            var result = _service.GetScriptsByQuestionnaireId(questionnaireId);
            return Ok(result);
        }

        [HttpGet]
        [Route("GetScriptById")]
        public IActionResult GetScriptById(int scriptId)
        {
            var result = _service.GetScriptById(scriptId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet]
        [Route("GetScriptHistory")]
        public IActionResult GetScriptHistory(int scriptId)
        {
            var result = _service.GetScriptHistory(scriptId);
            return Ok(result);
        }

        [HttpPost]
        [Route("SaveQuestionnaireScript")]
        public IActionResult SaveScript([FromBody] QuestionnaireScriptModel model)
        {
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
                return StatusCode(500, new { message = errorMessage, details = ex.InnerException?.Message });
            }
        }

        [HttpPost]
        [Route("RestoreQuestionnaireScript")]
        public IActionResult RestoreScript([FromBody] RestoreScriptRequestParms model)
        {
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
            await _service.GenerateBaselineAsync();
            return Ok(new { message = "Baseline history records were created for existing questionnaire scripts." });
        }

        [HttpGet]
        [Route("GetHistoryList")]
        public async Task<IActionResult> GetHistoryList(int scriptId)
        {
            var history = await _service.GetHistoryListAsync(scriptId);
            return Ok(history);
        }

        [HttpGet]
        [Route("GetHistoryVersion")]
        public async Task<IActionResult> GetHistoryVersion(int historyId, int? scriptId = null)
        {
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
    }
}
