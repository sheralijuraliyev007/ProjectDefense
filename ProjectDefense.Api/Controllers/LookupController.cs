using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Info;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Admin.Interfaces;

namespace ProjectDefense.Api.Controllers;

[Route("api/lookups/[action]")]
[ApiController]
public class LookupController(ILookupService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> AttributeCategoriesSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.AttributeCategoriesSelect() });

    [HttpGet]
    public async Task<IActionResult> AttributeTypesSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.AttributeTypesSelect() });

    [HttpGet]
    public async Task<IActionResult> RolesSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.RolesSelect() });

    [HttpGet]
    public async Task<IActionResult> CommonStatusesSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.CommonStatusesSelect() });

    [HttpGet]
    public async Task<IActionResult> CvStatusesSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.CvStatusesSelect() });

    [HttpGet]
    public async Task<IActionResult> UserStatusesSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.UserStatusesSelect() });

    [HttpGet]
    public async Task<IActionResult> ContentTypesSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.ContentTypesSelect() });

    [HttpGet]
    public async Task<IActionResult> RuleOperatorsSelect() =>
        Ok(new ApiResponse<List<InfoDto>> { Data = await service.RuleOperatorsSelect() });
}