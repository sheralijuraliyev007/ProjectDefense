using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Data.Entities.MainEntities;

namespace ProjectDefense.Service.Admin.Users.QueryObjects
{
    public static class UserQueryObject
    {
        public static IQueryable<User> ApplyFilter(this IQueryable<User> query, UserFilterOptions options)
        {
            if (options.StatusCode.HasValue)
                query = query.Where(u => u.StatusCode == options.StatusCode);

            if (options.RoleCode.HasValue)
                query = query.Where(u => u.UserRoles.Any(ur => ur.RoleCode == options.RoleCode));

            if (options.IsVerified.HasValue)
                query = query.Where(u => u.IsVerified == options.IsVerified);

            if (options.HasSearch())
                query = query.Where(u => u.Email.Contains(options.Search!));

            query = query.ApplyBaseFilter(options);
            return query;
        }
    }
}