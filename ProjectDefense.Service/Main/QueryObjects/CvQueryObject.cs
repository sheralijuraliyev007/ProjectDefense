using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Data.Entities.MainEntities;


namespace ProjectDefense.Service.Main.QueryObjects
{
    public static class CvQueryObject
    {
        public static IQueryable<CV> ApplyFilter(this IQueryable<CV> query, CVFilterOptions options)
        {
            if (options.PositionId.HasValue)
                query = query.Where(cv => cv.PositionId == options.PositionId);

            if (options.StatusCode.HasValue)
                query = query.Where(cv => cv.StatusCode == options.StatusCode);

            query = query.ApplyBaseFilter(options);
            return query;
        }
    }
}
