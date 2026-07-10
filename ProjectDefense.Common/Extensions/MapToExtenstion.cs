using Mapster;

namespace ProjectDefense.Common.Extensions
{
    public static class MapToExtenstion
    {
        public static TEntity MapToEntity<TEntity, TModel>(this TModel model, TypeAdapterConfig? config = null)
        {
            var entity = config is null ? model.Adapt<TEntity>()
                : model.Adapt<TEntity>(config);

            return entity;
        }

        public static TDto MapToDto<TDto, TEntity>(this TEntity entity, TypeAdapterConfig? config = null)
        {
            var dto = config is null ? entity.Adapt<TDto>()
                : entity.Adapt<TDto>(config);
            return dto;
        }

        public static List<TDto> MapToDtos<TDto, TEntity>(this List<TEntity>? entities) { 
            if(entities is null)
            {
                return new();
            }
            return entities.Select(e => e.MapToDto<TDto, TEntity>()).ToList();
        }
    }
}
