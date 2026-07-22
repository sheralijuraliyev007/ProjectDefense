using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.UserAttribute;
using StatusGeneric;
namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IUserAttributeService : IStatusGeneric
    {
        Task<List<UserAttributeDto>> GetAttributesAsync(Guid? targetUserId = null);
        Task<IStatusGeneric> AddAttributeAsync(int attributeId, Guid? targetUserId = null);
        Task<IStatusGeneric> RemoveAttributeAsync(int attributeId, Guid? targetUserId = null);
        Task<(IStatusGeneric Status, int? NewVersion)> SetValueAsync(SetUserAttributeValueModel model, Guid? targetUserId = null);
    }
}