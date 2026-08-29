using Demo.Entities;
using Demo.Services.Common;
using Demo.Services.Interfaces.Providers;
using Demo.Services.Interfaces.Services;
using Demo.Services.Mappers;
using Demo.Services.Models;

namespace Demo.Services.Services
{
    public class QuestionnaireMGMTService : IQuestionnaireMGMTService
    {
        private readonly IQuestionnaireMGMTProvider _provider;
        private readonly QuestionnaireScriptMapper _mapper;
        private readonly QuestionnaireMapper _questionnaireMapper;

        public QuestionnaireMGMTService(
            IQuestionnaireMGMTProvider provider,
            QuestionnaireScriptMapper mapper,
            QuestionnaireMapper questionnaireMapper)
        {
            _provider = provider;
            _mapper = mapper;
            _questionnaireMapper = questionnaireMapper;
        }

        public IEnumerable<QuestionnaireLookupModel> GetQuestionnaireLookup(string? questionnaire)
        {
            return _provider.GetQuestionnaireLookup(questionnaire);
        }

        public IEnumerable<QuestionnaireScriptModel> GetScriptsByQuestionnaireId(int questionnaireId)
        {
            var entities = _provider.GetScriptsByQuestionnaireId(questionnaireId);
            return _mapper.ToModels(entities);
        }

        public QuestionnaireScriptModel GetScriptById(int questionnaireScriptId)
        {
            var entity = _provider.GetScriptById(questionnaireScriptId);
            return _mapper.ToModel(entity);
        }

        public IEnumerable<QuestionnaireScriptHistoryModel> GetScriptHistory(int questionnaireScriptId)
        {
            var entities = _provider.GetScriptHistory(questionnaireScriptId);
            return _mapper.ToHistoryModels(entities);
        }

        public QuestionnaireScriptModel SaveQuestionnaireScript(QuestionnaireScriptModel model)
        {
            if (model == null)
                throw new ArgumentNullException(nameof(model), "The questionnaire script could not be saved. No changes were made.");

            if (model.QuestionnaireId is null or <= 0)
                throw new ArgumentException("The selected questionnaire could not be found.");

            if (string.IsNullOrWhiteSpace(model.ScriptName))
                throw new ArgumentException("Enter a Script Name before saving.");

            if (model.ScriptName.Trim().Length > 200)
                throw new ArgumentException("The Script Name exceeds the maximum supported length.");

            if (!string.IsNullOrEmpty(model.ScriptDescription) && model.ScriptDescription.Length > 1000)
                throw new ArgumentException("The Script Description exceeds the maximum supported length.");

            if (string.IsNullOrWhiteSpace(model.Script))
                throw new ArgumentException("Enter a questionnaire script before saving.");

            var entity = _mapper.ToEntity(model);
            var timeStamp = DateTime.UtcNow;
            var currentUserId = model.CurrentUserId ?? model.ModifiedBy ?? model.CreatedBy ?? 0;
            var safeChangeNote = string.IsNullOrWhiteSpace(model.ChangeNote)
                ? (entity.QuestionnaireScriptId <= 0 ? "Initial creation" : "Updated script")
                : model.ChangeNote.Trim();

            entity.ScriptName = model.ScriptName.Trim();
            entity.ScriptDescription = string.IsNullOrWhiteSpace(model.ScriptDescription) ? model.ScriptDescription : model.ScriptDescription.Trim();
            entity.ModifiedBy = currentUserId;
            entity.ModifyDate = timeStamp;

            try
            {
                if (entity.QuestionnaireScriptId <= 0)
                {
                    entity.CreatedBy = currentUserId;
                    entity.CreateDate = timeStamp;
                    var created = _provider.CreateScript(entity, safeChangeNote);
                    if (!created)
                        throw new InvalidOperationException("The questionnaire script could not be saved. No changes were made.");
                }
                else
                {
                    var existing = _provider.GetScriptById(entity.QuestionnaireScriptId);
                    if (existing == null)
                        throw new KeyNotFoundException("The selected questionnaire script could not be found.");

                    if (existing.QuestionnaireId != entity.QuestionnaireId)
                        throw new ArgumentException("The selected script is not associated with this questionnaire.");

                    entity.CreatedBy = existing.CreatedBy;
                    entity.CreateDate = existing.CreateDate;
                    entity.QuestionnaireId = existing.QuestionnaireId;

                    var updated = _provider.UpdateScript(entity, safeChangeNote);
                    if (!updated)
                        throw new InvalidOperationException("The questionnaire script could not be saved. No changes were made.");
                }

                var savedEntity = _provider.GetScriptById(entity.QuestionnaireScriptId);
                if (savedEntity == null)
                    throw new InvalidOperationException("The questionnaire script could not be saved. No changes were made.");

                return _mapper.ToModel(savedEntity);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"The questionnaire script could not be saved. No changes were made. {ex.Message}", ex);
            }
        }

        public bool RestoreQuestionnaireScript(RestoreScriptRequestParms model)
        {
            return _provider.RestoreScript(
                model.QuestionnaireScriptId,
                model.SourceVersionNumber,
                model.CurrentUserId,
                model.ChangeNote
            );
        }
        public async Task<List<QuestionnaireScriptHistoryModel>> GetHistoryListAsync(int scriptId)
        {
            var entities = await _provider.GetHistoryListAsync(scriptId);
            return _mapper.ToHistoryModelList(entities);
        }

        public async Task<QuestionnaireScriptHistoryModel?> GetHistoryVersionAsync(int historyId)
        {
            try
            {
                var entity = await _provider.GetHistoryVersionAsync(historyId);
                return _mapper.ToHistoryModel(entity);
            }
            catch (KeyNotFoundException)
            {
                return null;
            }
        }

        public async Task<bool> RestoreVersionAsync(int scriptId, int versionNumber, int userId, string changeNote)
        {
            if (string.IsNullOrWhiteSpace(changeNote))
                throw new ArgumentException("Enter a Change Note explaining why this version is being restored.");

            return await _provider.RestoreVersionAsync(scriptId, versionNumber, userId, changeNote);
        }

        public async Task GenerateBaselineAsync()
        {
            await _provider.GenerateBaselineAsync();
        }

        public async Task<QuestionnaireScript> SaveScriptAsync(QuestionnaireScript inputScript, int userId, string changeNote)
        {
            return await  _provider.SaveScriptAsync(inputScript, userId, changeNote);
        }

        public IEnumerable<QuestionnaireModel> SearchQuestionnaries(int questionnaireId)
        {
            var entities = _provider.SearchQuestionnaries(questionnaireId);
            return _questionnaireMapper.ToModels(entities);
        }
    }
}
