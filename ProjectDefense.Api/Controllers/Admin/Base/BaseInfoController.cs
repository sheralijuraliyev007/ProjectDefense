using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Admin.Base.Interfaces;

namespace ProjectDefense.Api.Controllers.Admin.Base;

public abstract class BaseInfoController<TEntity, TCreateModel, TUpdateModel, TDto, TId>
    (IBaseInfoService<TEntity> service) : BaseAdminController
    where TEntity : class
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await service.GetAll<TDto>();
        if (service.IsValid)
            return Ok(new ApiResponse<List<TDto>> { Data = result });

        return BadRequest(service.Errors);
    }

    [HttpGet]
    public async Task<IActionResult> GetById(TId id)
    {
        var result = await service.GetById<TDto, TId>(id);
        if (service.IsValid)
            return Ok(new ApiResponse<TDto?> { Data = result });

        return BadRequest(service.Errors);
    }

    [HttpPost]
    public async Task<IActionResult> Create(TCreateModel model)
    {
        var result = await service.Create(model);
        if (service.IsValid)
            return Ok(new ApiResponse<string> { Data = result });

        return BadRequest(service.Errors);
    }

    [HttpPut]
    public async Task<IActionResult> Update(TId id, TUpdateModel model)
    {
        var result = await service.Update(id, model);
        if (service.IsValid)
            return Ok(new ApiResponse<string> { Data = result });

        return BadRequest(service.Errors);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(TId id)
    {
        var result = await service.DeleteById(id);
        if (service.IsValid)
            return Ok(new ApiResponse<string> { Data = result });

        return BadRequest(service.Errors);
    }
}