using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Data.Entities.MainEntities;

namespace ProjectDefense.Service.Main.QueryObjects
{
    public static class PositionQueryObject
    {
        public static IQueryable<Position> ApplyFilter(this IQueryable<Position> query, PositionFilterOptions options)
        {
            if (options.IsPublic.HasValue)
                query = query.Where(p => p.IsPublic == options.IsPublic);

            if (options.StatusCode.HasValue)
                query = query.Where(p => p.StatusCode == options.StatusCode);

            if (options.HasSearch())
                query = query.Where(p => p.Title.Contains(options.Search!) || p.ShortDescription.Contains(options.Search!));

            query = query.ApplyBaseFilter(options);
            return query;
        }
    }
}
