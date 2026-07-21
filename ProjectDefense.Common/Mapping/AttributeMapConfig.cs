using Mapster;
using ProjectDefense.Common.DTOs.Main;

namespace ProjectDefense.Common.Mapping
{
    public static class AttributeMapConfig
    {
        public static void Register()
        {
            TypeAdapterConfig<Data.Entities.MainEntities.Attribute, AttributeDto>.NewConfig()
                .Map(dest => dest.DtypeName, src => src.DType!.Name)
                .Map(dest => dest.CategoryName, src => src.CategoryType!.Name);
        }
    }

}
