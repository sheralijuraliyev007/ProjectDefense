using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Project;
using ProjectDefense.Service.Main.Base.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IProjectService :
        IMainServiceBase<ProjectFilterOptions, ProjectDto, ProjectCreateModel, ProjectUpdateModel>
    {
        Task<IStatusGeneric> SetTagsAsync(int projectId, List<string> tagLabels);
    }
}