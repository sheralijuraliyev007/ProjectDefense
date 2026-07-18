using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.UserAttribute;
using StatusGeneric;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IUserAttributeService
    {
        Task<List<UserAttributeDto>> GetMyAttributesAsync();

        Task<IStatusGeneric> AddAttributeAsync(int attributeId, Guid? targetUserId = null);

        Task<IStatusGeneric> RemoveAttributeAsync(int attributeId, Guid? targetUserId = null);

        Task<IStatusGeneric> SetValueAsync(SetUserAttributeValueModel model, Guid? targetUserId = null);
    }
}
