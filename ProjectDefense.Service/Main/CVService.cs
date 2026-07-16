using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.CV;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Base;
using ProjectDefense.Service.Main.Interfaces;
using ProjectDefense.Service.Main.QueryObjects;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class CvService : BaseMainService<CV, CVFilterOptions, CvDto, CvCreateModel, CvUpdateModel>, ICvService
    {
        private readonly IBaseRepository<PositionAttribute> _positionAttributeRepository;
        private readonly IBaseRepository<UserAttribute> _userAttributeRepository;
        private readonly IBaseRepository<UserRole> _userRoleRepository;

        public CvService(
            IBaseRepository<CV> repository,
            IBaseRepository<PositionAttribute> positionAttributeRepository,
            IBaseRepository<UserAttribute> userAttributeRepository,
            IBaseRepository<UserRole> userRoleRepository,
            IUserHelper userHelper)
            : base(repository, userHelper)
        {
            _positionAttributeRepository = positionAttributeRepository;
            _userAttributeRepository = userAttributeRepository;
            _userRoleRepository = userRoleRepository;
        }

        protected override IQueryable<CV> GetAllQuery() =>
            _repository.GetAll(cv => cv.Position!, cv => cv.Status!);

        protected override IQueryable<CV> ApplyFilter(IQueryable<CV> query, CVFilterOptions filters) =>
            query.ApplyFilter(filters);

        protected override CV BuildNewEntity(CvCreateModel model, Guid userId) => new()
        {
            PositionId = model.PositionId,
            UserId = userId,
            StatusCode = CVStatusConstants.DraftStatusCode
        };

        protected override async Task<bool> CanModify(CV entity, Guid userId)
        {
            if (entity.UserId == userId)
                return true;

            return await _userRoleRepository.GetAll()
                .AnyAsync(ur => ur.UserId == userId && ur.RoleCode == RoleConstants.Administrator);
        }

        public async Task<IStatusGeneric> PublishAsync(long cvId)
        {
            var cv = await _repository.GetById(cvId);
            if (cv == null)
            {
                AddError("CV not found.");
                return this;
            }

            var userId = _userHelper.GetUserId();
            if (userId == null || !await CanModify(cv, userId.Value))
            {
                AddError("You're not allowed to publish this CV.");
                return this;
            }

            var missingCount = await CountMissingAttributes(cv.PositionId, cv.UserId);
            if (missingCount > 0)
            {
                AddError($"Fill out {missingCount} more attribute(s) before publishing.");
                return this;
            }

            cv.StatusCode = CVStatusConstants.PublishedStatusCode;
            cv.ModifiedUserId = userId;

            await _repository.Update(cv);
            await _repository.SaveChanges();
            return this;
        }

        private async Task<int> CountMissingAttributes(int positionId, Guid userId)
        {
            var required = await _positionAttributeRepository.GetAll()
                .Where(pa => pa.PositionId == positionId)
                .Select(pa => pa.AttributeId)
                .ToListAsync();

            var filled = await _userAttributeRepository.GetAll()
                .Where(ua => ua.UserId == userId && required.Contains(ua.AttributeId) && HasValue(ua))
                .Select(ua => ua.AttributeId)
                .ToListAsync();

            return required.Except(filled).Count();
        }

        private static bool HasValue(UserAttribute ua) =>
            ua.ValueGeneric != null || ua.ValueNumeric != null || ua.ValueDate != null
            || ua.ValueBoolean != null || ua.ValueOptionId != null || ua.ValueContentId != null;
    }
}