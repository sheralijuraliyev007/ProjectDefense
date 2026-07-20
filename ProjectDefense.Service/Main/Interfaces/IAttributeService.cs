
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Attribute;
using ProjectDefense.Service.Main.Base.Interfaces;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IAttributeService : IMainServiceBase<AttributeFilterOptions, AttributeDto, AttributeCreateModel, AttributeUpdateModel>
    {
        Task<List<AttributeDto>> SearchByPrefixAsync(string prefix, int limit = 10);
    }
}
