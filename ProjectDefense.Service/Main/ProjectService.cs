using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Project;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Base;
using ProjectDefense.Service.Main.Interfaces;
using ProjectDefense.Service.Main.QueryObjects;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class ProjectService(IBaseRepository<Project> repository, IUserHelper userHelper, IUnitOfWork unitOfWork, ITagService tagService) : 
        BaseMainService<Project, ProjectFilterOptions, ProjectDto, ProjectCreateModel, ProjectUpdateModel>(repository,userHelper), IProjectService
    {
        protected override IQueryable<Project> GetAllQuery() =>
            _repository.GetAll(p => p.ProjectTags);

        protected override IQueryable<Project> ApplyFilter(IQueryable<Project> query, ProjectFilterOptions options) =>
            query.ApplyFilter(options);

        protected override Project BuildNewEntity(ProjectCreateModel model, Guid userId) => new()
        {
            UserId = userId,
            Name = model.Name,
            PeriodStart = model.PeriodStart,
            PeriodEnd = model.PeriodEnd,
            Description = model.Description
        };

        protected override async Task<bool> CanModify(Project? project = null, Guid? userId = null)
        {
            userId ??= _userHelper.GetUserId();
            if (userId == null) { AddError("You are not logged in"); return false; }

            bool isOwner = project != null && project.CreatedUserId == userId;
            bool isAdmin = await unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == userId && ur.RoleCode == RoleConstants.Administrator);

            bool check = isOwner || isAdmin;
            if (!check) AddError("You are not allowed to do this action");
            return check;
        }


        public async Task<IStatusGeneric> SetTagsAsync(int projectId, List<string> tagLabels)
        {
            var project = await _repository.GetById(projectId);
            if (project == null) { AddError("Project not found."); return this; }

            if(!await CanModify(project)) return this;

            await ReplaceTagLinks(projectId, tagLabels);
            return this;
        }

        private async Task ReplaceTagLinks(int projectId, List<string> tagLabels)
        {
            var oldLinks = await unitOfWork.ProjectTagRepository().GetAll()
                .Where(pt => pt.ProjectId == projectId)
                .ToListAsync();
            unitOfWork.ProjectTagRepository().DeleteRange(oldLinks);

            var tags = await tagService.GetOrCreateTagsAsync(tagLabels);
            var newLinks = tags.Select(t => new ProjectTag { ProjectId = projectId, TagId = t.Id }).ToList();
            unitOfWork.ProjectTagRepository().AddRange(newLinks);

            await _repository.SaveChanges();
        }
    }
}