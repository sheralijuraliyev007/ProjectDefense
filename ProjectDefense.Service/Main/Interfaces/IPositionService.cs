using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Position;
using ProjectDefense.Service.Main.Base.Interfaces;
using StatusGeneric;
namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IPositionService : IMainServiceBase<PositionFilterOptions, PositionDto, PositionCreateModel, PositionUpdateModel>
    {
        Task<IStatusGeneric> SetAttributesAsync(int positionId, List<int> attributeIds);
        Task<IStatusGeneric> SetProjectTagsAsync(int positionId, List<string> tagLabels);
        Task<int?> DuplicateAsync(int positionId);
        Task<List<AttributeDto>> GetAttributesAsync(int positionId);
    }
}