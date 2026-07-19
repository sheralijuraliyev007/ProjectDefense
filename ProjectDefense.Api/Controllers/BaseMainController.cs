

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Base.Interfaces;
namespace ProjectDefense.Api.Controllers
{


    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public abstract class BaseMainController<TService, TFilterOptions, TDto, TCreateModel, TUpdateModel>
        (TService service) : ControllerBase
        where TService : IMainServiceBase<TFilterOptions, TDto, TCreateModel, TUpdateModel>
        where TDto : class
    {
        [HttpPost("search")]
        public async Task<IActionResult> GetAll([FromBody] TFilterOptions filterOptions)
        {
            var result = await service.GetAllAsync(filterOptions);
            return service.IsValid ? Ok(new ApiResponse<PaginationModel<TDto>> { Data = result }) : BadRequest(service.Errors);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await service.GetByIdAsync(id);
            return service.IsValid ? Ok(new ApiResponse<TDto?> { Data = result }) : NotFound(service.Errors);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] TCreateModel model)
        {
            var result = await service.AddAsync<int>(model);
            return service.IsValid ? Ok(new ApiResponse<int?> { Data = result }) : BadRequest(service.Errors);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TUpdateModel model)
        {
            var result = await service.UpdateAsync(id, model);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Updated." }) : Conflict(result.Errors);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await service.DeleteAsync(id);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Deleted." }) : BadRequest(result.Errors);
        }
    }

}