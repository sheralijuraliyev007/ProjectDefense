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
                var result = await salesforceService.SyncCurrentUserToCrmAsync(form, ct);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}