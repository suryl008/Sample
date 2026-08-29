using AutoMapper;
using AutoMapper.QueryableExtensions;
using Demo.Services.Common;
using Demo.Services.Interfaces.Providers;
using Demo.Services.Interfaces.Services;
using Demo.Services.Models;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace Demo.Services.Services
{
    public class ConsolidatedReviewService : IConsolidatedReviewService
    {
        private readonly ISharedService _sharedService;
        private readonly IConsolidatedReviewProvider _consolidatedReviewProvider;
        private IMapper _mapper;
        private readonly IConfiguration _configuration;


        public ConsolidatedReviewService(ISharedService sharedService, IConsolidatedReviewProvider consolidatedReviewProvider, IMapper mapper, IConfiguration configuration)
        {
            _sharedService = sharedService;
            _consolidatedReviewProvider = consolidatedReviewProvider;
            _mapper = mapper;
            _configuration = configuration;
        }

        public Task<IReadOnlyList<ConsPgmIdLookupModel>> GetConsPgmIdLookupAsync(
            IEnumerable<string> grantPgms,
            CancellationToken cancellationToken)
        {
            return _consolidatedReviewProvider.GetConsPgmIdLookupAsync(grantPgms, cancellationToken);
        }

        public IEnumerable<dynamic> GetConsolidatedReviewLookup(string pgmName)
        {
            var result = _consolidatedReviewProvider.GetConsolidatedReviewLookup(pgmName);
            return result.AsQueryable().ProjectTo<PgmRvwInfoModel>(_mapper.ConfigurationProvider);
        }


        public IEnumerable<dynamic> AddConsolidatedReview(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.AddConsolidatedReview(parms);
        }

        public IEnumerable<dynamic> GetConsAgyUserLup(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsAgyUserLup(parms);
        }

        public IEnumerable<dynamic> GetConsAssignSchedUsersLup(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetAssignSchedUsersLup(parms);
        }

        public IEnumerable<dynamic> GetConsEmailLogInfo(int logId)
        {
            return _consolidatedReviewProvider.GetConsEmailLogInfo(logId);
        }

        public IEnumerable<dynamic> GetConsFormDocLup(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsFormDocLup(parms);
        }

        public IEnumerable<dynamic> GetConsMiscData(int subRvwId)
        {
            return _consolidatedReviewProvider.GetConsMiscData(subRvwId);
        }

        public IEnumerable<dynamic> GetConsNextStageStatus(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsNextStageStatus(parms);
        }

       

        public IEnumerable<dynamic> GetConsolidatedReviews(int pgmId, string rvwType, int agencyId)
        {
            return _consolidatedReviewProvider.GetConsolidatedReviews(pgmId, rvwType, agencyId);
        }

        public IEnumerable<dynamic> GetConsolReviewCharteringAgency(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsolReviewCharteringAgency(parms);
        }

        public IEnumerable<dynamic> GetConsPgmRoleTypeLup(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsPgmRoleTypeLup(parms);
        }

        public IEnumerable<dynamic> GetConsPreSelectionRoleInfo(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetPreSelectionRoleInfo(parms);
        }
        public IEnumerable<dynamic> GetConsReviewEmailData(int subRvwId)
        {
            return _consolidatedReviewProvider.GetConsReviewEmailData(subRvwId);
        }

        public IEnumerable<dynamic> GetConsReviewerOverallComment(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsReviewerOverallComment(parms);
        }

        public IEnumerable<dynamic> GetConsReviewStageHistory(int subRvwId)
        {
            return _consolidatedReviewProvider.GetConsReviewStageHistory(subRvwId);
        }

        public IEnumerable<dynamic> GetConsReviewTeam(int subRvwId, string recType)
        {
            return _consolidatedReviewProvider.GetReviewTeam(subRvwId, recType);
        }

        public IEnumerable<dynamic> GetConsRvwDocInfo(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetRvwDocInfo(parms);
        }

        public IEnumerable<dynamic> GetConsSubRecInfoAuto(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsSubRvwInfoAuto(parms);
        }

        public IEnumerable<dynamic> GetConsSubRecipientRvwStatus(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsSubRecipientRvwStatus(parms);
        }

        public IEnumerable<dynamic> GetRvwAgyLup(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetRvwAgyLup(parms);
        }

        public IEnumerable<dynamic> GetConsSchedulingDocInfo(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetSchedulingDocInfo(parms);
        }

        public IEnumerable<dynamic> ProgramMgmtInfo(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.ProgramMgmtInfo(parms);
        }

        public IEnumerable<dynamic> GetLCELClaimInfo(int subRvwId)
        {
            return _consolidatedReviewProvider.GetLCELClaimInfo(subRvwId);
        }

        public IEnumerable<dynamic> ProgramReviewTypeInfo(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.ProgramReviewTypeInfo(parms);
        }

        public bool SaveConsolReviewDetails(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.SaveConsolReviewDetails(parms);
        }

        public bool SaveConsolReviewSchedDocs(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.SaveConsolReviewSchedDocs(parms);
        }

        public IEnumerable<dynamic> GetSessionVariables(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetSessionVariables(parms);
        }

        public bool SaveConsolOverallComments(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.SaveConsolOverallComments(parms);
        }

        public bool SaveConsolMiscData(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.SaveConsolMiscData(parms);
        }

        public bool SaveConsolDocumentList(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.SaveConsolDocumentList(parms);
        }

        public bool SaveConsDeskReview(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.SaveConsDeskReview(parms);
        }

        public IEnumerable<dynamic> GetDocumentSequenceInfo(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetDocumentSequenceInfo(parms);
        }

        public IEnumerable<dynamic> SelectReviewDocumentInfo(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.SelectReviewDocumentInfo(parms);
        }

        public IEnumerable<dynamic> GetConsWFStages(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetConsWFStages(parms);
        }

        public void ReturnReviewToPriorStage(ConsolReviewParms parms)
        {
            _consolidatedReviewProvider.ReturnReviewToPriorStage(parms);
        }

        public void UpdateReviewStageDates(ConsolReviewParms parms)
        {
            _consolidatedReviewProvider.UpdateReviewStageDates(parms);
        }

        public IEnumerable<dynamic> GetEEMContractInfo(string refCode)
        {
            return _consolidatedReviewProvider.GetEEMContractInfo(refCode);
        }

        public IEnumerable<dynamic> GetEEMSmartSearchNavigation(ConsolReviewParms parms)
        {
            return _consolidatedReviewProvider.GetEEMSmartSearchNavigation(parms);
        }

        public IEnumerable<dynamic> GetFalseELInfo(string? districtName, string? districtCode, string? uicCode)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<SubRecInfoModel> GetELDistrictName()
        {
            throw new NotImplementedException();
        }

        public IEnumerable<FlaseELSubmissionModel> GetFalseELUIC()
        {
            throw new NotImplementedException();
        }
    }
}