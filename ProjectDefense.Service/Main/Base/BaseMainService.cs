using Mapster;
using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Base.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Main.Base
{
    public abstract class BaseMainService<TEntity, TFilterOptions, TDto, TCreateModel, TUpdateModel>
        : StatusGenericHandler, IMainServiceBase<TFilterOptions, TDto, TCreateModel, TUpdateModel>
        where TEntity : BaseEntity, IHasVersion
        where TFilterOptions : BaseFilterOptions
        where TDto : class
        
    {

        protected readonly IBaseRepository<TEntity> _repository;
        protected readonly IUserHelper _userHelper;


        

        protected BaseMainService(IBaseRepository<TEntity> repository, IUserHelper userHelper)
        {
            _repository = repository;
            _userHelper = userHelper;
        }

        protected abstract IQueryable<TEntity> GetAllQuery();
        protected abstract IQueryable<TEntity> ApplyFilter(IQueryable<TEntity> query, TFilterOptions options);
        protected abstract TEntity BuildNewEntity(TCreateModel createModel, Guid userId);
        protected abstract Task<bool> CanModify(TEntity entity, Guid userId);



        

        public virtual async Task<TDto?> GetByIdAsync<TId>(TId id)
        {
            var entity = await _repository.GetById(id);
            if(entity == null)
            {
                AddError("Not found");
                return null;
            }
            return entity.MapToDto<TEntity, TDto>();
        }

        public virtual async Task<TId?> AddAsync<TId>(TCreateModel createModel) where TId : struct
        {
            var userId = _userHelper.GetUserId();
            if(userId == null)
            {
                AddError("You are not logged in");
                return default;
            }
            var entity = BuildNewEntity(createModel, userId.Value);
            entity.CreatedUserId = userId.Value;

            await _repository.Add(entity);
            await _repository.SaveChanges();

            return GetEntityId<TId>(entity);
        }

        public virtual async Task<IStatusGeneric> DeleteAsync<TId>(TId id)
        {
            var entity = await _repository.GetById(id);
            if(entity == null)
            {
                AddError("Entity not found");
                return this;
            }

            var userId = _userHelper.GetUserId();
            if (userId == null || !await CanModify(entity, userId.Value))
            {
                AddError("You can't change that entity");
                return this;
            }
            _repository.Delete(entity);
            await _repository.SaveChanges();
            return this;
        }

        public virtual async Task<PaginationModel<TDto>> GetAllAsync(TFilterOptions filterOptions)
        {
            var query = ApplyFilter(GetAllQuery(), filterOptions);
            var page = await query.ToPaginationModelAsync(filterOptions.Page, filterOptions.PageSize);
            return ToDtoPage(page);
        }
        public async Task<IStatusGeneric> UpdateAsync<TId>(TId id, TUpdateModel updateModel)
        {
            var entity = await _repository.GetById(id);
            if(entity == null)
            {
                AddError("Not found.");
                return this;
            }

            var userId = _userHelper.GetUserId();
            if (userId == null || !await CanModify(entity, userId.Value))
            {
                AddError("You are'nt allowed to edit this");
                return this;
            }
            if(!VersionMatches(entity, updateModel))
            {
                AddError("This was changed elsewhere reload");
                return this;
            }

            ApplyUpdate(entity, updateModel, userId.Value);

            await _repository.Update(entity);
            await _repository.SaveChanges();
            return this;
        }

        private static PaginationModel<TDto> ToDtoPage(PaginationModel<TEntity> page) => new()
        {
            Rows = page.Rows.MapToDtos<TEntity, TDto>(),
            PageIndex = page.PageIndex,
            PageSize = page.PageSize,
            Total = page.Total
        };

        private static TId? GetEntityId<TId>(TEntity entity)
        {
            var value = typeof(TEntity).GetProperty("Id").GetValue(entity);
            return value is null ? default : (TId)Convert.ChangeType(value, typeof(TId));
        }

        private static bool VersionMatches(TEntity entity, TUpdateModel updateModel)
        {
            if (entity is not IHasVersion entityVersion || updateModel is not IHasVersion modelVersion) return true;

            return entity.Version == modelVersion.Version;
        }

        private static void ApplyUpdate(TEntity entity, TUpdateModel model, Guid userId)
        {
            model.Adapt(entity);
            entity.ModifiedUserId = userId;

            if(entity is IHasVersion versionedEntity)
            {
                versionedEntity.Version++;
            }
        }
    }
}
