using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Shared;
using StatusGeneric;

namespace ProjectDefense.Service.Admin.Users.Interfaces
{
    public interface IAdminUserService : IStatusGeneric
    {
        Task<PaginationModel<UserDto>> GetAllAsync(UserFilterOptions filterOptions);
        Task<UserDto?> GetByIdAsync(Guid userId);

        Task<IStatusGeneric> BlockAsync(List<Guid> userIds);
        Task<IStatusGeneric> UnblockAsync(List<Guid> userIds);
        Task<IStatusGeneric> DeleteAsync(List<Guid> userIds);

        Task<IStatusGeneric> AssignRoleAsync(List<Guid> userIds, short roleCode);
        Task<IStatusGeneric> RemoveRoleAsync(List<Guid> userIds, short roleCode);
    }
}