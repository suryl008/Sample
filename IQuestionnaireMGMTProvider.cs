using Demo.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Demo.Entities;

namespace Demo.Services.Interfaces.Providers
{
    public interface IQuestionnaireMGMTProvider
    {
        IEnumerable<QuestionnaireLookupModel> GetQuestionnaireLookup(string? questionnaire);
        IEnumerable<QuestionnaireScript> GetScriptsByQuestionnaireId(int questionnaireId);
        QuestionnaireScript GetScriptById(int questionnaireScriptId);
        IEnumerable<QuestionnaireScriptHistory> GetScriptHistory(int questionnaireScriptId);
        bool CreateScript(QuestionnaireScript entity, string? changeNote = null);
        bool UpdateScript(QuestionnaireScript entity, string? changeNote = null);
        bool RestoreScript(int scriptId, int sourceVersionNumber, int? changedBy, string? changeNote);
        //IEnumerable<QuestionnaireScript> GetQuestionnaireScript(int questionnaireId);
        //IEnumerable<QuestionnaireScriptHistory> GetQuestionnaireScriptHistory(int questionnaireScriptId);
        ////bool SaveQuestionnaireScript(QuestionnaireScript questionnaireScriptEntity);
        ////bool RestoreScript(int scriptId, int sourceVersionNumber, int userId, string changeNote);
        //bool CreateScript(QuestionnaireScript entity);
        //bool UpdateScript(QuestionnaireScript entity);
        //bool RestoreScript(int scriptId, int sourceVersionNumber, int userId, string changeNote);

        Task<QuestionnaireScript> SaveScriptAsync(QuestionnaireScript updatedScript, int userId, string changeNote);
        Task<bool> RestoreVersionAsync(int scriptId, int versionNumber, int userId, string changeNote);
        Task<List<QuestionnaireScriptHistory>> GetHistoryListAsync(int scriptId);
        Task<QuestionnaireScriptHistory> GetHistoryVersionAsync(int historyId);
        Task GenerateBaselineAsync(); // One-time setup
        IEnumerable<Questionnaire> SearchQuestionnaries(int questionnaireId);
    }
}
