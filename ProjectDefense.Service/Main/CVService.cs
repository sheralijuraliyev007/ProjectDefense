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
    public class CvService(
        IBaseRepository<CV> repository,
        IUnitOfWork unitOfWork,
        IUserHelper userHelper,
        IPositionAccessService positionAccessService)
        : BaseMainService<CV, CVFilterOptions, CvDto, CvCreateModel, CvUpdateModel>(repository, userHelper), ICvService
    {
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
            if (entity.UserId == userId) return true;
            return await unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == userId && ur.RoleCode == RoleConstants.Administrator);
        }

        public override async Task<TId?> AddAsync<TId>(CvCreateModel createModel)
        {
            var userId = _userHelper.GetUserId();
            if (userId == null) { AddError("You need to be logged in to do that."); return default; }

            if (!await positionAccessService.CanAccessAsync(createModel.PositionId, userId.Value))
            {
                AddError("You don't meet the requirements for this position.");
                return default;
            }

            return await base.AddAsync<TId>(createModel);
        }

        public async Task<IStatusGeneric> PublishAsync(long cvId)
        {
            var cv = await _repository.GetById(cvId);
            if (cv == null) { AddError("CV not found."); return this; }

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

        // ---------- CV attribute display (composed from Position + UserAttribute, no CvAttribute table) ----------

        public async Task<List<UserAttributeDto>> GetCvAttributesAsync(long cvId)
        {
            var cv = await _repository.GetById(cvId);
            if (cv == null) { AddError("CV not found."); return []; }

            var requiredAttributeIds = await GetRequiredAttributeIds(cv.PositionId);
            var values = await GetAttributeValues(cv.UserId, requiredAttributeIds);

            return values;
        }

        private Task<List<int>> GetRequiredAttributeIds(int positionId) =>
            unitOfWork.PositionAttributeRepository()
                .GetAll()
                .Where(pa => pa.PositionId == positionId)
                .Select(pa => pa.AttributeId)
                .ToListAsync();

        private async Task<List<UserAttributeDto>> GetAttributeValues(Guid userId, List<int> attributeIds)
        {
            var rows = await unitOfWork.UserAttributeRepository()
                .GetAll(ua => ua.Attribute!, ua => ua.ValueOption!)
                .Where(ua => ua.UserId == userId && attributeIds.Contains(ua.AttributeId))
                .ToListAsync();

            return rows.Select(ToDto).ToList();
        }

        private static UserAttributeDto ToDto(UserAttribute ua) => new()
        {
            Id = ua.Id,
            AttributeId = ua.AttributeId,
            AttributeName = ua.Attribute?.Name ?? string.Empty,
            DtypeCode = ua.Attribute?.DtypeCode ?? 0,
            ValueGeneric = ua.ValueGeneric,
            ValueNumeric = ua.ValueNumeric,
            ValueDate = ua.ValueDate,
            ValuePeriodStart = ua.ValuePeriodStart,
            ValuePeriodEnd = ua.ValuePeriodEnd,
            ValueBoolean = ua.ValueBoolean,
            ValueOptionId = ua.ValueOptionId,
            ValueOptionLabel = ua.ValueOption?.Label,
            ValueContentId = ua.ValueContentId,
            IsFilled = ua.ValueGeneric != null || ua.ValueNumeric != null || ua.ValueDate != null
                       || ua.ValueBoolean != null || ua.ValueOptionId != null || ua.ValueContentId != null
        };

        private async Task<int> CountMissingAttributes(int positionId, Guid userId)
        {
            var required = await GetRequiredAttributeIds(positionId);
            var filled = await unitOfWork.UserAttributeRepository().GetAll()
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