using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Entities
{
    public class QuestionnaireScript : BaseEntity
    {
        public int QuestionnaireScriptId { get; set; }
        public int? QuestionnaireId { get; set; }
        public string? Script  { get; set; }
        public int?  CreatedBy { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifyDate { get; set; }
        public string? ScriptName { get; set; }
        public string? ScriptDescription { get; set; }
        public virtual ICollection<QuestionnaireScriptHistory> History { get; set; } = new List<QuestionnaireScriptHistory>();

    }
}
