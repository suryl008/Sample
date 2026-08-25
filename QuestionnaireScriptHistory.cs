using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Entities
{
    public class QuestionnaireScriptHistory : BaseEntity
    {
        public int QuestionnaireScriptHistoryId { get; set; }
        public int QuestionnaireScriptId { get; set; }
        public int? QuestionnaireId { get; set; }
        public int VersionNumber { get; set; }
        public string? ScriptName { get; set; }
        public string? ScriptDescription { get; set; }
        public string? Script { get; set; }
        public string ActionType { get; set; } = null!;
        public int? ChangedBy { get; set; }
        public DateTime ChangeDate { get; set; }
        public string? ChangeNote { get; set; }
        public int? RestoredFromVersionNumber { get; set; }
        public QuestionnaireScript QuestionnaireScript { get; set; } = null!;
        
    }
}
