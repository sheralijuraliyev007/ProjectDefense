using Mapster;
using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Extensions;
using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Admin.Base.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Admin.Base
{
    public class BaseInfoService<TEntity> : StatusGenericHandler, IBaseInfoService<TEntity>
        where TEntity : BaseEntity
    {
        protected readonly IBaseRepository<TEntity> _baseRepository;
        protected readonly IUserHelper _userHelper;

        public BaseInfoService(IBaseRepository<TEntity> baseRepository, IUserHelper userHelper)
        {
            _baseRepository = baseRepository;
            _userHelper = userHelper;
        }

        public async Task<string> Create<TModel>(TModel model)
        {
            var (userExists, userId) = UserExists();
            if (!userExists) return string.Empty;

            var entity = model.MapToEntity<TEntity, TModel>();
            entity.CreatedUserId = userId;

            try
            {
                await _baseRepository.Add(entity);
                await _baseRepository.SaveChanges();
                return "Added";
            }
            catch (DbUpdateException ex)
            {
                AddError(ex.ToString());
                return string.Empty;
            }
        }

        public async Task<string> DeleteById<TId>(TId id)
        {
            var (exists, entity) = await EntityExist(id);
            if (!exists) return string.Empty;

            try
            {
                _baseRepository.Delete(entity!);
                await _baseRepository.SaveChanges();
                return "Deleted";
            }
            catch (DbUpdateException ex)
            {
                AddError(ex.ToString());
                return string.Empty;
            }
        }

        public async Task<List<TDto>> GetAll<TDto>()
        {
            var entities = _baseRepository.GetAll().ToList();

            return entities.MapToDtos<TEntity, TDto>();
        }

        public async Task<TDto?> GetById<TDto, TId>(TId id)
        {
            var (exists, entity) = await EntityExist(id);
            if (!exists) return default(TDto);

            return entity!.MapToDto<TEntity, TDto>();
        }

        public async Task<string> Update<TId, TModel>(TId id, TModel model)
        {
            var (exists, entity) = await EntityExist(id);
            if (!exists) return string.Empty;

            var (userExists, userId) = UserExists();
            if (!userExists) return string.Empty;

            model.Adapt(entity);
            entity!.ModifiedUserId = userId;

            try
            {
                await _baseRepository.Update(entity);
                await _baseRepository.SaveChanges();
                return "Updated";
            }
            catch (DbUpdateException)
            {
                AddError("Entity with this name or code already exists.");
                return string.Empty;
            }
        }

        private (bool, Guid?) UserExists()
        {
            var userId = _userHelper.GetUserId();
            if (userId == null)
            {
                AddError("User is not authenticated.");
                return (false, null);
            }
            return (true, userId);
        }

        private async Task<(bool, TEntity?)> EntityExist<TId>(TId id)
        {
            var entity = await _baseRepository.GetById(id);
            if (entity == null)
            {
                AddError("Entity does not exist.");
                return (false, null);
            }
            return (true, entity);
        }
    }
}