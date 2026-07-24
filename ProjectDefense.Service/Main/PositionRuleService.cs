using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.Position;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using StatusGeneric;

public class PositionRuleService(IUnitOfWork unitOfWork, IUserHelper userHelper, IAttributeService attributeService)
    : StatusGenericHandler, IPositionRuleService
{
    public async Task<List<PositionRuleDto>> GetRulesAsync(int positionId)
    {
        var rows = await unitOfWork.PositionRuleRepository()
            .GetAll(r => r.RuleOperator!, r => r.ValueOption!)
            .Where(r => r.PositionId == positionId)
            .ToListAsync();

        var attributeIds = rows.Select(r => r.AttributeId).Distinct().ToList();
        var attributes = await attributeService.GetByIdsAsync(attributeIds);
        var attrNameById = attributes.ToDictionary(a => a.Id, a => a.Name);

        return rows.Select(r => ToDto(r, attrNameById.GetValueOrDefault(r.AttributeId, string.Empty))).ToList();
    }

    public async Task<IStatusGeneric> SetRulesAsync(int positionId, List<PositionRuleModel> rules)
    {
        if (!await CanManage()) { AddError("You're not allowed to edit this position's rules."); return this; }

        var position = await unitOfWork.PositionRepository().GetById(positionId);
        if (position == null) { AddError("Position not found."); return this; }

        var attributeIds = rules.Select(r => r.AttributeId).Distinct().ToList();
        var attributes = await attributeService.GetByIdsAsync(attributeIds);
        var attrById = attributes.ToDictionary(a => a.Id);

        foreach (var rule in rules)
        {
            if (!IsValidForAttribute(rule, attrById)) { AddError("A rule's value doesn't match its attribute's type."); return this; }
        }

        await ReplaceRules(positionId, rules);
        return this;
    }

    private Task<bool> CanManage()
    {
        var userId = userHelper.GetUserId();
        if (userId == null) return Task.FromResult(false);

        return unitOfWork.UserRoleRepository().GetAll()
            .AnyAsync(ur => ur.UserId == userId
                && (ur.RoleCode == RoleConstants.Recruiter || ur.RoleCode == RoleConstants.Administrator));
    }

    private static bool IsValidForAttribute(PositionRuleModel rule, Dictionary<int, AttributeDto> attrById)
    {
        if (!attrById.TryGetValue(rule.AttributeId, out var attribute)) return false;

        return attribute.DtypeCode switch
        {
            AttributeDtypeConstants.Numeric => rule.ValueNumeric.HasValue,
            AttributeDtypeConstants.Date => rule.ValueDate.HasValue,
            AttributeDtypeConstants.Boolean => rule.ValueBoolean.HasValue,
            AttributeDtypeConstants.OneOfMany => rule.ValueOptionId.HasValue,
            _ => false,
        };
    }

    private async Task ReplaceRules(int positionId, List<PositionRuleModel> rules)
    {
        var repo = unitOfWork.PositionRuleRepository();

        var oldRules = await repo.GetAll().Where(r => r.PositionId == positionId).ToListAsync();
        repo.DeleteRange(oldRules);

        var newRules = rules.Select(r => new PositionRule
        {
            PositionId = positionId,
            AttributeId = r.AttributeId,
            RuleCode = r.RuleCode,
            ValueNumeric = r.ValueNumeric,
            ValueDate = r.ValueDate.HasValue ? DateTime.SpecifyKind(r.ValueDate.Value, DateTimeKind.Utc) : null,
            ValueBoolean = r.ValueBoolean,
            ValueOptionId = r.ValueOptionId,
        }).ToList();
        repo.AddRange(newRules);

        await repo.SaveChanges();
    }

    private static PositionRuleDto ToDto(PositionRule r, string attributeName) => new()
    {
        Id = r.Id,
        AttributeId = r.AttributeId,
        AttributeName = attributeName,
        RuleCode = r.RuleCode,
        RuleName = r.RuleOperator?.Name ?? string.Empty,
        ValueNumeric = r.ValueNumeric,
        ValueDate = r.ValueDate,
        ValueBoolean = r.ValueBoolean,
        ValueOptionId = r.ValueOptionId,
        ValueOptionLabel = r.ValueOption?.Label,
    };
}