using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Service.Main
{
    public class PositionAccessService(IUnitOfWork unitOfWork) : IPositionAccessService
    {
        public async Task<bool> CanAccessAsync(int positionId, Guid userId)
        {
            var position = await unitOfWork.PositionRepository().GetById(positionId);
            if (position == null) return false;

            if (position.IsPublic) return true;

            var rules = await GetRules(positionId);
            if (rules.Count == 0) return true; 

            var myAttributes = await GetMyAttributes(userId, rules);

            
            foreach (var rule in rules)
            {
                var myValue = myAttributes.GetValueOrDefault(rule.AttributeId);
                if (!RuleSatisfied(rule, myValue))
                    return false;
            }

            return true;
        }

        
        private Task<List<PositionRule>> GetRules(int positionId) =>
            unitOfWork.PositionRuleRepository()
                .GetAll()
                .Where(r => r.PositionId == positionId)
                .ToListAsync();

        
        private async Task<Dictionary<int, UserAttribute>> GetMyAttributes(Guid userId, List<PositionRule> rules)
        {
            var neededAttributeIds = rules.Select(r => r.AttributeId).Distinct().ToList();

            var rows = await unitOfWork.UserAttributeRepository()
                .GetAll()
                .Where(ua => ua.UserId == userId && neededAttributeIds.Contains(ua.AttributeId))
                .ToListAsync();

            return rows.ToDictionary(ua => ua.AttributeId);
        }

        
        private static bool RuleSatisfied(PositionRule rule, UserAttribute? myValue)
        {
            if (myValue == null) return false; 

            return rule.RuleCode switch
            {
                RuleOperatorConstants.GreaterThan => IsBigger(myValue.ValueNumeric, rule.ValueNumeric),
                RuleOperatorConstants.LessThan => IsSmaller(myValue.ValueNumeric, rule.ValueNumeric),
                RuleOperatorConstants.GreaterOrEqual => IsBiggerOrSame(myValue.ValueNumeric, rule.ValueNumeric),
                RuleOperatorConstants.LessOrEqual => IsSmallerOrSame(myValue.ValueNumeric, rule.ValueNumeric),
                RuleOperatorConstants.Equal => ValuesMatch(myValue, rule),
                RuleOperatorConstants.NotEqual => !ValuesMatch(myValue, rule),
                RuleOperatorConstants.IsTrue => myValue.ValueBoolean == true,
                RuleOperatorConstants.IsFalse => myValue.ValueBoolean == false,
                _ => false
            };
        }

        private static bool IsBigger(decimal? mine, decimal? required) => mine.HasValue && required.HasValue && mine > required;
        private static bool IsSmaller(decimal? mine, decimal? required) => mine.HasValue && required.HasValue && mine < required;
        private static bool IsBiggerOrSame(decimal? mine, decimal? required) => mine.HasValue && required.HasValue && mine >= required;
        private static bool IsSmallerOrSame(decimal? mine, decimal? required) => mine.HasValue && required.HasValue && mine <= required;

        private static bool ValuesMatch(UserAttribute mine, PositionRule rule)
        {
            if (rule.ValueOptionId.HasValue) return mine.ValueOptionId == rule.ValueOptionId;
            if (rule.ValueNumeric.HasValue) return mine.ValueNumeric == rule.ValueNumeric;
            if (rule.ValueDate.HasValue) return mine.ValueDate == rule.ValueDate;
            return false;
        }
    }
}