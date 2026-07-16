using ProjectDefense.Common.Models.Shared;
using System;
using Microsoft.EntityFrameworkCore;

namespace ProjectDefense.Common.Extensions
{
    public static class CommonExtension
    {
        public static async Task<PaginationModel<T>> ToPaginationModelAsync<T>(
            this IQueryable<T> query, int page, int pageSize) where T : class
        {
            var total = await query.CountAsync();

            var rows = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginationModel<T>
            {
                Rows = rows,
                PageIndex = page,
                PageSize = pageSize,
                Total = total
            };
        }
    }
}
