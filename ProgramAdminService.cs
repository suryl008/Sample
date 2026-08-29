using AutoMapper;
using AutoMapper.QueryableExtensions;
using Demo.Entities;
using Demo.Services.Interfaces.Providers;
using Demo.Services.Interfaces.Services;
using Demo.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Demo.Services.Services
{
    public class ProgramAdminService : IProgramAdminService
    {
        private readonly IProgramAdminProvider _programAdminProvider;
        private readonly IMapper _mapper;

        public ProgramAdminService(IProgramAdminProvider programAdminProvider, IMapper mapper)
        {
            _programAdminProvider = programAdminProvider;
            _mapper = mapper;
        }
        public IQueryable<PgmLookup> GetAllPrograms()
        {
            var result = _programAdminProvider.GetAllPrograms();
            return result.AsQueryable().ProjectTo<PgmLookup>(_mapper.ConfigurationProvider);
        }

        public IQueryable<AgencyOffInfoModel> GetAllAgencyOffices()
        {
            var result = _programAdminProvider.GetAllAgencyOffices();
            return result.ProjectTo<AgencyOffInfoModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<UserInfoModel> GetUsersByOffCd(string offCd)
        {
            var result = _programAdminProvider.GetUsersByOffCd(offCd);
            return result.ProjectTo<UserInfoModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<PgmInfoModel> GetReviewTypesProgramId(int progamId)
        {
            var result = _programAdminProvider.GetReviewTypesProgramId(progamId);
            return result.ProjectTo<PgmInfoModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<UserInfoModel> GetUnAssignedOfficeUsersByPgmId(int pgmId, string offCd, string? recType = default)
        {
            var result = _programAdminProvider.GetUnAssignedOfficeUsersByPgmId(pgmId,offCd,recType);
            return result.AsQueryable().ProjectTo<UserInfoModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<RefDatumModel> GetRefDataByRefType(string refType, string refSubType, string? refAddlInfo = default)
        {
            var result = _programAdminProvider.GetRefDataByRefType(refType, refSubType, refAddlInfo);
            return result.ProjectTo<RefDatumModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<WfConfigModel> GetAllWorkFlowConfig()
        {
            var result = _programAdminProvider.GetAllWorkFlowConfig();
            return result.ProjectTo<WfConfigModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<RvwTypeModel> GetAllReviewTypes(int progamId)
        {
            var result = _programAdminProvider.GetAllReviewTypes(progamId);
            return result.AsQueryable().ProjectTo<RvwTypeModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<UserInfoModel> GetAssignedOfficeUsersByPgmId(int pgmId)
        {
            var result = _programAdminProvider.GetAssignedOfficeUsersByPgmId(pgmId);
            return result.AsQueryable().ProjectTo<UserInfoModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<PgmInfoModel> SaveProgramInfo(PgmInfoModel pgmInfoModel)
        {
            var pgmInfoEntity = _mapper.Map<PgmInfo>(pgmInfoModel);
            var result = _programAdminProvider.SaveProgramInfo(pgmInfoEntity);
            return result.ProjectTo<PgmInfoModel>(_mapper.ConfigurationProvider);
        }

        public IQueryable<PgmInfoModel> GetAllProgramsSearch(string programName)
        {
            var result = _programAdminProvider.GetAllProgramsSearch(programName);
            return result.AsQueryable().ProjectTo<PgmInfoModel>(_mapper.ConfigurationProvider);
        }
    }
}
