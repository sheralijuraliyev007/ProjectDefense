using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using StatusGeneric;


namespace ProjectDefense.Service.Main
{
    public class PositionExportService(
    IUnitOfWork unitOfWork,
    IUserHelper userHelper) : StatusGenericHandler, IPositionExportService
    {
        public async Task<string> GenerateApiTokenAsync(int positionId)
        {
            if (!await CanModify()) { AddError("You are not allowed to do this action"); return string.Empty; }

            var position = await unitOfWork.PositionRepository().GetById(positionId);
            if (position == null) { AddError("Position not found."); return string.Empty; }

            if (string.IsNullOrEmpty(position.ApiToken))
            {
                position.ApiToken = Guid.NewGuid().ToString();
                await unitOfWork.PositionRepository().Update(position);
                await unitOfWork.PositionRepository().SaveChanges();
            }
            return position.ApiToken;
        }



        public async Task<PositionExportDto?> GetByTokenAsync(string token)
        {
            var position = await unitOfWork.PositionRepository().GetAll().FirstOrDefaultAsync(p => p.ApiToken == token && p.StatusCode == CommonStatusConstants.ActiveStatusCode);
            if (position is null) { AddError("Position with that token does not exist"); return null; }

            var attributes = await unitOfWork.PositionAttributeRepository()
            .GetAll(pa => pa.Attribute!).Where(pa => pa.PositionId == position.Id)
            .Select(pa => pa.Attribute!).ToListAsync();

            var list = new List<AttributeAggregateDto>();
            foreach (var attribute in attributes)
            {
                list.Add(await BuildOneAggreagateAsync(position.Id, attribute));
            }
            return new PositionExportDto
            {
                Title = position.Title,
                ShortDescription = position.ShortDescription,
                AttributeAggregateDtos = list
            };

        }



        private async Task<AttributeAggregateDto> BuildOneAggreagateAsync(int positionId, Data.Entities.MainEntities.Attribute attribute)
        {
            return attribute.DtypeCode switch
            {

                AttributeDtypeConstants.Boolean => await BuildBooleanAggregateAsync(positionId, attribute),
                AttributeDtypeConstants.Numeric => await BuildNumericAggreagateAsync(positionId, attribute),
                AttributeDtypeConstants.OneOfMany => await BuildOneOfManyAggreagateAsync(positionId, attribute),
                AttributeDtypeConstants.Text or AttributeDtypeConstants.String => await BuildTextAggregateAsync(positionId, attribute),
                _ => BuildEmptyAggregate(attribute)
            };
        }

        private static AttributeAggregateDto BuildEmptyAggregate(Data.Entities.MainEntities.Attribute attribute) => new()
        {
            Name = attribute.Name,
            Type = "Unsupported",
            AggregatedResult = "Aggregation not supported for this attribute type",
            RawValues = new()
        };

        private async Task<AttributeAggregateDto> BuildTextAggregateAsync(int positionId, Data.Entities.MainEntities.Attribute attribute)
        {
            var topValues = await GetTopTextValuesAsync(positionId, attribute.Id);
            return new AttributeAggregateDto
            {
                Name = attribute.Name,
                Type = AttributeDtypeConstants.TextName,
                AggregatedResult = topValues.Count == 0 ? "No data" : $"Top {topValues.Count} values: {string.Join(", ", topValues.Select(v => $"{v.Label} ({v.Count})"))}",
                RawValues = topValues.ToDictionary(v => v.Label, v => (object)v.Count)
            };
        }

        private async Task<AttributeAggregateDto> BuildBooleanAggregateAsync(int positionId, Data.Entities.MainEntities.Attribute attribute)
        {
            var (trueCount, falseCount) = await GetBooleanSummaryAsync(positionId, attribute.Id);
            var dto = new AttributeAggregateDto
            {
                Name = attribute.Name,
                Type = AttributeDtypeConstants.BooleanName,
                AggregatedResult = $"Number of positive responses : {trueCount}, negative responses : {falseCount}",
                RawValues = new() { ["trueCount"] = trueCount, ["falseCount"] = falseCount }
            };

            return dto;
        }

        private async Task<AttributeAggregateDto> BuildOneOfManyAggreagateAsync(int positionId, Data.Entities.MainEntities.Attribute attribute)
        {
            List<(string, int)> topOptions = await GetTopOptionsAsync(positionId, attribute.Id);



            var dto = new AttributeAggregateDto
            {
                Name = attribute.Name,
                Type = AttributeDtypeConstants.OneOfManyName,
                AggregatedResult = $"Top {topOptions.Count} options: {string.Join(", ", topOptions.Select(to => $"{to.Item1} ({to.Item2})"))}",
                RawValues = topOptions.ToDictionary(to => to.Item1, to => (object)to.Item2)
            };
            return dto;
        }

        private async Task<AttributeAggregateDto> BuildNumericAggreagateAsync(int positionId, Data.Entities.MainEntities.Attribute attribute)
        {
            var (min, max, average) = await GetNumericSummaryAsync(positionId, attribute.Id);

            var dto = new AttributeAggregateDto
            {
                Name = attribute.Name,
                Type = AttributeDtypeConstants.NumericName,
                AggregatedResult = $"Minimum value: {min}. Maximum value {max}. Average : {average}",
                RawValues = new() { ["min"] = min, ["max"] = max, ["avg"] = average }
            };
            return dto;
        }


        private async Task<List<long>> GetPublishedCvIdsAsync(int positionId) =>
    await unitOfWork.CVRepository().GetAll()
        .Where(cv => cv.PositionId == positionId && cv.StatusCode == CVStatusConstants.PublishedStatusCode)
        .Select(cv => cv.Id)
        .ToListAsync();

        private async Task<IQueryable<CVAttribute>> GetAttributeValuesAsync(int positionId, int attributeId)
        {
            var cvIds = await GetPublishedCvIdsAsync(positionId);
            return unitOfWork.CVAttributeRepository()
                .GetAll(cva => cva.ValueOption!)
                .Where(cva => cvIds.Contains(cva.CVId) && cva.AttributeId == attributeId);
        }

        private async Task<(decimal? Min, decimal? Max, decimal? Average)> GetNumericSummaryAsync(int positionId, int attributeId)
        {
            var values = (await GetAttributeValuesAsync(positionId, attributeId))
                .Where(cva => cva.ValueNumeric != null)
                .Select(cva => cva.ValueNumeric!.Value);

            if (!await values.AnyAsync()) return (null, null, null);

            return (await values.MinAsync(), await values.MaxAsync(), await values.AverageAsync());
        }

        private async Task<(int TrueCount, int FalseCount)> GetBooleanSummaryAsync(int positionId, int attributeId)
        {
            var values = (await GetAttributeValuesAsync(positionId, attributeId))
                .Where(cva => cva.ValueBoolean != null)
                .Select(cva => cva.ValueBoolean!.Value);

            return (await values.CountAsync(v => v), await values.CountAsync(v => !v));
        }

        private async Task<List<(string Label, int Count)>> GetTopOptionsAsync(int positionId, int attributeId, int topN = 3)
        {
            var query = (await GetAttributeValuesAsync(positionId, attributeId))
                .Where(cva => cva.ValueOptionId != null)
                .GroupBy(cva => cva.ValueOption!.Label)
                .Select(g => new { Label = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(topN);

            var results = await query.ToListAsync();
            return results.Select(r => (r.Label, r.Count)).ToList();
        }

        private async Task<List<(string Label, int Count)>> GetTopTextValuesAsync(int positionId, int attributeId, int topN = 3)
        {
            var raw = (await GetAttributeValuesAsync(positionId, attributeId))
                .Where(cva => cva.ValueGeneric != null)
                .Select(cva => cva.ValueGeneric!);

            var values = await raw.ToListAsync();
            return SummarizeTopValues(values, topN);
        }

        private static List<(string Label, int Count)> SummarizeTopValues(List<string> values, int topN) =>
            values
                .GroupBy(v => v.Trim().ToLowerInvariant())
                .Select(g => (Label: g.First().Trim(), Count: g.Count()))
                .OrderByDescending(g => g.Count)
                .Take(topN)
                .ToList();


        private async Task<bool> CanModify()
        {
            var userId = userHelper.GetUserId();
            if (userId == null) { AddError("You are not logged in"); return false; }
            return await unitOfWork.UserRoleRepository().GetAll()
                .AnyAsync(ur => ur.UserId == userId
                    && (ur.RoleCode == RoleConstants.Recruiter || ur.RoleCode == RoleConstants.Administrator));
        }
    }
}
