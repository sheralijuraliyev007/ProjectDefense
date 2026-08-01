using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.CV;
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
    public class CvService(
        IBaseRepository<CV> repository,
        IUnitOfWork unitOfWork,
        IUserHelper userHelper,
        IPositionAccessService positionAccessService)
        : BaseMainService<CV, CVFilterOptions, CvDto, CvCreateModel, CvUpdateModel>(repository, userHelper), ICvService
    {
        protected override IQueryable<CV> GetAllQuery() =>
            _repository.GetAll(cv => cv.Position!, cv => cv.Status!);

        public override async Task<PaginationModel<CvDto>> GetAllAsync(CVFilterOptions filterOptions)
        {
            var callerId = _userHelper.GetUserId();
            if (callerId == null) { AddError("You are not logged in"); return new PaginationModel<CvDto>(); }

            bool isAdmin = await unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == callerId && ur.RoleCode == RoleConstants.Administrator);

           
            if (!isAdmin)
                filterOptions.UserId = callerId;

            return await base.GetAllAsync(filterOptions);
        }

        protected override IQueryable<CV> ApplyFilter(IQueryable<CV> query, CVFilterOptions filters) =>
            query.ApplyFilter(filters);

        protected override CV BuildNewEntity(CvCreateModel model, Guid userId) => new()
        {
            PositionId = model.PositionId,
            UserId = userId,
            StatusCode = CVStatusConstants.DraftStatusCode
        };

        protected override async Task<bool> CanModify(CV? cv = null, Guid? userId = null)
        {
            userId ??= _userHelper.GetUserId();
            if (userId == null) { AddError("You are not logged in"); return false; }

            bool isOwner = cv != null && cv.CreatedUserId == userId;
            bool isAdmin = await unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == userId && ur.RoleCode == RoleConstants.Administrator);

            bool check = isOwner || isAdmin;
            if (!check) AddError("You are not allowed to do this action");
            return check;
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

            var id = await base.AddAsync<TId>(createModel);
            if (id != null)
                await EnsureRequiredAttributesExist(createModel.PositionId, userId.Value);

            return id;
        }

        private async Task EnsureRequiredAttributesExist(int positionId, Guid userId)
        {
            var requiredAttributeIds = await GetRequiredAttributeIds(positionId);

            var existingAttributeIds = await unitOfWork.UserAttributeRepository().GetAll()
                .Where(ua => ua.UserId == userId && requiredAttributeIds.Contains(ua.AttributeId))
                .Select(ua => ua.AttributeId)
                .ToListAsync();

            var missingAttributeIds = requiredAttributeIds.Except(existingAttributeIds).ToList();
            if (missingAttributeIds.Count == 0) return;

            var newRows = missingAttributeIds.Select(attrId => new UserAttribute
            {
                UserId = userId,
                AttributeId = attrId,
                CreatedUserId = userId
            }).ToList();

            unitOfWork.UserAttributeRepository().AddRange(newRows);
            await unitOfWork.UserAttributeRepository().SaveChanges();
        }

        public async Task<IStatusGeneric> PublishAsync(long cvId)
        {
            var cv = await _repository.GetById(cvId);
            if (cv == null) { AddError("CV not found."); return this; }

            var userId = _userHelper.GetUserId();
            if (!await CanModify(cv, userId)) return this;

            if (cv.StatusCode == CVStatusConstants.PublishedStatusCode)
            {
                AddError("This CV is already published.");
                return this;
            }

            var missingCount = await CountMissingAttributes(cv.PositionId, cv.UserId);
            if (missingCount > 0)
            {
                AddError($"Fill out {missingCount} more attribute(s) before publishing.");
                return this;
            }

            await SnapshotAttributesAsync(cv);

            cv.StatusCode = CVStatusConstants.PublishedStatusCode;
            cv.ModifiedUserId = userId;
            await _repository.Update(cv);
            await _repository.SaveChanges();
            return this;
        }

        private async Task SnapshotAttributesAsync(CV cv)
        {
            var requiredAttributeIds = await GetRequiredAttributeIds(cv.PositionId);

            var liveValues = await unitOfWork.UserAttributeRepository().GetAll()
                .Where(ua => ua.UserId == cv.UserId && requiredAttributeIds.Contains(ua.AttributeId))
                .ToListAsync();

            var snapshotRows = liveValues.Select(ua => new CVAttribute
            {
                CVId = cv.Id,
                AttributeId = ua.AttributeId,
                ValueGeneric = ua.ValueGeneric,
                ValueNumeric = ua.ValueNumeric,
                ValueDate = AsUtc(ua.ValueDate),
                ValuePeriodStart = AsUtc(ua.ValuePeriodStart),
                ValuePeriodEnd = AsUtc(ua.ValuePeriodEnd),
                ValueBoolean = ua.ValueBoolean,
                ValueOptionId = ua.ValueOptionId,
                ValueContentId = ua.ValueContentId,
            }).ToList();

            unitOfWork.CVAttributeRepository().AddRange(snapshotRows);
            await unitOfWork.CVAttributeRepository().SaveChanges();
        }

        private static DateTime? AsUtc(DateTime? value) =>
            value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;


        public override async Task<CvDto?> GetByIdAsync<TId>(TId id)
        {
            var cv = await _repository.GetById(id);
            if (cv == null) { AddError("Not found"); return null; }

            var callerId = _userHelper.GetUserId();
            if (callerId == null) { AddError("You are not logged in"); return null; }

            bool isAdmin = await unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == callerId && ur.RoleCode == RoleConstants.Administrator);

            if (!isAdmin && cv.UserId != callerId)
            {
                AddError("Not found");
                return null;
            }

            return await base.GetByIdAsync(id);
        }

        public async Task<List<UserAttributeDto>> GetCvAttributesAsync(long cvId)
        {
            var cv = await _repository.GetById(cvId);
            if (cv == null) { AddError("CV not found."); return []; }

            if (cv.StatusCode == CVStatusConstants.PublishedStatusCode)
                return await GetSnapshotAttributeValues(cvId);

            var requiredAttributeIds = await GetRequiredAttributeIds(cv.PositionId);
            return await GetAttributeValues(cv.UserId, requiredAttributeIds);
        }

        private async Task<List<UserAttributeDto>> GetSnapshotAttributeValues(long cvId)
        {
            var rows = await unitOfWork.CVAttributeRepository()
                .GetAll(ca => ca.Attribute!, ca => ca.ValueOption!, ca => ca.ValueContent!)
                .Where(ca => ca.CVId == cvId)
                .ToListAsync();

            return rows.Select(ToDtoFromSnapshot).ToList();
        }

        private static UserAttributeDto ToDtoFromSnapshot(CVAttribute ca) => new()
        {
            Id = (int)ca.Id,
            AttributeId = ca.AttributeId,
            AttributeName = ca.Attribute?.Name ?? string.Empty,
            DtypeCode = ca.Attribute?.DtypeCode ?? 0,
            Version = 0, 
            ValueGeneric = ca.ValueGeneric,
            ValueNumeric = ca.ValueNumeric,
            ValueDate = ca.ValueDate,
            ValuePeriodStart = ca.ValuePeriodStart,
            ValuePeriodEnd = ca.ValuePeriodEnd,
            ValueBoolean = ca.ValueBoolean,
            ValueOptionId = ca.ValueOptionId,
            ValueOptionLabel = ca.ValueOption?.Label,
            ValueContentId = ca.ValueContentId,
            ValueContentUrl = ca.ValueContent?.SecureUrl,
            IsFilled = ca.ValueGeneric != null || ca.ValueNumeric != null || ca.ValueDate != null
           || ca.ValuePeriodStart != null || ca.ValuePeriodEnd != null
           || ca.ValueBoolean != null || ca.ValueOptionId != null || ca.ValueContentId != null,
            IsRemovable = false 
        };

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
            Version = ua.Version,
            ValueGeneric = ua.ValueGeneric,
            ValueNumeric = ua.ValueNumeric,
            ValueDate = ua.ValueDate,
            ValuePeriodStart = ua.ValuePeriodStart,
            ValuePeriodEnd = ua.ValuePeriodEnd,
            ValueBoolean = ua.ValueBoolean,
            ValueOptionId = ua.ValueOptionId,
            ValueOptionLabel = ua.ValueOption?.Label,
            ValueContentId = ua.ValueContentId,
            IsFilled = HasValue(ua)
        };

        private async Task<int> CountMissingAttributes(int positionId, Guid userId)
        {
            var required = await GetRequiredAttributeIds(positionId);

            var rows = await unitOfWork.UserAttributeRepository().GetAll()
                .Where(ua => ua.UserId == userId && required.Contains(ua.AttributeId))
                .ToListAsync();

            var filled = rows.Where(HasValue).Select(ua => ua.AttributeId).ToList();

            return required.Except(filled).Count();
        }

        private static bool HasValue(UserAttribute ua) =>
    ua.ValueGeneric != null || ua.ValueNumeric != null || ua.ValueDate != null
    || ua.ValuePeriodStart != null || ua.ValuePeriodEnd != null
    || ua.ValueBoolean != null || ua.ValueOptionId != null || ua.ValueContentId != null;
    }
}