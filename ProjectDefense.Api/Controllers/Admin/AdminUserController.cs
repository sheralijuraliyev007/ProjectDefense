using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Data.Repositories;
using ProjectDefense.Service.Admin.Users.Interfaces;

namespace ProjectDefense.Api.Controllers.Admin
{
    [Authorize(Roles = RoleConstants.AdministratorRoleName)]
    [Route("api/admin/users")]
    [ApiController]
    public class AdminUserController(IAdminUserService service) : ControllerBase
    {
        [HttpPost("search")]
        public async Task<IActionResult> GetAll([FromBody] UserFilterOptions filterOptions)
        {
            var result = await service.GetAllAsync(filterOptions);
            return service.IsValid ? Ok(new ApiResponse<PaginationModel<UserDtoForAdmin>> { Data = result }) : BadRequest(service.Errors);
        }

        [HttpGet("{userId:guid}")]
        public async Task<IActionResult> GetById(Guid userId)
        {
            var result = await service.GetByIdAsync(userId);
            return service.IsValid ? Ok(new ApiResponse<UserDtoForAdmin?> { Data = result }) : NotFound(service.Errors);
        }

        [HttpPut("block")]
        public async Task<IActionResult> Block([FromBody] List<Guid> userIds)
        {
            var result = await service.BlockAsync(userIds);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Blocked." }) : BadRequest(result.Errors);
        }

        [HttpPut("unblock")]
        public async Task<IActionResult> Unblock([FromBody] List<Guid> userIds)
        {
            var result = await service.UnblockAsync(userIds);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Unblocked." }) : BadRequest(result.Errors);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] List<Guid> userIds)
        {
            var result = await service.DeleteAsync(userIds);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Deleted." }) : BadRequest(result.Errors);
        }

        [HttpPut("roles/{roleCode:int}/assign")]
        public async Task<IActionResult> AssignRole(short roleCode, [FromBody] List<Guid> userIds)
        {
            var result = await service.AssignRoleAsync(userIds, roleCode);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Role assigned." }) : BadRequest(result.Errors);
        }

        [HttpPut("roles/{roleCode:int}/remove")]
        public async Task<IActionResult> RemoveRole(short roleCode, [FromBody] List<Guid> userIds)
        {
            var result = await service.RemoveRoleAsync(userIds, roleCode);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Role removed." }) : BadRequest(result.Errors);
        }

        
    }
}