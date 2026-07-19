using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Attribute;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    public class AttributeController(IAttributeService service)
    : BaseMainController<IAttributeService, AttributeFilterOptions, AttributeDto, AttributeCreateModel, AttributeUpdateModel>(service)
    {
        [HttpGet]
        public async Task<IActionResult> SearchByPrefix([FromQuery] string prefix, [FromQuery] int limit = 10)
        {
            var result = await service.SearchByPrefixAsync(prefix, limit);
            return Ok(new ApiResponse<List<AttributeDto>> { Data = result });
        }
    }
}
