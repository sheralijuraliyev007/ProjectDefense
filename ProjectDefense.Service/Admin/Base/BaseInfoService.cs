using Mapster;
using ProjectDefense.Common.Extensions;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Admin.Base.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Admin.Base
{
    public class BaseInfoService<TEntity> : StatusGenericHandler, IBaseInfoService<TEntity>
        where TEntity : class, IHasCommonAttributes
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
            var (isExists, userId) = UserExists();
            if (!isExists)
            {
                return "Failed";
            }
            var entity = model.MapToEntity<TEntity, TModel>();
            entity.CreatedUserId = userId;
            await _baseRepository.Add(entity);
            await _baseRepository.SaveChanges();

            return "Added";
        }

        public async Task<string> DeleteById<TId>(TId id)
        {
            var (exists, entity) =await EntityExist(id);
            if (!exists) {
                return "Entity not found";      
            }
            await _baseRepository.Delete(entity!);
            await _baseRepository.SaveChanges();

            return "Deleted";
        }

        public async Task<List<TDto>> GetAll<TDto>()
        {
            var entites = _baseRepository.GetAll().ToList();
            return entites.MapToDtos<TDto, TEntity>();

        }

        public async Task<TDto?> GetById<TDto, TId>(TId id)
        {
            var (exists, entity) = await EntityExist(id);
            if (!exists) return default(TDto);

            return entity!.MapToDto<TDto, TEntity>();
            
        }

        public async Task<string?> Update<TId, TModel>(TId id, TModel model)
        {
            var(exists, entity) = await EntityExist(id);
            if (!exists) return null;

            var (existUser, userId) = UserExists();
            if (!existUser) return null;

            model.Adapt(entity);
            entity!.ModifiedUserId = userId;
            entity!.ModifiedDateTime = DateTimeOffset.UtcNow;
            await _baseRepository.Update(entity!);
            await _baseRepository.SaveChanges();
            return "Updated";
                
        }


        private (bool, Guid?) UserExists()
        {
            var userId = _userHelper.GetUserId();
            if (userId == null) {
                AddError("User is not authenticated");
                return new(false, null);
            }

            return new(true, userId);
        }

        private async Task<(bool, TEntity?)> EntityExist<TId>(TId id)
        {
            var entity = await _baseRepository.GetById(id);
            if (entity == null)
            {
                AddError("Entity does not exist");
                return (false, null);
            }
            return (true, entity);
        }
    }
}
