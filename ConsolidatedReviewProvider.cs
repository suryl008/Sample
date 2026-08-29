using Demo.Entities;
using Demo.Repository.Interfaces.UnitOfWork;
using Demo.Services.Common;
using Demo.Services.Interfaces.Providers;
using Demo.Services.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Demo.Services.Providers
{
    public class ConsolidatedReviewProvider : IConsolidatedReviewProvider
    {
        private readonly IDemoUnitOfWork _unitOfWork;
        private readonly ILogger<ConsolidatedReviewProvider> _logger;

        public ConsolidatedReviewProvider(
            IDemoUnitOfWork unitOfWork,
            ILogger<ConsolidatedReviewProvider> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<IReadOnlyList<ConsPgmIdLookupModel>> GetConsPgmIdLookupAsync(
            IEnumerable<string> grantPgms,
            CancellationToken cancellationToken)
        {
            try
            {
                var requestedCodes = (grantPgms ?? Enumerable.Empty<string>())
                    .Where(code => !string.IsNullOrWhiteSpace(code))
                    .Select(code => code.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (requestedCodes.Count == 0)
                {
                    return Array.Empty<ConsPgmIdLookupModel>();
                }

                var matches = await _unitOfWork.Repository<PgmInfo>().Entity()
                    .AsNoTracking()
                    .Where(p => p.GrantPgm != null && requestedCodes.Contains(p.GrantPgm))
                    .Select(p => new
                    {
                        p.GrantPgm,
                        p.GrantPgmId,
                        p.RoundNo,
                        p.RecStat
                    })
                    .ToListAsync(cancellationToken);

                var lookup = matches
                    .Where(row => !string.IsNullOrWhiteSpace(row.GrantPgm))
                    .GroupBy(row => row.GrantPgm!, StringComparer.OrdinalIgnoreCase)
                    .Select(group =>
                    {
                        var activeRows = group
                            .Where(row => string.Equals(row.RecStat, "A", StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        var pool = activeRows.Count > 0 ? activeRows : group.ToList();
                        var selected = pool
                            .OrderByDescending(row => row.RoundNo)
                            .First();

                        return new ConsPgmIdLookupModel
                        {
                            GrantPgm = selected.GrantPgm!,
                            GrantPgmId = selected.GrantPgmId,
                            RoundNo = selected.RoundNo
                        };
                    })
                    .ToList();

                _logger.LogInformation(
                    "GetConsPgmIdLookup resolved {ResolvedCount} of {RequestedCount} grant programs.",
                    lookup.Count,
                    requestedCodes.Count);

                return lookup;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetConsPgmIdLookup failed.");
                throw;
            }
        }

        public IEnumerable<PgmRvwInfo> GetConsolidatedReviewLookup(string pgmName)
        {
            var pgmInfo = _unitOfWork.Repository<PgmInfo>().Entity().FirstOrDefault(x => x.GrantPgm == pgmName);
            int pgmId = pgmInfo != null ? pgmInfo.GrantPgmId : 0;

            var pgmRvwInfos = _unitOfWork.Repository<PgmRvwInfo>().Entity().Where(x => x.GrantPgmId == pgmId && x.RecStat == "O").Join(_unitOfWork.Repository<RvwType>().Entity(),
                ri => ri.RvwType,
                rt => rt.RvwType1,
                (ri, rt) => new PgmRvwInfo()
                {
                    PgmRvwId = ri.PgmRvwId,
                    RvwType = ri.RvwType,
                    RvwDesc = rt.RvwDesc,
                });
            return pgmRvwInfos.OrderBy(x => x.RvwDesc).ToList();
                                                            
        }

        public IEnumerable<dynamic> GetConsolReviewCharteringAgency(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_consolidated_review_chartering_agency_sel ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@CharteringAgency='" + parms.CharteringAgency + "'");
            SQL.Append(", ");
            SQL.Append("@PSA='" + parms.PSA + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_yr='" + parms.RvwYear + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsolidatedReviews(int pgmId, string rvwType, int agencyId)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_consolidated_review_sel ");
            SQL.Append("@grant_pgm_id=" + pgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + rvwType + "'");
            SQL.Append(", ");
            SQL.Append("@agency_id=" + agencyId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetRvwAgyLup(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_rvw_agy_lup ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@rec_type='" + parms.RecType + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_cat='" + parms.RvwCat + "'");
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@sub_rec_cd='" + parms.SubRecCd + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rec_name='" + parms.SubRecName + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");
            SQL.Append(", ");
            SQL.Append("@order_by='" + parms.OrderBy + "'");
            SQL.Append(", ");
            SQL.Append("@showcancel_rvw='" + parms.ShowCancelRvw + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetSchedulingDocInfo(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_sched_docs ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@agency_id=" + parms.AgencyId);
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@off_cd='" + parms.OffCd + "'");
            SQL.Append(", ");
            SQL.Append("@p_c_ind='" + parms.PCInd + "'");
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetRvwDocInfo(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_rvw_docs ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@doc_srl=" + parms.DocSrl);
            SQL.Append(", ");
            SQL.Append("@ver_no=" + parms.VerNo);
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsAgyUserLup(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egr_agy_user_lup ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@agency_id=" + parms.AgencyId);
            SQL.Append(", ");
            SQL.Append("@user_name='" + parms.UserName + "'");
            SQL.Append(", ");
            SQL.Append("@f_l_name='" + parms.FLName + "'");
            SQL.Append(", ");
            SQL.Append("@p_c_rel='" + parms.PCRel + "'");
            SQL.Append(", ");
            SQL.Append("@p_c_ind='" + parms.PCInd + "'");
            SQL.Append(", ");
            SQL.Append("@order_by='" + parms.OrderBy + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetAssignSchedUsersLup(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_assign_sched_users_lup ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@off_cd='" + parms.OffCd + "'");
            SQL.Append(", ");
            SQL.Append("@auth_ind='" + parms.AuthInd + "'");
            SQL.Append(", ");
            SQL.Append("@user_name='" + parms.UserName + "'");
            SQL.Append(", ");
            SQL.Append("@contact_name='" + parms.FLName + "'");
            SQL.Append(", ");
            SQL.Append("@order_by='" + parms.OrderBy + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsPgmRoleTypeLup(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_pgm_role_type_lup ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@role_cls='" + parms.RoleCls + "'");
            SQL.Append(", ");
            SQL.Append("@role_ind='" + parms.RoleInd + "'");
            SQL.Append(", ");
            SQL.Append("@role_type='" + parms.RoleType + "'");
            SQL.Append(", ");
            SQL.Append("@role_name='" + parms.RoleName + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");
            SQL.Append(", ");
            SQL.Append("@order_by='" + parms.OrderBy + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsSubRvwInfoAuto(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("declare @p3 int ");
            SQL.Append("set @p3=0 ");
            SQL.Append("exec egm_sub_rvw_info_autocomplete ");
            SQL.Append("@input='" + parms.Input + "'");
            SQL.Append(", ");
            SQL.Append("@MaxResults=" + parms.MaxResults);
            SQL.Append(", ");
            SQL.Append("@TotalResults=@p3 output");
            SQL.Append(", ");
            SQL.Append("@grantPgmID=" + parms.GrantPgmId);
            SQL.Append(" select @p3");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsReviewerOverallComment(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_rvw_oa_comments ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_id=" + parms.RvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_cat='" + parms.RvwCat + "'");
            SQL.Append(", ");
            SQL.Append("@comment_cat='" + parms.CommentCat + "'");
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@comment_dt='" + parms.CommentDate + "'");
            SQL.Append(", ");
            SQL.Append("@SD_comment=" + (parms.SDComment == true ? 1 : 0));

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsEmailLogInfo(int logId)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_email_log_id_sel ");
            SQL.Append("@Log_Id=" + logId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsSubRecipientRvwStatus(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_sub_rvw_stat_sel ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@agency_id=" + parms.AgencyId);
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsReviewStageHistory(int subRvwId)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_ReviewStageHistory ");
            SQL.Append("@sub_rvw_id=" + subRvwId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsNextStageStatus(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_next_stat ");
            SQL.Append("@rvw_id=" + parms.RvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@stage_stat='" + parms.StageStat + "'");
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsReviewEmailData(int subRvwId)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec selectReviewEmail ");
            SQL.Append("@sub_rvw_id=" + subRvwId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsMiscData(int subRvwId)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_pgm_misc_data_sel ");
            SQL.Append("@sub_rvw_id=" + subRvwId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsFormDocLup(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_form_doc_lup ");
            SQL.Append("@formCode='" + parms.FormCode + "'");
            SQL.Append(", ");
            SQL.Append("@formDescription='" + parms.FormDescription + "'");
            SQL.Append(", ");
            SQL.Append("@docType='" + parms.DocType + "'");
            SQL.Append(", ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@order_by='" + parms.OrderBy + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> AddConsolidatedReview(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("declare @p7 int ");
            SQL.Append("set @p7=0 ");
            SQL.Append("exec egm_consolidated_review_ins ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rec_cd='" + parms.SubRecCd + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_year='" + parms.RvwYear + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=@p7 output");
            SQL.Append(" select @p7");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> ProgramMgmtInfo(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_pgm_mgmt_info_sel ");
            SQL.Append("@grant_pgm='" + parms.GrantPgm + "'");
            SQL.Append(", ");
            SQL.Append("@grant_pgm_desc='" + parms.GrantPgmDesc + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_type_cd='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_type_desc='" + parms.RvwTypeDesc + "'");
            SQL.Append(", ");
            SQL.Append("@meis_id='" + parms.MEISID + "'");
            SQL.Append(", ");
            SQL.Append("@contact_name='" + parms.ContactName + "'");
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetLCELClaimInfo(int subRvwId)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_sub_rvw_get_lce_claim_info ");
            SQL.Append("@sub_rvw_id=" + subRvwId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> ProgramReviewTypeInfo(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_pgm_rvw_type_lup ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_desc='" + parms.RvwTypeDesc + "'");
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");
            SQL.Append(", ");
            SQL.Append("@rec_stat='" + parms.RecStat + "'");
            SQL.Append(", ");
            SQL.Append("@order_by='" + parms.OrderBy + "'");
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public bool SaveConsolReviewDetails(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQLRvwStat = new StringBuilder();
            var SQLSchdDates = new StringBuilder();

            SQLRvwStat.Append("exec egm_sub_rvw_stat_upd ");
            SQLRvwStat.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@rvw_yr='" + parms.RvwYear + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@rvw_dt_fr='" + parms.ReviewDateFrom + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@rvw_dt_to='" + parms.ReviewDateTo + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@doc_ind='" + parms.DocInd + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@stage_stat='" + parms.StageStat + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@cur_agenda='" + parms.CurAgenda + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@last_upd_id=" + parms.LastUpdId);
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@option='" + parms.Option + "'");
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@lce_claim_month=" + parms.LceClaimMonth);
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@lce_claim_year=" + parms.LceClaimYear);
            SQLRvwStat.Append(", ");
            SQLRvwStat.Append("@rvw_type='" + parms.RvwType + "'");

            SQLSchdDates.Append("exec egm_sub_rvw_schd_dt_upd ");
            SQLSchdDates.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQLSchdDates.Append(", ");
            SQLSchdDates.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQLSchdDates.Append(", ");
            SQLSchdDates.Append("@rvw_dt_fr='" + parms.ReviewDateFrom + "'");
            SQLSchdDates.Append(", ");
            SQLSchdDates.Append("@rvw_dt_to='" + parms.ReviewDateTo + "'");
            SQLSchdDates.Append(", ");
            SQLSchdDates.Append("@last_upd_id=" + parms.UserId);

            if (!string.IsNullOrEmpty(SQLRvwStat.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQLRvwStat.ToString());
            }

            if (!string.IsNullOrEmpty(SQLSchdDates.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQLSchdDates.ToString());
            }

            if (parms?.LceClaimInfo != null && parms.LceClaimInfo.Count > 0)
            {
                foreach (var item in parms.LceClaimInfo)
                {
                    var SQL = new StringBuilder();
                    SQL.Append("exec egm_pgm_misc_data_save ");
                    SQL.Append("@sub_rvw_id=" + item.SubRvwId);
                    SQL.Append(", ");
                    SQL.Append("@user_id=" + item.CreateId);
                    SQL.Append(", ");
                    SQL.Append("@pgm_misc_flds_id=" + item.PgmMiscFldsId);
                    SQL.Append(", ");
                    SQL.Append("@pgm_misc_data_id=" + item.PgmMiscDataId);
                    SQL.Append(", ");
                    SQL.Append("@field_data='" + item.FieldData + "'");

                    if (!string.IsNullOrEmpty(SQL.ToString()))
                    {
                        result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
                    }
                }
            }

            return true;
        }

        public bool SaveConsolReviewSchedDocs(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_sub_sched_docs ");
            SQL.Append("@parent_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@insp_activity='" + string.Empty + "'");
            SQL.Append(", ");
            SQL.Append("@xml_str='" + parms.XmlStr + "'");
            SQL.Append(", ");
            SQL.Append("@last_upd_id=" + parms.UserId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return true;
        }

        public bool SaveConsolOverallComments(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_rvw_comments_ins ");
            SQL.Append("@rvw_id=" + parms.RvwId);
            SQL.Append(", ");
            SQL.Append("@comment_txt='" + parms.Input + "'");
            SQL.Append(", ");
            SQL.Append("@comment_cat='" + parms.CommentCat + "'");
            SQL.Append(", ");
            SQL.Append("@create_dt='" + parms.CommentDate + "'");
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@last_upd_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@SD_comment=" + (parms.SDComment == true ? 1 : 0));

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return true;
        }

        public IEnumerable<dynamic> GetSessionVariables(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_session_variables ");
            SQL.Append("@rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@proj_cat_id=0");
            SQL.Append(", ");
            SQL.Append("@fund_mod_id=0");
            SQL.Append(", ");
            SQL.Append("@comp_plan_id=0");
            SQL.Append(", ");
            SQL.Append("@subAccount='" + string.Empty + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public bool SaveConsolMiscData(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_rvw_misc_data_save ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@pgm_misc_flds_id=" + parms.PgmMiscFldsId);
            SQL.Append(", ");
            SQL.Append("@pgm_misc_data_id=" + parms.PgmMiscDataId);
            SQL.Append(", ");
            SQL.Append("@field_data='" + parms.FieldData + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return true;
        }

        public bool SaveConsolDocumentList(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_rvw_doc_list ");
            SQL.Append("@cat='" + parms.SubCat + "'");
            SQL.Append(", ");
            SQL.Append("@doc_type='" + parms.DocType + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_id=" + parms.RvwId);
            SQL.Append(", ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rec_type='" + parms.RecType + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@log_activity='" + parms.LogActivity + "'");
            SQL.Append(", ");
            SQL.Append("@xml_str='" + parms.XmlStr + "'");
            SQL.Append(", ");
            SQL.Append("@user_id=" + parms.UserId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return true;
        }

        public bool SaveConsDeskReview(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_rvw_comments ");
            SQL.Append("@rvw_id=" + parms.RvwId);
            SQL.Append(", ");
            SQL.Append("@log_activity='" + parms.LogActivity + "'");
            SQL.Append(", ");
            SQL.Append("@xml_str='" + parms.XmlStr + "'");
            SQL.Append(", ");
            SQL.Append("@last_upd_id=" + parms.UserId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return true;
        }

        public IEnumerable<dynamic> GetDocumentSequenceInfo(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("declare @gv int ");
            SQL.Append("set @gv=0 ");
            SQL.Append("exec egm_get_doc_seq ");
            SQL.Append("@off_cd='" + parms.OffCd + "'");
            SQL.Append(", ");
            SQL.Append("@sub_cat='" + parms.SubCat + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");
            SQL.Append(", ");
            SQL.Append("@seq_no=@gv output");
            SQL.Append(" select @gv");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> SelectReviewDocumentInfo(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_rvw_doc_list_sel ");
            SQL.Append("@sub_cat='" + parms.SubCat + "'");
            SQL.Append(", ");
            SQL.Append("@rec_type='" + parms.RecType + "'");
            SQL.Append(", ");
            SQL.Append("@off_cd='" + parms.OffCd + "'");
            SQL.Append(", ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@doc_cat='" + parms.DocCat + "'");
            SQL.Append(", ");
            SQL.Append("@doc_cat_desc='" + parms.DocCatDesc + "'");
            SQL.Append(", ");
            SQL.Append("@doc_cd='" + parms.DocCd + "'");
            SQL.Append(", ");
            SQL.Append("@doc_name='" + parms.DocName + "'");
            SQL.Append(", ");
            SQL.Append("@val_ind='" + parms.ValInd + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@inactive='" + parms.Inactive + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetConsWFStages(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egr_get_wf_stages ");
            SQL.Append("@wf_cd='" + parms.WfCd + "'");
            SQL.Append(", ");
            SQL.Append("@role_cd='" + parms.RoleCd + "'");
            SQL.Append(", ");
            SQL.Append("@app_cd='" + parms.AppCd + "'");
            SQL.Append(", ");
            SQL.Append("@perm_cd='" + parms.PermCd + "'");
            SQL.Append(", ");
            SQL.Append("@chk_access='" + parms.ChkAccess + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public void ReturnReviewToPriorStage(ConsolReviewParms parms)
        {
            var SQL = new StringBuilder();
            SQL.Append("exec ReturnReviewToPriorStage ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@return_to_prior_stage_reason='" + parms.Input + "'");
            SQL.Append(", ");
            SQL.Append("@last_upd_id=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@associated_file_name='" + parms.DocName + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
        }

        public void UpdateReviewStageDates(ConsolReviewParms parms)
        {
            var SQL = new StringBuilder();
            SQL.Append("exec UpdateReviewStageDates ");
            SQL.Append("@rvw_stat_id=" + parms.RvwStatId);
            SQL.Append(", ");
            SQL.Append("@act_start='" + parms.ActStart + "'");
            SQL.Append(", ");
            SQL.Append("@act_end='" + parms.ActEnd + "'");
            SQL.Append(", ");
            SQL.Append("@last_upd_id=" + parms.UserId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
        }

        public IEnumerable<dynamic> GetEEMContractInfo(string refCode)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec spGetEEMContractInfo ");
            SQL.Append("@ref_code='" + refCode + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetEEMSmartSearchNavigation(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec spCreateAngularSSNavigation ");
            SQL.Append("@UserId=" + parms.UserId);
            SQL.Append(", ");
            SQL.Append("@TargetWay='" + parms.TargetWay + "'");
            SQL.Append(", ");
            SQL.Append("@ParamXml='" + parms.XmlStr + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetReviewTeam(int subRvwId, string recType)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_ReviewTeam ");
            SQL.Append("@sub_rvw_id=" + subRvwId);
            SQL.Append(", ");
            SQL.Append("@rec_type='" + recType + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        public IEnumerable<dynamic> GetPreSelectionRoleInfo(ConsolReviewParms parms)
        {
            IEnumerable<dynamic> result = new List<dynamic>();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_pre_sel_role ");
            SQL.Append("@grant_pgm_id=" + parms.GrantPgmId);
            SQL.Append(", ");
            SQL.Append("@rvw_type='" + parms.RvwType + "'");
            SQL.Append(", ");
            SQL.Append("@agency_id=" + parms.AgencyId);
            SQL.Append(", ");
            SQL.Append("@grant_pgm='" + parms.GrantPgm + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rec_cd='" + parms.SubRecCd + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@role_cls='" + parms.RoleCls + "'");
            SQL.Append(", ");
            SQL.Append("@role_ind='" + parms.RoleInd + "'");
            SQL.Append(", ");
            SQL.Append("@auth_src='" + parms.AuthSrc + "'");
            SQL.Append(", ");
            SQL.Append("@option='" + parms.Option + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                result = _unitOfWork.Repository<BaseEntity>().ExecuteDynamicQuery(SQL.ToString());
            }
            return result;
        }

        private void UpdateSubReviewQuestionnaireResponse(ConsolReviewParms parms)
        {
            var SQL = new StringBuilder();
            SQL.Append("exec egmUpdateSubReviewQuestionnaireResponseStatus ");
            SQL.Append("@wf_cd='" + parms.WfCd + "'");
            SQL.Append(", ");
            SQL.Append("@rvw_stage='" + parms.RvwStage + "'");
            SQL.Append(", ");
            SQL.Append("@stage_stat='" + parms.StageStat + "'");
            SQL.Append(", ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                _unitOfWork.Repository<BaseEntity>().ExecuteQuery(SQL.ToString());
            }
        }

        private void CreateConsolidatedFindings(ConsolReviewParms parms)
        {
            DataSet dsResult = new DataSet();
            var SQL = new StringBuilder();
            SQL.Append("exec egm_get_ReviewFindings ");
            SQL.Append("@sub_rvw_id=" + parms.SubRvwId);
            SQL.Append(", ");
            SQL.Append("@rvw_id=" + parms.RvwId);
            SQL.Append(", ");
            SQL.Append("@cit_id=0");
            SQL.Append(", ");
            SQL.Append("@xml_str='" + parms.XmlStr + "'");
            SQL.Append(", ");
            SQL.Append("@Status='" + string.Empty + "'");

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                dsResult = _unitOfWork.Repository<BaseEntity>().ExecuteQuery(SQL.ToString());
                if (dsResult != null && dsResult.Tables.Count > 0)
                {
                    foreach (DataRow dr in dsResult.Tables[0].Rows)
                    {
                        if (int.TryParse(dr["rvw_find_id"]?.ToString(), out int findingID))
                        {
                            CopyFinding(findingID, parms.RvwId, parms.UserId);
                        }
                    }
                }
            }
        }

        private void CopyFinding(int findingID, int rvwId, int userId)
        {
            var SQL = new StringBuilder();
            SQL.Append("exec egm_CopyFinding ");
            SQL.Append("@rvw_find_id=" + findingID);
            SQL.Append(", ");
            SQL.Append("@rvw_id=" + rvwId);
            SQL.Append(", ");
            SQL.Append("@UserID=" + userId);

            if (!string.IsNullOrEmpty(SQL.ToString()))
            {
                _unitOfWork.Repository<BaseEntity>().ExecuteQuery(SQL.ToString());
            }
        }
    }
}
