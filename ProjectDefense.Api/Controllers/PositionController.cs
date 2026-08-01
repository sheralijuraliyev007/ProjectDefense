using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Position;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    public class PositionController(IPositionService service)
        : BaseMainController<IPositionService, PositionFilterOptions, PositionDto, PositionCreateModel, PositionUpdateModel>(service)
    {
        [HttpPut("{id:int}/attributes")]
        public async Task<IActionResult> SetAttributes(int id, [FromBody] List<int> attributeIds)
        {
            var result = await service.SetAttributesAsync(id, attributeIds);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Attributes updated." }) : BadRequest(result.Errors);
        }

        [HttpPut("{id:int}/project-tags")]
        public async Task<IActionResult> SetProjectTags(int id, [FromBody] List<string> tagLabels)
        {
            var result = await service.SetProjectTagsAsync(id, tagLabels);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Tags updated." }) : BadRequest(result.Errors);
        }

        [HttpPost("{id:int}/duplicate")]
        public async Task<IActionResult> Duplicate(int id)
        {
            var newId = await service.DuplicateAsync(id);
            return service.IsValid ? Ok(new ApiResponse<int?> { Data = newId }) : BadRequest(service.Errors);
        }
        [HttpGet("{id:int}/attributes")]
        public async Task<IActionResult> GetAttributes(int id)
        {
            var result = await service.GetAttributesAsync(id);
            return Ok(new ApiResponse<List<AttributeDto>> { Data = result });
        }

        [HttpPost("{id:int}/generate-api-token")]
        public async Task<IActionResult> GenerateApiToken(int id)
        {
            var token = await service.GenerateApiTokenAsync(id);
            return service.IsValid ? Ok(new ApiResponse<string> { Data = token }) : BadRequest(service.Errors);
        }

        [AllowAnonymous]
        [HttpGet("by-token/{token}")]
        public async Task<IActionResult> GetByToken(string token)
        {
            var positionDto = await service.GetByTokenAsync(token);
            return service.IsValid && positionDto is not null ? Ok(new ApiResponse<PositionExportDto> { Data  = positionDto }) : BadRequest(service.Errors);

        }
    }
}