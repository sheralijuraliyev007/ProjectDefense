using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Position;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Base;
using ProjectDefense.Service.Main.Interfaces;
using ProjectDefense.Service.Main.QueryObjects;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class PositionService : BaseMainService<Position, PositionFilterOptions, PositionDto, PositionCreateModel, PositionUpdateModel>, IPositionService
    {
        private readonly IBaseRepository<PositionAttribute> _positionAttributeRepository;
        private readonly IBaseRepository<PositionProjectTag> _positionProjectTagRepository;
        private readonly IBaseRepository<UserRole> _userRoleRepository;
        private readonly ITagService _tagService;

        public PositionService(
            IBaseRepository<Position> repository,
            IBaseRepository<PositionAttribute> positionAttributeRepository,
            IBaseRepository<PositionProjectTag> positionProjectTagRepository,
            IBaseRepository<UserRole> userRoleRepository,
            ITagService tagService,
            IUserHelper userHelper)
            : base(repository, userHelper)
        {
            _positionAttributeRepository = positionAttributeRepository;
            _positionProjectTagRepository = positionProjectTagRepository;
            _userRoleRepository = userRoleRepository;
            _tagService = tagService;
        }

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

        // no ownership — any Recruiter/Administrator manages any position, per spec
        protected override async Task<bool> CanModify(Position entity, Guid userId) =>
            await _userRoleRepository.GetAll()
                .AnyAsync(ur => ur.UserId == userId
                    && (ur.RoleCode == RoleConstants.Recruiter || ur.RoleCode == RoleConstants.Administrator));

        public override async Task<TId?> AddAsync<TId>(PositionCreateModel createModel)
        {
            var id = await base.AddAsync<TId>(createModel);
            if (id == null) return id;

            var positionId = Convert.ToInt32(id);
            await ReplaceAttributeLinks(positionId, createModel.AttributeIds);
            await ReplaceProjectTagLinks(positionId, createModel.ProjectTagLabels);

            return id;
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

            var sourceAttributeIds = await _positionAttributeRepository.GetAll()
                .Where(pa => pa.PositionId == positionId)
                .Select(pa => pa.AttributeId)
                .ToListAsync();

            await ReplaceAttributeLinks(copy.Id, sourceAttributeIds);
            return copy.Id;
        }


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
            var oldLinks = await _positionAttributeRepository.GetAll()
                .Where(pa => pa.PositionId == positionId)
                .ToListAsync();
            _positionAttributeRepository.DeleteRange(oldLinks);

            var newLinks = attributeIds.Distinct()
                .Select(attrId => new PositionAttribute { PositionId = positionId, AttributeId = attrId })
                .ToList();
            _positionAttributeRepository.AddRange(newLinks);

            await _positionAttributeRepository.SaveChanges();
        }



        private async Task ReplaceProjectTagLinks(int positionId, List<string> tagLabels)
        {
            var oldLinks = await _positionProjectTagRepository.GetAll()
                .Where(t => t.PositionId == positionId)
                .ToListAsync();
            _positionProjectTagRepository.DeleteRange(oldLinks);

            var tags = await _tagService.GetOrCreateTagsAsync(tagLabels);
            var newLinks = tags.Select(t => new PositionProjectTag { PositionId = positionId, TagId = t.Id }).ToList();
            _positionProjectTagRepository.AddRange(newLinks);

            await _positionProjectTagRepository.SaveChanges();
        }
    }
}