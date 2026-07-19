using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.CV;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Api.Controllers { 

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class CvController(ICvService service) : ControllerBase
{
    [HttpPost("search")]
    public async Task<IActionResult> GetAll([FromBody] CVFilterOptions filterOptions)
    {
        var result = await service.GetAllAsync(filterOptions);
        return service.IsValid ? Ok(new ApiResponse<PaginationModel<CvDto>> { Data = result }) : BadRequest(service.Errors);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await service.GetByIdAsync(id);
        return service.IsValid ? Ok(new ApiResponse<CvDto?> { Data = result }) : NotFound(service.Errors);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] CvCreateModel model)
    {
        var result = await service.AddAsync<long>(model);
        return service.IsValid ? Ok(new ApiResponse<long?> { Data = result }) : BadRequest(service.Errors);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] CvUpdateModel model)
    {
        var result = await service.UpdateAsync(id, model);
        return result.IsValid ? Ok(new ApiResponse<string> { Data = "Updated." }) : Conflict(result.Errors);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var result = await service.DeleteAsync(id);
        return result.IsValid ? Ok(new ApiResponse<string> { Data = "Deleted." }) : BadRequest(result.Errors);
    }

    [HttpPost("{id:long}/publish")]
    public async Task<IActionResult> Publish(long id)
    {
        var result = await service.PublishAsync(id);
        return result.IsValid ? Ok(new ApiResponse<string> { Data = "Published." }) : BadRequest(result.Errors);
    }

    [HttpGet("{id:long}/attributes")]
    public async Task<IActionResult> GetAttributes(long id)
    {
        var result = await service.GetCvAttributesAsync(id);
        return service.IsValid ? Ok(new ApiResponse<List<UserAttributeDto>> { Data = result }) : BadRequest(service.Errors);
    }
}
}