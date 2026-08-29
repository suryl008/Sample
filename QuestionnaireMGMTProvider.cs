using Demo.Entities;
using Demo.Repository.Interfaces.UnitOfWork;
using Demo.Services.Interfaces.Providers;
using Demo.Services.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Services.Providers
{
    public class QuestionnaireMGMTProvider : IQuestionnaireMGMTProvider
    {
        private readonly IDemoUnitOfWork _unitOfWork;
        public QuestionnaireMGMTProvider(IDemoUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IEnumerable<QuestionnaireLookupModel> GetQuestionnaireLookup(string? questionnaire)
        {
            var term = (questionnaire ?? string.Empty).Trim();
            var scripts = _unitOfWork.Repository<QuestionnaireScript>().Entity()
                .AsNoTracking()
                .Where(x => x.QuestionnaireId != null && x.QuestionnaireId > 0)
                .Select(x => new { x.QuestionnaireId, x.ScriptName })
                .ToList();

            var lookups = scripts
                .GroupBy(x => x.QuestionnaireId!.Value)
                .Select(group => new QuestionnaireLookupModel
                {
                    QuestionnaireId = group.Key,
                    QuestionnaireCode = $"Q-{group.Key}",
                    Name = group.Select(item => item.ScriptName)
                        .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name))
                        ?? $"Questionnaire {group.Key}",
                    RecordStatus = null
                });

            if (!string.IsNullOrWhiteSpace(term))
            {
                lookups = lookups.Where(item =>
                    (item.Name ?? string.Empty).Contains(term, StringComparison.OrdinalIgnoreCase)
                    || (item.QuestionnaireCode ?? string.Empty).Contains(term, StringComparison.OrdinalIgnoreCase)
                    || item.QuestionnaireId.ToString().Contains(term, StringComparison.OrdinalIgnoreCase));
            }

            return lookups.OrderBy(item => item.Name).ToList();
        }

        public IEnumerable<QuestionnaireScript> GetScriptsByQuestionnaireId(int questionnaireId)
        {
            return _unitOfWork.Repository<QuestionnaireScript>().Entity()
                .AsNoTracking()
                .Where(x => x.QuestionnaireId == questionnaireId)
                .OrderBy(x => x.QuestionnaireScriptId)
                .Select(s => new QuestionnaireScript
                {
                    QuestionnaireScriptId = s.QuestionnaireScriptId,
                    QuestionnaireId = s.QuestionnaireId,
                    Script = s.Script,
                    CreatedBy = s.CreatedBy,
                    CreateDate = s.CreateDate,
                    ModifiedBy = s.ModifiedBy,
                    ModifyDate = s.ModifyDate,
                    ScriptName = s.ScriptName,
                    ScriptDescription = s.ScriptDescription,
                    History = new List<QuestionnaireScriptHistory>() // Empty to prevent circular refs
                })
                .ToList();
        }

        public QuestionnaireScript GetScriptById(int questionnaireScriptId)
        {
            // Use AsNoTracking and select only the main script fields without the History navigation
            // to avoid circular reference serialization issues
            var script = _unitOfWork.Repository<QuestionnaireScript>().Entity()
                .AsNoTracking()
                .FirstOrDefault(x => x.QuestionnaireScriptId == questionnaireScriptId);
            
            if (script != null)
            {
                // Explicitly clear the History navigation to prevent circular references
                script.History = new List<QuestionnaireScriptHistory>();
            }
            
            return script;
        }

        public IEnumerable<QuestionnaireScriptHistory> GetScriptHistory(int questionnaireScriptId)
        {
            return _unitOfWork.Repository<QuestionnaireScriptHistory>().Entity()
                .Where(x => x.QuestionnaireScriptId == questionnaireScriptId)
                .OrderByDescending(x => x.VersionNumber)
                .ToList();
        }

        public bool CreateScript(QuestionnaireScript entity, string? changeNote = null)
        {
            var note = string.IsNullOrWhiteSpace(changeNote) ? "Initial creation" : changeNote.Trim();

            // 1. Create the history snapshot (Version 1)
            var history = new QuestionnaireScriptHistory
            {
                // Note: QuestionnaireScriptId is mapped automatically by EF Core navigation
                QuestionnaireId = entity.QuestionnaireId,
                VersionNumber = 1,
                ScriptName = entity.ScriptName,
                ScriptDescription = entity.ScriptDescription,
                Script = entity.Script,
                ActionType = "Create",
                ChangedBy = entity.CreatedBy,
                ChangeDate = entity.CreateDate ?? DateTime.UtcNow,
                ChangeNote = note
            };

            // 2. Add history directly to the entity's navigation property
            entity.History = new List<QuestionnaireScriptHistory> { history };

            // 3. Add to repository and Save (Creates both in one Transaction)
            _unitOfWork.Repository<QuestionnaireScript>().Add(entity);
            _unitOfWork.SaveChanges();

            return true;
        }

        public bool UpdateScript(QuestionnaireScript entity, string? changeNote = null)
        {
            var note = string.IsNullOrWhiteSpace(changeNote) ? "Updated script" : changeNote.Trim();

            var dbEntity = _unitOfWork.Repository<QuestionnaireScript>().Entity()
                .FirstOrDefault(x => x.QuestionnaireScriptId == entity.QuestionnaireScriptId);

            if (dbEntity == null) throw new KeyNotFoundException("The selected questionnaire script could not be found.");

            var nameUnchanged = string.Equals(dbEntity.ScriptName, entity.ScriptName, StringComparison.Ordinal);
            var descriptionUnchanged = string.Equals(dbEntity.ScriptDescription, entity.ScriptDescription, StringComparison.Ordinal);
            var scriptUnchanged = string.Equals(dbEntity.Script, entity.Script, StringComparison.Ordinal);

            if (nameUnchanged && descriptionUnchanged && scriptUnchanged)
            {
                return true;
            }

            dbEntity.ScriptName = entity.ScriptName;
            dbEntity.ScriptDescription = entity.ScriptDescription;
            dbEntity.Script = entity.Script;
            dbEntity.ModifiedBy = entity.ModifiedBy;
            dbEntity.ModifyDate = entity.ModifyDate;

            var lastVersion = _unitOfWork.Repository<QuestionnaireScriptHistory>().Entity()
                .Where(h => h.QuestionnaireScriptId == entity.QuestionnaireScriptId)
                .Max(h => (int?)h.VersionNumber) ?? 0;

            var history = new QuestionnaireScriptHistory
            {
                QuestionnaireScriptId = dbEntity.QuestionnaireScriptId,
                QuestionnaireId = dbEntity.QuestionnaireId,
                VersionNumber = lastVersion + 1,
                ScriptName = dbEntity.ScriptName,
                ScriptDescription = dbEntity.ScriptDescription,
                Script = dbEntity.Script,
                ActionType = "Update",
                ChangedBy = dbEntity.ModifiedBy,
                ChangeDate = dbEntity.ModifyDate ?? DateTime.UtcNow,
                ChangeNote = note
            };

            _unitOfWork.Repository<QuestionnaireScriptHistory>().Add(history);
            _unitOfWork.SaveChanges();

            return true;
        }

        public bool RestoreScript(int scriptId, int sourceVersionNumber, int? changedBy, string? changeNote)
        {
            if (string.IsNullOrWhiteSpace(changeNote))
                throw new ArgumentException("Enter a Change Note explaining why this version is being restored.");

            // 1. Fetch the historical source version
            var source = _unitOfWork.Repository<QuestionnaireScriptHistory>().Entity()
                .FirstOrDefault(h => h.QuestionnaireScriptId == scriptId && h.VersionNumber == sourceVersionNumber);

            if (source == null) throw new KeyNotFoundException($"Version {sourceVersionNumber} not found.");

            // 2. Fetch the active script to overwrite
            var dbEntity = _unitOfWork.Repository<QuestionnaireScript>().Entity()
                .FirstOrDefault(s => s.QuestionnaireScriptId == scriptId);

            if (dbEntity == null) throw new KeyNotFoundException($"Script {scriptId} not found.");

            if (dbEntity.ScriptName == source.ScriptName &&
                dbEntity.ScriptDescription == source.ScriptDescription &&
                dbEntity.Script == source.Script)
            {
                throw new ArgumentException("The selected version is already the current version and cannot be restored.");
            }

            var timeStamp = DateTime.UtcNow;

            // 3. Restore historical values to the active script
            dbEntity.ScriptName = source.ScriptName;
            dbEntity.ScriptDescription = source.ScriptDescription;
            dbEntity.Script = source.Script;
            dbEntity.ModifiedBy = changedBy;
            dbEntity.ModifyDate = timeStamp;

            // 4. Determine next sequential version number
            var lastVersion = _unitOfWork.Repository<QuestionnaireScriptHistory>().Entity()
                .Where(h => h.QuestionnaireScriptId == scriptId)
                .Max(h => (int?)h.VersionNumber) ?? 0;

            // 5. Create new history snapshot recording the Restore action
            var history = new QuestionnaireScriptHistory
            {
                QuestionnaireScriptId = scriptId,
                QuestionnaireId = dbEntity.QuestionnaireId,
                VersionNumber = lastVersion + 1,
                ScriptName = dbEntity.ScriptName,
                ScriptDescription = dbEntity.ScriptDescription,
                Script = dbEntity.Script,
                ActionType = "Restore",
                ChangedBy = changedBy,
                ChangeDate = timeStamp,
                ChangeNote = changeNote,
                RestoredFromVersionNumber = sourceVersionNumber
            };

            // 6. Save (Updates Parent, Inserts Child in one Transaction)
            _unitOfWork.Repository<QuestionnaireScriptHistory>().Add(history);
            _unitOfWork.SaveChanges();

            return true;
        }
        public async Task<List<QuestionnaireScriptHistory>> GetHistoryListAsync(int scriptId)
        {
            return await _unitOfWork.Repository<QuestionnaireScriptHistory>().Entity()
                .Where(h => h.QuestionnaireScriptId == scriptId)
                .OrderByDescending(h => h.VersionNumber)
                .Select(h => new QuestionnaireScriptHistory
                {
                    QuestionnaireScriptHistoryId = h.QuestionnaireScriptHistoryId,
                    QuestionnaireScriptId = h.QuestionnaireScriptId,
                    QuestionnaireId = h.QuestionnaireId,
                    VersionNumber = h.VersionNumber,
                    ScriptName = h.ScriptName,
                    ScriptDescription = h.ScriptDescription,
                    ActionType = h.ActionType,
                    ChangedBy = h.ChangedBy,
                    ChangeDate = h.ChangeDate,
                    ChangeNote = h.ChangeNote,
                    RestoredFromVersionNumber = h.RestoredFromVersionNumber
                })
                .ToListAsync();
        }

        public async Task<QuestionnaireScriptHistory> GetHistoryVersionAsync(int historyId)
        {
            var entity = await _unitOfWork.Repository<QuestionnaireScriptHistory>()
                .Entity()
                .FirstOrDefaultAsync(h => h.QuestionnaireScriptHistoryId == historyId);

            if (entity == null)
                throw new KeyNotFoundException($"History with id {historyId} not found.");

            return entity;
        }

        public async Task<bool> RestoreVersionAsync(int scriptId, int versionNumber, int userId, string changeNote)
        {
            if (string.IsNullOrWhiteSpace(changeNote))
                throw new ArgumentException("Enter a Change Note explaining why this version is being restored.");

            var activeScript = await _unitOfWork.Repository<QuestionnaireScript>().Entity()
                                                .FirstOrDefaultAsync(s => s.QuestionnaireScriptId == scriptId);

            var historyToRestore = await _unitOfWork.Repository<QuestionnaireScriptHistory>()
                .Entity()
                .FirstOrDefaultAsync(h => h.QuestionnaireScriptId == scriptId && h.VersionNumber == versionNumber);

            if (activeScript == null || historyToRestore == null) return false;

            // Verify restoration makes a change
            if (activeScript.ScriptName == historyToRestore.ScriptName &&
                activeScript.ScriptDescription == historyToRestore.ScriptDescription &&
                activeScript.Script == historyToRestore.Script)
            {
                throw new ArgumentException("The selected version is already the current version and cannot be restored.");
            }

            DateTime now = DateTime.UtcNow;

            // Restore active values
            activeScript.ScriptName = historyToRestore.ScriptName;
            activeScript.ScriptDescription = historyToRestore.ScriptDescription;
            activeScript.Script = historyToRestore.Script;
            activeScript.ModifiedBy = userId;
            activeScript.ModifyDate = now;

            // Create new restore history record
            int nextVersion = await GetNextVersionNumberAsync(scriptId);
            var restoreHistory = CreateHistorySnapshot(activeScript, "Restore", nextVersion, userId, now, changeNote);
            restoreHistory.RestoredFromVersionNumber = versionNumber;

            _unitOfWork.Repository<QuestionnaireScriptHistory>().Add(restoreHistory);
            _unitOfWork.SaveChanges(); // Transactional commit

            return true;
        }

        private async Task<int> GetNextVersionNumberAsync(int scriptId)
        {
            int maxVersion = await _unitOfWork.Repository<QuestionnaireScriptHistory>().Entity()
                .Where(h => h.QuestionnaireScriptId == scriptId)
                .MaxAsync(h => (int?)h.VersionNumber) ?? 0;
            return maxVersion + 1;
        }

        private QuestionnaireScriptHistory CreateHistorySnapshot(QuestionnaireScript script, string actionType, int version, int userId, DateTime changeDate, string note)
        {
            return new QuestionnaireScriptHistory
            {
                QuestionnaireScriptId = script.QuestionnaireScriptId,
                QuestionnaireId = script.QuestionnaireId,
                VersionNumber = version,
                ScriptName = script.ScriptName,
                ScriptDescription = script.ScriptDescription,
                Script = script.Script,
                ActionType = actionType,
                ChangedBy = userId,
                ChangeDate = changeDate,
                ChangeNote = note
            };
        }

        public async Task GenerateBaselineAsync()
        {
            var scriptsWithoutHistory = await _unitOfWork.Repository<QuestionnaireScript>().Entity()
                .Where(s => !s.History.Any())
                .ToListAsync();

            foreach (var script in scriptsWithoutHistory)
            {
                var history = CreateHistorySnapshot(
                    script, "Baseline", 1,
                    script.ModifiedBy ?? script.CreatedBy ?? 0,
                    script.ModifyDate ?? script.CreateDate ?? DateTime.UtcNow,
                    "Initial history baseline created during implementation");

                _unitOfWork.Repository<QuestionnaireScriptHistory>().Add(history);
            }
            _unitOfWork.SaveChanges();
        }

        public async Task<QuestionnaireScript> SaveScriptAsync(QuestionnaireScript inputScript, int userId, string changeNote)
        {
            var existingScript = await _unitOfWork.Repository<QuestionnaireScript>().Entity()
                .FirstOrDefaultAsync(s => s.QuestionnaireScriptId == inputScript.QuestionnaireScriptId);

            bool isCreate = existingScript == null;
            DateTime now = DateTime.UtcNow;

            if (isCreate)
            {
                inputScript.CreateDate = now;
                inputScript.CreatedBy = userId;
                _unitOfWork.Repository<QuestionnaireScript>().Add(inputScript);

                // Generate initial history
                var history = CreateHistorySnapshot(inputScript, "Create", 1, userId, now, changeNote);
                _unitOfWork.Repository<QuestionnaireScriptHistory>().Add(history);
            }
            else
            {
                // Unchanged Saves Requirement: Do not create history if content is identical
                if (existingScript.ScriptName == inputScript.ScriptName &&
                    existingScript.ScriptDescription == inputScript.ScriptDescription &&
                    existingScript.Script == inputScript.Script)
                {
                    return existingScript; // No changes to save
                }

                // Apply updates
                existingScript.ScriptName = inputScript.ScriptName;
                existingScript.ScriptDescription = inputScript.ScriptDescription;
                existingScript.Script = inputScript.Script;
                existingScript.ModifiedBy = userId;
                existingScript.ModifyDate = now;

                // Generate next version history
                int nextVersion = await GetNextVersionNumberAsync(existingScript.QuestionnaireScriptId);
                var history = CreateHistorySnapshot(existingScript, "Update", nextVersion, userId, now, changeNote);
                _unitOfWork.Repository<QuestionnaireScriptHistory>().Add(history);
            }

            // EF Core SaveChanges automatically wraps both inserts/updates in a transaction
            await _unitOfWork.SaveChangesAsync();
            return isCreate ? inputScript : existingScript;
        }

        public IEnumerable<Questionnaire> SearchQuestionnaries(int questionnaireId)
        {
            var query = _unitOfWork.Repository<Questionnaire>().Entity().AsNoTracking();
            if (questionnaireId > 0)
            {
                query = query.Where(x => x.QuestionnaireId == questionnaireId);
            }

            return query
                .OrderBy(x => x.Name)
                .ThenBy(x => x.QuestionnaireId)
                .ToList();
        }
    }
}
