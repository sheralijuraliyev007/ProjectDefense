using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Data.Entities.MainEntities;

namespace ProjectDefense.Service.Main.QueryObjects
{
    public static class ProjectQueryObject
    {
        public static IQueryable<Project> ApplyFilter(this IQueryable<Project> query, ProjectFilterOptions options)
        {
            if (options.UserId.HasValue)
                query = query.Where(p => p.UserId == options.UserId);

            if (!string.IsNullOrEmpty(options.TagLabel))
                query = query.Where(p => p.ProjectTags.Any(t => t.Tag!.Label == options.TagLabel));

            if (options.HasSearch())
                query = query.Where(p => p.Name.Contains(options.Search!) || p.Description.Contains(options.Search!));

            query = query.ApplyBaseFilter(options);
            return query;
        }
    }
}
