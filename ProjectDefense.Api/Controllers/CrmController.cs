using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.Models.Salesforce;
using ProjectDefense.Service.Infrastructure.Interfaces;

namespace ProjectDefense.Controllers
{
    [ApiController]
    [Route("api/crm")]
    [Authorize]
    public class CrmController(ISalesforceService salesforceService) : ControllerBase
    {
        [HttpPost("sync")]
        public async Task<IActionResult> SyncToCrm([FromBody] SyncToCrmRequestModel form, CancellationToken ct)
        {
            try
            {
                var status = await salesforceService.SyncCurrentUserToCrmAsync(form, ct);
                return status.Success ? Ok(status.Data) : BadRequest(status);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}