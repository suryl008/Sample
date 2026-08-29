using Demo.Entities;
using Demo.Services.Common;
using Demo.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Services.Interfaces.Services
{
    public interface IQuestionnaireMGMTService
    {
        IEnumerable<QuestionnaireLookupModel> GetQuestionnaireLookup(string? questionnaire);
        IEnumerable<QuestionnaireScriptModel> GetScriptsByQuestionnaireId(int questionnaireId);
        QuestionnaireScriptModel GetScriptById(int questionnaireScriptId);
        IEnumerable<QuestionnaireScriptHistoryModel> GetScriptHistory(int questionnaireScriptId);
        QuestionnaireScriptModel SaveQuestionnaireScript(QuestionnaireScriptModel model);
        bool RestoreQuestionnaireScript(RestoreScriptRequestParms model);
        Task<QuestionnaireScript> SaveScriptAsync(QuestionnaireScript updatedScript, int userId, string changeNote);
        Task<bool> RestoreVersionAsync(int scriptId, int versionNumber, int userId, string changeNote);
        Task<List<QuestionnaireScriptHistoryModel>> GetHistoryListAsync(int scriptId);
        Task<QuestionnaireScriptHistoryModel?> GetHistoryVersionAsync(int historyId);
        Task GenerateBaselineAsync();
        IEnumerable<QuestionnaireModel> SearchQuestionnaries(int questionnaireId);
    }
}
