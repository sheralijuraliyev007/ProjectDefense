using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.Models.Dropbox;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    [ApiController]
    [Route("api/support-ticket")]
    public class SupportTicketController(ISupportTicketService supportTicketService) : ControllerBase
    {
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateSupportTicketModel model)
        {
            await supportTicketService.CretaeSupportTicket(model);
            return supportTicketService.IsValid
                ? Ok(new ApiResponse<string> { Data = "Ticket submitted." })
                : BadRequest(supportTicketService.Errors);
        }
    }
}