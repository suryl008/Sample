using AutoMapper;
using Demo.Services.Interfaces.Services;
using Demo.Services.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Demo.API.Controllers
{
    [ApiController]
    public class ProgramAdminController : ControllerBase
    {
        private readonly IProgramAdminService _programAdminService;

        public ProgramAdminController(IProgramAdminService programAdminService)
        {
            _programAdminService = programAdminService;
        }

        [HttpGet]
        [Route("GetAllPgmSearchLookup")]
        [EnableQuery]
        public IActionResult GetAllProgramsSearch(string programName)
        {
            return Ok(_programAdminService.GetAllProgramsSearch(programName));
        }

        [HttpGet]
        [Route("GetAllPgmInfo")]
        [EnableQuery]
        public IActionResult GetAllPrograms()
        {
            return Ok(_programAdminService.GetAllPrograms());
        }

        [HttpGet]
        [Route("GetAllOffInfo")]
        [EnableQuery]
        public IActionResult GetAllAgencyOffices()
        {
            return Ok(_programAdminService.GetAllAgencyOffices());
        }

        [HttpGet]
        [Route("GetUsersByOffCd")]
        [EnableQuery]
        public IActionResult GetUsersByOffCd(string offCd)
        {
            return Ok(_programAdminService.GetUsersByOffCd(offCd));
        }

        [HttpGet]
        [Route("GetAllRvwTypes")]
        [EnableQuery]
        public IActionResult GetAllReviewTypes(int progamId)
        {
            return Ok(_programAdminService.GetAllReviewTypes(progamId));
        }

        [HttpGet]
        [Route("GetRvwTypesByPgmId")]
        [EnableQuery]
        public IActionResult GetReviewTypesProgramId(int progamId)
        {
            return Ok(_programAdminService.GetReviewTypesProgramId(progamId));
        }

        [HttpGet]
        [Route("GetAssignedOffUsersByPgmId")]
        [EnableQuery]
        public IActionResult GetAssignedOfficeUsersByPgmId(int pgmId)
        {
            return Ok(_programAdminService.GetAssignedOfficeUsersByPgmId(pgmId));
        }

        [HttpGet]
        [Route("GetUnAssignedOffUsersByPgmId")]
        [EnableQuery]
        public IActionResult GetUnAssignedOfficeUsersByPgmId(int pgmId, string offCd, string? recType = default)
        {
            return Ok(_programAdminService.GetUnAssignedOfficeUsersByPgmId(pgmId, offCd, recType));
        }

        [HttpGet]
        [Route("GetRefDataByRefType")]
        [EnableQuery]
        public IActionResult GetRefDataByRefType(string refType, string refSubType, string? refAddlInfo = default)
        {
            return Ok(_programAdminService.GetRefDataByRefType(refType, refSubType, refAddlInfo));
        }

        [HttpGet]
        [Route("GetAllWFConfig")]
        [EnableQuery]
        public IActionResult GetAllWorkFlowConfig()
        {
            return Ok(_programAdminService.GetAllWorkFlowConfig());
        }

        [HttpPost]
        [Route("SavePgmInfo")]
        public IActionResult SaveProgramInfo([FromBody]PgmInfoModel pgmInfoModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            return Ok(_programAdminService.SaveProgramInfo(pgmInfoModel));
        }

        [HttpPost]
        [Route("SaveTestInfo")]
        public IActionResult SaveTestInfo([FromBody] TestModel pgmInfoModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            return null;

            //return Ok(_programAdminService.SaveProgramInfo(pgmInfoModel));
        }

    }
}
