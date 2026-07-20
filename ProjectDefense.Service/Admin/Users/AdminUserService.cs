using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Admin.Users.Interfaces;
using ProjectDefense.Service.Admin.Users.QueryObjects;
using StatusGeneric;

namespace ProjectDefense.Service.Admin.Users
{
    public class AdminUserService(IUnitOfWork unitOfWork) : StatusGenericHandler, IAdminUserService
    {
        
        public async Task<UserDto?> GetByIdAsync(Guid userId)
        {
            var user = await FindUsers([userId]).FirstOrDefaultAsync();
            if (user == null) { AddError("User not found."); return null; }
            return ToDto(user);
        }

        public Task<IStatusGeneric> BlockAsync(List<Guid> userIds) =>
            SetStatus(userIds, UserStatusConstants.BlockedStatusCode);

        public Task<IStatusGeneric> UnblockAsync(List<Guid> userIds) =>
            SetStatus(userIds, UserStatusConstants.ActiveStatusCode);

        public async Task<IStatusGeneric> DeleteAsync(List<Guid> userIds)
        {
            var users = await FindUsers(userIds).ToListAsync();
            unitOfWork.UserRepository().DeleteRange(users);
            await unitOfWork.SaveChanges();
            return this;
        }

        public async Task<IStatusGeneric> AssignRoleAsync(List<Guid> userIds, short roleCode)
        {
            var alreadyHaveIt = await unitOfWork.UserRoleRepository().GetAll()
                .Where(ur => userIds.Contains(ur.UserId) && ur.RoleCode == roleCode)
                .Select(ur => ur.UserId)
                .ToListAsync();

            var toAssign = userIds.Except(alreadyHaveIt)
                .Select(id => new UserRole { UserId = id, RoleCode = roleCode })
                .ToList();

            if (toAssign.Count == 0) { AddError("Selected users already have this role."); return this; }

            unitOfWork.UserRoleRepository().AddRange(toAssign);
            await unitOfWork.SaveChanges();
            return this;
        }

        public async Task<IStatusGeneric> RemoveRoleAsync(List<Guid> userIds, short roleCode)
        {
            var toRemove = await unitOfWork.UserRoleRepository().GetAll()
                .Where(ur => userIds.Contains(ur.UserId) && ur.RoleCode == roleCode)
                .ToListAsync();

            if (toRemove.Count == 0) { AddError("None of the selected users have this role."); return this; }

            unitOfWork.UserRoleRepository().DeleteRange(toRemove);
            await unitOfWork.SaveChanges();
            return this;
        }

        private async Task<IStatusGeneric> SetStatus(List<Guid> userIds, short statusCode)
        {
            var users = await FindUsers(userIds).ToListAsync();
            if (users.Count == 0) { AddError("No matching users found."); return this; }

            foreach (var user in users)
                user.StatusCode = statusCode;

            unitOfWork.UserRepository().UpdateRange(users);
            await unitOfWork.SaveChanges();
            return this;
        }

        private IQueryable<User> FindUsers(List<Guid> userIds) =>
            unitOfWork.UserRepository().GetAll(u => u.Status!, u => u.UserRoles)
                .Where(u => userIds.Contains(u.Id));

        private static UserDto ToDto(User u) => new()
        {
            Id = u.Id,
            Email = u.Email,
            IsVerified = u.IsVerified,
            StatusCode = u.StatusCode,
            StatusName = u.Status?.Name ?? string.Empty,
            Roles = u.UserRoles.Select(ur => ur.Role?.Name ?? string.Empty).ToList()
        };

        public async Task<PaginationModel<UserDto>> GetAllAsync(UserFilterOptions filterOptions)
        {
            var query = unitOfWork.UserRepository()
                .GetAll(u => u.Status!, u => u.UserRoles)
                .ApplyFilter(filterOptions);

            var page = await query.ToPaginationModelAsync(filterOptions.Page, filterOptions.PageSize);

            return new PaginationModel<UserDto>
            {
                Rows = page.Rows.Select(ToDto).ToList(),
                PageIndex = page.PageIndex,
                PageSize = page.PageSize,
                Total = page.Total
            };
        }
    }
}