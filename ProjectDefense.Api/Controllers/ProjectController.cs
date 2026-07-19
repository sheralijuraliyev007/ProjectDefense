using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Project;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    public class ProjectController(IProjectService service)
    : BaseMainController<IProjectService, ProjectFilterOptions, ProjectDto, ProjectCreateModel, ProjectUpdateModel>(service)
    {
        [HttpPut("{id:int}")]
        public async Task<IActionResult> SetTags(int id, [FromBody] List<string> tagLabels)
        {
            var result = await service.SetTagsAsync(id, tagLabels);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Tags updated." }) : BadRequest(result.Errors);
        }
    }
}
