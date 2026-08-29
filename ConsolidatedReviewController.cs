using Demo.Services.Common;
using Demo.Services.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Demo.API.Controllers
{
    [ApiController]
    public class ConsolidatedReviewController : ControllerBase
    {
        private readonly IConsolidatedReviewService _consolidatedReviewService;
        private readonly ISharedService _sharedService;

        public ConsolidatedReviewController(IConsolidatedReviewService consolidatedReviewService, ISharedService sharedService)
        {
            _consolidatedReviewService = consolidatedReviewService;
            _sharedService = sharedService;
        }
        [HttpGet]
        [Route("GetConsPgmIdLookup")]
        public async Task<IActionResult> GetConsPgmIdLookup(
            [FromQuery] string? grantPgms,
            CancellationToken cancellationToken)
        {
            var codes = (grantPgms ?? string.Empty).Split(
                new[] { ',', ';' },
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return Ok(await _consolidatedReviewService.GetConsPgmIdLookupAsync(codes, cancellationToken));
        }

        [HttpGet]
        [Route("GetConsolidatedReviewLookup")]
        public IActionResult GetConsolidatedReviewLookup(string pgmName)
        {
            return Ok(_consolidatedReviewService.GetConsolidatedReviewLookup(pgmName));
        }

        [HttpPost]
        [Route("GetRvwAgyLup")]
        public IActionResult GetRvwAgyLup([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetRvwAgyLup(parms));
        }

        [HttpGet]
        [Route("GetConsolidatedReviews")]
        public IActionResult GetConsolidatedReviews(int pgmId, string rvwType, int agencyId)
        {
            return Ok(_consolidatedReviewService.GetConsolidatedReviews(pgmId, rvwType, agencyId));
        }

        [HttpPost]
        [Route("GetConsolReviewCharteringAgency")]
        public IActionResult GetConsolReviewCharteringAgency([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsolReviewCharteringAgency(parms));
        }

        [HttpGet]
        [Route("GetConsReviewTeam")]
        public IActionResult GetConsReviewTeam(int subRvwId, string recType)
        {
            return Ok(_consolidatedReviewService.GetConsReviewTeam(subRvwId, recType));
        }

        [HttpPost]
        [Route("GetConsPreSelectionRoleInfo")]
        public IActionResult GetConsPreSelectionRoleInfo([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsPreSelectionRoleInfo(parms));
        }

        [HttpPost]
        [Route("GetConsSchedulingDocInfo")]
        public IActionResult GetConsSchedulingDocInfo([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsSchedulingDocInfo(parms));
        }

        [HttpPost]
        [Route("GetConsRvwDocInfo")]
        public IActionResult GetConsRvwDocInfo([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsRvwDocInfo(parms));
        }

        [HttpPost]
        [Route("GetConsPgmRoleTypeLup")]
        public IActionResult GetConsPgmRoleTypeLup([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsPgmRoleTypeLup(parms));
        }

        [HttpPost]
        [Route("GetConsAssignSchedUsersLup")]
        public IActionResult GetConsAssignSchedUsersLup([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsAssignSchedUsersLup(parms));
        }

        [HttpPost]
        [Route("GetConsAgyUserLup")]
        public IActionResult GetConsAgyUserLup([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsAgyUserLup(parms));
        }

        [HttpPost]
        [Route("GetConsSubRecipientRvwStatus")]
        public IActionResult GetConsSubRecipientRvwStatus([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsSubRecipientRvwStatus(parms));
        }

        [HttpPost]
        [Route("GetConsSubRecInfoAuto")]
        public IActionResult GetConsSubRecInfoAuto([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsSubRecInfoAuto(parms));
        }

        [HttpPost]
        [Route("GetConsNextStageStatus")]
        public IActionResult GetConsNextStageStatus([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsNextStageStatus(parms));
        }

        [HttpPost]
        [Route("GetConsReviewerOverallComment")]
        public IActionResult GetConsReviewerOverallComment([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsReviewerOverallComment(parms));
        }

        [HttpGet]
        [Route("GetConsEmailLogInfo")]
        public IActionResult GetConsEmailLogInfo(int logId)
        {
            return Ok(_consolidatedReviewService.GetConsEmailLogInfo(logId));
        }

        [HttpGet]
        [Route("GetConsReviewStageHistory")]
        public IActionResult GetConsReviewStageHistory(int subRvwId)
        {
            return Ok(_consolidatedReviewService.GetConsReviewStageHistory(subRvwId));
        }

        [HttpGet]
        [Route("GetConsReviewEmailData")]
        public IActionResult GetConsReviewEmailData(int subRvwId)
        {
            return Ok(_consolidatedReviewService.GetConsReviewEmailData(subRvwId));
        }

        [HttpGet]
        [Route("GetConsRefDataInfo")]
        public IActionResult GetConsRefDataInfo(string refType, string refSubType)
        {
            return Ok(_sharedService.GetRefDataByRefType(refType, refSubType));
        }

        [HttpGet]
        [Route("GetConsMiscData")]
        public IActionResult GetConsMiscData(int subRvwId)
        {
            return Ok(_consolidatedReviewService.GetConsMiscData(subRvwId));
        }

        [HttpPost]
        [Route("GetConsFormDocLup")]
        public IActionResult GetConsFormDocLup([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsFormDocLup(parms));
        }

        [HttpPost]
        [Route("AddConsolidatedReview")]
        public IActionResult AddConsolidatedReview([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.AddConsolidatedReview(parms));
        }

        [HttpPost]
        [Route("ProgramMgmtInfo")]
        public IActionResult ProgramMgmtInfo([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.ProgramMgmtInfo(parms));
        }

        [HttpPost]
        [Route("GetSessionVariables")]
        public IActionResult GetSessionVariables([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetSessionVariables(parms));
        }

        [HttpGet]
        [Route("GetLCELClaimInfo")]
        public IActionResult GetLCELClaimInfo(int subRvwId)
        {
            return Ok(_consolidatedReviewService.GetLCELClaimInfo(subRvwId));
        }

        [HttpGet]
        [Route("GetFalseELInfo")]
        public IActionResult GetFalseELInfo(string? districtName, string? districtCode, string? uicCode)
        {
            return Ok(_consolidatedReviewService.GetFalseELInfo(districtName, districtCode, uicCode));
        }

        [HttpGet]
        [Route("GetELDistrictName")]
        public IActionResult GetELDistrictName()
        {
            return Ok(_consolidatedReviewService.GetELDistrictName());
        }

        [HttpGet]
        [Route("GetELUIC")]
        public IActionResult GetFalseELUIC()
        {
            return Ok(_consolidatedReviewService.GetFalseELUIC());
        }


        [HttpPost]
        [Route("SaveConsolReviewDetails")]
        public IActionResult SaveConsolReviewDetails([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.SaveConsolReviewDetails(parms));
        }

        [HttpPost]
        [Route("SaveConsolReviewSchedDocs")]
        public IActionResult SaveConsolReviewSchedDocs([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.SaveConsolReviewSchedDocs(parms));
        }

        [HttpPost]
        [Route("SaveConsolOverallComments")]
        public IActionResult SaveConsolOverallComments([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.SaveConsolOverallComments(parms));
        }

        [HttpPost]
        [Route("  ")]
        public IActionResult SaveConsolMiscData([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.SaveConsolMiscData(parms));
        }

        [HttpPost]
        [Route("SaveConsolDocumentList")]
        public IActionResult SaveConsolDocumentList([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.SaveConsolDocumentList(parms));
        }

        [HttpPost]
        [Route("SaveConsDeskReview")]
        public IActionResult SaveConsDeskReview([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.SaveConsDeskReview(parms));
        }

        [HttpPost]
        [Route("GetDocumentSequenceInfo")]
        public IActionResult GetDocumentSequenceInfo([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetDocumentSequenceInfo(parms));
        }

        [HttpPost]
        [Route("SelectReviewDocumentInfo")]
        public IActionResult SelectReviewDocumentInfo([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.SelectReviewDocumentInfo(parms));
        }

        [HttpPost]
        [Route("GetConsWFStages")]
        public IActionResult GetConsWFStages([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetConsWFStages(parms));
        }

        [HttpPost]
        [Route("ReturnReviewToPriorStage")]
        public IActionResult ReturnReviewToPriorStage([FromBody] ConsolReviewParms parms)
        {
            _consolidatedReviewService.ReturnReviewToPriorStage(parms);
            return Ok(true);
        }

        [HttpPost]
        [Route("UpdateReviewStageDates")]
        public IActionResult UpdateReviewStageDates([FromBody] ConsolReviewParms parms)
        {
            _consolidatedReviewService.UpdateReviewStageDates(parms);
            return Ok(true);
        }

        [HttpGet]
        [Route("GetEEMContractInfo")]
        public IActionResult GetEEMContractInfo(string refCode)
        {
            return Ok(_consolidatedReviewService.GetEEMContractInfo(refCode));
        }

        [HttpPost]
        [Route("GetEEMSmartSearchNavigation")]
        public IActionResult GetEEMSmartSearchNavigation([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.GetEEMSmartSearchNavigation(parms));
        }

        [HttpPost]
        [Route("GetProgramReviewTypeInfo")]
        public IActionResult GetProgramReviewTypeInfo([FromBody] ConsolReviewParms parms)
        {
            return Ok(_consolidatedReviewService.ProgramReviewTypeInfo(parms));
        }

    }
}
