using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.UserAttribute;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserAttributeController(IUserAttributeService service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetMine()
        {
            var result = await service.GetMyAttributesAsync();
            return service.IsValid
                ? Ok(new ApiResponse<List<UserAttributeDto>> { Data = result })
                : BadRequest(service.Errors);
        }

        [HttpPost("{attributeId}")]
        public async Task<IActionResult> Add(int attributeId, [FromQuery] Guid? targetUserId)
        {
            var result = await service.AddAttributeAsync(attributeId, targetUserId);
            return result.IsValid
                ? Ok(new ApiResponse<string> { Data = "Added." })
                : BadRequest(result.Errors);
        }

        [HttpDelete("{attributeId}")]
        public async Task<IActionResult> Remove(int attributeId, [FromQuery] Guid? targetUserId)
        {
            var result = await service.RemoveAttributeAsync(attributeId, targetUserId);
            return result.IsValid
                ? Ok(new ApiResponse<string> { Data = "Removed." })
                : BadRequest(result.Errors);
        }

        [HttpPut("value")]
        public async Task<IActionResult> SetValue(
            [FromBody] SetUserAttributeValueModel model,
            [FromQuery] Guid? targetUserId)
        {
            var (status, newVersion) = await service.SetValueAsync(model, targetUserId);

            if (!status.IsValid)
            {
                if (status.Errors.Any(e => e.ErrorResult.ToString() == Service.Main.UserAttributeService.VersionConflictMarker))
                    return Conflict(new ApiResponse<int?> { Data = newVersion, Message = "Version conflict — reload and try again." });

                return BadRequest(status.Errors);
            }

            return Ok(new ApiResponse<int?> { Data = newVersion });
        }
    }
}