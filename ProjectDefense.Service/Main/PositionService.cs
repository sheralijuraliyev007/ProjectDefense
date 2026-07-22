using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Position;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Base;
using ProjectDefense.Service.Main.Interfaces;
using ProjectDefense.Service.Main.QueryObjects;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class PositionService(
    IBaseRepository<Position> repository,
    IUnitOfWork unitOfWork,
    IUserHelper userHelper,
    ITagService tagService,
    IPositionAccessService positionAccessService,
    IAttributeService attributeService)
    : BaseMainService<Position, PositionFilterOptions, PositionDto, PositionCreateModel, PositionUpdateModel>(repository, userHelper), IPositionService
    {

        protected override IQueryable<Position> GetAllQuery() =>
            _repository.GetAll(p => p.Status!);

        protected override IQueryable<Position> ApplyFilter(IQueryable<Position> query, PositionFilterOptions options) =>
            query.ApplyFilter(options);

        protected override Position BuildNewEntity(PositionCreateModel model, Guid userId) => new()
        {
            Title = model.Title,
            ShortDescription = model.ShortDescription,
            IsPublic = model.IsPublic,
            MaxProjects = model.MaxProjects,
            StatusCode = CommonStatusConstants.ActiveStatusCode
        };

        protected override async Task<bool> CanModify(Position entity, Guid userId) =>
            await unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == userId
                    && (ur.RoleCode == RoleConstants.Recruiter || ur.RoleCode == RoleConstants.Administrator));

        public override async Task<TId?> AddAsync<TId>(PositionCreateModel createModel) where TId: struct
        {
            var id = await base.AddAsync<TId>(createModel);
            if (id == null) return id;

            var positionId = Convert.ToInt32(id);
            await ReplaceAttributeLinks(positionId, createModel.AttributeIds);
            await ReplaceProjectTagLinks(positionId, createModel.ProjectTagLabels);

            return id;
        }

        public override async Task<PositionDto?> GetByIdAsync<TId>(TId id)
        {
            var dto = await base.GetByIdAsync<TId>(id);
            if (dto == null) return null;

            if (dto.IsPublic) return dto; // public positions are visible to everyone, logged in or not

            var userId = _userHelper.GetUserId();
            if (userId == null) { AddError("Not found"); return null; }

            if (await IsRecruiterOrAdmin(userId.Value)) return dto;

            var positionId = Convert.ToInt32(id);
            if (!await positionAccessService.CanAccessAsync(positionId, userId.Value))
            {
                AddError("Not found");
                return null;
            }

            return dto;
        }
        public async Task<IStatusGeneric> SetAttributesAsync(int positionId, List<int> attributeIds)
        {
            if (!await EnsureCanManage(positionId)) return this;
            await ReplaceAttributeLinks(positionId, attributeIds);
            return this;
        }

        public async Task<IStatusGeneric> SetProjectTagsAsync(int positionId, List<string> tagLabels)
        {
            if (!await EnsureCanManage(positionId)) return this;
            await ReplaceProjectTagLinks(positionId, tagLabels);
            return this;
        }

        public async Task<int?> DuplicateAsync(int positionId)
        {
            var source = await _repository.GetById(positionId);
            if (source == null) { AddError("Position not found."); return null; }

            var userId = _userHelper.GetUserId();
            if (userId == null || !await CanModify(source, userId.Value))
            {
                AddError("You're not allowed to duplicate this position.");
                return null;
            }

            var copy = new Position
            {
                Title = source.Title + " (Copy)",
                ShortDescription = source.ShortDescription,
                IsPublic = source.IsPublic,
                MaxProjects = source.MaxProjects,
                StatusCode = CommonStatusConstants.ActiveStatusCode,
                CreatedUserId = userId
            };

            await _repository.Add(copy);
            await _repository.SaveChanges();

            var sourceAttributeIds = await unitOfWork.PositionAttributeRepository().GetAll()
                .Where(pa => pa.PositionId == positionId)
                .Select(pa => pa.AttributeId)
                .ToListAsync();

            await ReplaceAttributeLinks(copy.Id, sourceAttributeIds);
            return copy.Id;
        }


        public async Task<List<AttributeDto>> GetAttributesAsync(int positionId)
        {
            var attributeIds = await unitOfWork.PositionAttributeRepository().GetAll()
                .Where(pa => pa.PositionId == positionId)
                .Select(pa => pa.AttributeId)
                .ToListAsync();

            return await attributeService.GetByIdsAsync(attributeIds);
        }
        public override async Task<PaginationModel<PositionDto>> GetAllAsync(PositionFilterOptions filterOptions)
        {
            var page = await base.GetAllAsync(filterOptions);

            var userId = _userHelper.GetUserId();
            if (userId == null || await IsRecruiterOrAdmin(userId.Value))
                return page; 

            var visibleRows = new List<PositionDto>();
            foreach (var row in page.Rows)
            {
                if (await positionAccessService.CanAccessAsync(row.Id, userId.Value))
                    visibleRows.Add(row);
            }

            return new PaginationModel<PositionDto>
            {
                Rows = visibleRows,
                PageIndex = page.PageIndex,
                PageSize = page.PageSize,
                Total = page.Total 
            };
        }

        private Task<bool> IsRecruiterOrAdmin(Guid userId) =>
            unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == userId && (ur.RoleCode == RoleConstants.Recruiter || ur.RoleCode == RoleConstants.Administrator));


        private async Task<bool> EnsureCanManage(int positionId)
        {
            var position = await _repository.GetById(positionId);
            if (position == null) { AddError("Position not found."); return false; }

            var userId = _userHelper.GetUserId();
            if (userId == null || !await CanModify(position, userId.Value))
            {
                AddError("You're not allowed to edit this position.");
                return false;
            }
            return true;
        }


        private async Task ReplaceAttributeLinks(int positionId, List<int> attributeIds)
        {
            var repo = unitOfWork.PositionAttributeRepository();

            var oldLinks = await repo.GetAll().Where(pa => pa.PositionId == positionId).ToListAsync();
            repo.DeleteRange(oldLinks);

            var newLinks = attributeIds.Distinct()
                .Select(attrId => new PositionAttribute { PositionId = positionId, AttributeId = attrId })
                .ToList();
            repo.AddRange(newLinks);

            await repo.SaveChanges();
        }



        private async Task ReplaceProjectTagLinks(int positionId, List<string> tagLabels)
        {
            var oldLinks = await unitOfWork.PositionProjectTagRepository().GetAll()
                .Where(t => t.PositionId == positionId)
                .ToListAsync();
            unitOfWork.PositionProjectTagRepository().DeleteRange(oldLinks);

            var tags = await tagService.GetOrCreateTagsAsync(tagLabels);
            var newLinks = tags.Select(t => new PositionProjectTag { PositionId = positionId, TagId = t.Id }).ToList();
            unitOfWork.PositionProjectTagRepository().AddRange(newLinks);

            await unitOfWork.PositionProjectTagRepository().SaveChanges();
        }
    }
}