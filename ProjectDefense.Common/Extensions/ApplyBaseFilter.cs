using ProjectDefense.Common.FilterOptions;
using System.Linq.Expressions;
using System.Linq.Dynamic.Core;

namespace ProjectDefense.Common.Extensions
{
    public static class BaseApplyFilter
    {
        // only search + sort here, NO Skip/Take
        // pagination happens later in ToPaginationModelAsync so Count() stays accurate
        public static IQueryable<TEntity> ApplyBaseFilter<TEntity>(
            this IQueryable<TEntity> query,
            BaseFilterOptions options,
            Expression<Func<TEntity, bool>>? searchExpression = null)
        {
            // 🔎 Search
            if (options.HasSearch() && searchExpression != null)
            {
                query = query.Where(searchExpression);
            }

            // ↕️ Sort
            query = query.OrderBy(options.HasSort()
                ? $"{options.SortBy} {options.OrderType}"
                : $"Id {BaseFilterOptions.ORDER_TYPE_DESC}");

            return query;
        }
    }
}
