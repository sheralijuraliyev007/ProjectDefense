using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Content;
using ProjectDefense.Common.Models.Insfrastructure;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Infrastructure.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    [Route("api/content")]
    [ApiController]
    [Authorize]
    public class ContentController(IContentService contentService) : ControllerBase
    {
        [HttpGet("upload-signature")]
        public IActionResult GetUploadSignature()
        {
            var signature = contentService.GetUploadSignature();
            return Ok(new ApiResponse<UploadSignatureDto> { Data = signature });
        }

        [HttpPost("confirm-upload")]
        public async Task<IActionResult> ConfirmUpload([FromBody] ConfirmUploadModel model)
        {
            var (status, content) = await contentService.ConfirmUploadAsync(model);
            return status.IsValid
                ? Ok(new ApiResponse<ContentDto?> { Data = content })
                : BadRequest(status.Errors);
        }
    }
}