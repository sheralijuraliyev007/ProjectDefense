using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.Position;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    [Authorize]
    [Route("api/position/{positionId:int}/rules")]
    [ApiController]
    public class PositionRuleController(IPositionRuleService service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetRules(int positionId)
        {
            var result = await service.GetRulesAsync(positionId);
            return Ok(new ApiResponse<List<PositionRuleDto>> { Data = result });
        }

        [HttpPut]
        public async Task<IActionResult> SetRules(int positionId, [FromBody] List<PositionRuleModel> rules)
        {
            var result = await service.SetRulesAsync(positionId, rules);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Rules updated." }) : BadRequest(result.Errors);
        }
    }
}