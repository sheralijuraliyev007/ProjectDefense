using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;


namespace ProjectDefense.Service.Main.QueryObjects
{
    public static class AttributeQueryObject
    {
        public static IQueryable<Data.Entities.MainEntities.Attribute> ApplyFilter(this IQueryable<Data.Entities.MainEntities.Attribute> query, AttributeFilterOptions options)
        {
            if (options.CategoryCode.HasValue)
                query = query.Where(a => a.CategoryCode == options.CategoryCode);

            if (options.DtypeCode.HasValue)
                query = query.Where(a => a.DtypeCode == options.DtypeCode);

            if (options.HasSearch())
                query = query.Where(a => a.Name.Contains(options.Search!) || a.Description.Contains(options.Search!));

            query = query.ApplyBaseFilter(options);
            return query;
        }
    }
}
