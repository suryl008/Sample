using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Services.Common
{
    public class RestoreScriptRequestParms
    {
        public int QuestionnaireScriptId { get; set; }
        public int SourceVersionNumber { get; set; }
        public int CurrentUserId { get; set; }
        public string? ChangeNote { get; set; }
    }
}
