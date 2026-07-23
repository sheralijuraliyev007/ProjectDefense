using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.UserAttribute;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class UserAttributeService(IUnitOfWork unitOfWork, IUserHelper userHelper) : StatusGenericHandler, IUserAttributeService
    {
        public const string VersionConflictMarker = "VERSION_CONFLICT";

        public async Task<IStatusGeneric> AddAttributeAsync(int attributeId, Guid? targetUserId = null)
        {
            var (exists, callerId) = await UserExist();
            if (!exists)
            {
                AddError("You are not logged in");
                return this;
            }

            var (attributeExist, _) = await AttributeExist(attributeId);
            if (!attributeExist)
            {
                AddError("Attribute doesn't exist");
                return this;
            }

            var ownerId = targetUserId ?? callerId!.Value;
            if (ownerId != callerId && !await IsAdministrator(callerId!.Value))
            {
                AddError("You're not allowed to edit this profile.");
                return this;
            }

            if (await unitOfWork.UserAttributeRepository().GetAll()
                    .AnyAsync(ua => ua.UserId == ownerId && ua.AttributeId == attributeId))
            {
                AddError("This attribute is already on this profile.");
                return this;
            }

            await unitOfWork.UserAttributeRepository().Add(new UserAttribute
            {
                UserId = ownerId,
                AttributeId = attributeId,
                CreatedUserId = callerId
            });
            await unitOfWork.UserAttributeRepository().SaveChanges();
            return this;
        }

        public async Task<List<UserAttributeDto>> GetAttributesAsync(Guid? targetUserId = null)
        {
            var callerId = userHelper.GetUserId();
            if (callerId == null) { AddError("You are not logged in"); return []; }

            var ownerId = targetUserId ?? callerId.Value;
            if (ownerId != callerId && !await IsAdministrator(callerId.Value))
            {
                AddError("You're not allowed to view this profile.");
                return [];
            }

            var rows = await unitOfWork.UserAttributeRepository()
                .GetAll(ua => ua.Attribute!, ua => ua.ValueOption!, ua => ua.ValueContent!)
                .Where(ua => ua.UserId == ownerId)
                .ToListAsync();

            return rows.Select(ToDto).ToList();
        }

        public async Task<IStatusGeneric> RemoveAttributeAsync(int attributeId, Guid? targetUserId = null)
        {
            var callerId = userHelper.GetUserId();
            if (callerId == null) { AddError("Not logged in."); return this; }

            var ownerId = targetUserId ?? callerId.Value;
            if (ownerId != callerId && !await IsAdministrator(callerId.Value))
            {
                AddError("You're not allowed to edit this profile.");
                return this;
            }

            var entry = await unitOfWork.UserAttributeRepository().GetAll()
                .FirstOrDefaultAsync(ua => ua.UserId == ownerId && ua.AttributeId == attributeId);
            if (entry == null) { AddError("Not found on this profile."); return this; }

            var attribute = await unitOfWork.AttributeRepository().GetById(attributeId);
            if (attribute is { IsRemovable: false })
            {
                AddError("This attribute can't be removed.");
                return this;
            }

            unitOfWork.UserAttributeRepository().Delete(entry);
            await unitOfWork.UserAttributeRepository().SaveChanges();
            return this;
        }

        public async Task<(IStatusGeneric Status, int? NewVersion)> SetValueAsync(SetUserAttributeValueModel model, Guid? targetUserId = null)
        {
            var authResult = await AuthorizeOwner(targetUserId);
            if (authResult.Error != null) { AddError(authResult.Error); return (this, null); }

            var entry = await FindUserAttribute(authResult.OwnerId, model.AttributeId);
            if (entry == null) { AddError("Add this attribute to your profile first."); return (this, null); }

            if (entry.Version != model.Version)
            {
                AddError(VersionConflictMarker);
                return (this, entry.Version);
            }

            return await ApplyAndSave(entry, model, authResult.CallerId);
        }

        private async Task<(Guid? CallerId, Guid OwnerId, string? Error)> AuthorizeOwner(Guid? targetUserId)
        {
            var callerId = userHelper.GetUserId();
            if (callerId == null) return (null, default, "Not logged in.");

            var ownerId = targetUserId ?? callerId.Value;
            if (ownerId != callerId && !await IsAdministrator(callerId.Value))
                return (callerId, ownerId, "You're not allowed to edit this profile.");

            return (callerId, ownerId, null);
        }

        private Task<UserAttribute?> FindUserAttribute(Guid ownerId, int attributeId) =>
            unitOfWork.UserAttributeRepository().GetAll()
                .FirstOrDefaultAsync(ua => ua.UserId == ownerId && ua.AttributeId == attributeId);

        private async Task<(IStatusGeneric, int?)> ApplyAndSave(UserAttribute entry, SetUserAttributeValueModel model, Guid? callerId)
        {
            var attribute = await unitOfWork.AttributeRepository().GetById(model.AttributeId);
            if (attribute == null) { AddError("Attribute not found."); return (this, null); }

            if (!TryApplyValue(entry, attribute.DtypeCode, model))
            {
                AddError("The value doesn't match this attribute's type.");
                return (this, null);
            }

            entry.ModifiedUserId = callerId;
            entry.Version++;
            await unitOfWork.UserAttributeRepository().Update(entry);
            await unitOfWork.SaveChanges();
            return (this, entry.Version);
        }

        private Task<bool> IsAdministrator(Guid userId) => unitOfWork.UserRoleRepository().GetAll().AnyAsync(ur => ur.UserId == userId && ur.RoleCode == RoleConstants.Administrator);

        private async Task<(bool, Guid?)> UserExist()
        {
            var userId = userHelper.GetUserId();
            if (userId == null)
            {
                return (false, null);
            }
            var user = await unitOfWork.UserRepository().GetById(userId);
            return (user != null, userId);
        }

        private async Task<(bool, Data.Entities.MainEntities.Attribute?)> AttributeExist(int attributeId)
        {
            var attribute = await unitOfWork.AttributeRepository().GetById(attributeId);
            return (attribute != null, attribute);
        }

        private static readonly Dictionary<short, Action<UserAttribute, SetUserAttributeValueModel>> _setters = new()
        {
            [AttributeDtypeConstants.String] = (e, m) => e.ValueGeneric = m.ValueGeneric,
            [AttributeDtypeConstants.Numeric] = (e, m) => e.ValueNumeric = m.ValueNumeric,
            [AttributeDtypeConstants.Boolean] = (e, m) => e.ValueBoolean = m.ValueBoolean,
            [AttributeDtypeConstants.OneOfMany] = (e, m) => e.ValueOptionId = m.ValueOptionId,
            [AttributeDtypeConstants.Image] = (e, m) => e.ValueContentId = m.ValueContentId,
            [AttributeDtypeConstants.Text] = (e, m) => e.ValueGeneric = m.ValueGeneric,
            [AttributeDtypeConstants.Date] = (e, m) => e.ValueDate = m.ValueDate,
        };

        private static bool TryApplyValue(UserAttribute userAttribute, short dtypeCode, SetUserAttributeValueModel model)
        {
            if (dtypeCode == AttributeDtypeConstants.Period)
                return TryApplyPeriod(userAttribute, model);
            if (!_setters.TryGetValue(dtypeCode, out var setter))
                return false;

            setter(userAttribute, model);
            return true;
        }

        private static bool TryApplyPeriod(UserAttribute userAttribute, SetUserAttributeValueModel model)
        {
            if (model.ValuePeriodStart is null || model.ValuePeriodEnd is null) return false;
            userAttribute.ValuePeriodStart = model.ValuePeriodStart;
            userAttribute.ValuePeriodEnd = model.ValuePeriodEnd;
            return true;
        }

        private static UserAttributeDto ToDto(UserAttribute ua)
        {
            Console.WriteLine($"DEBUG: ua.Id={ua.Id} attrId={ua.AttributeId} attrName={ua.Attribute?.Name} attrIsRemovable={ua.Attribute?.IsRemovable} (Attribute null? {ua.Attribute is null})");
            return new()
            {
                Id = ua.Id,
                AttributeId = ua.AttributeId,
                AttributeName = ua.Attribute?.Name ?? string.Empty,
                DtypeCode = ua.Attribute?.DtypeCode ?? 0,
                Version = ua.Version,
                ValueGeneric = ua.ValueGeneric,
                ValueNumeric = ua.ValueNumeric,
                ValueDate = ua.ValueDate,
                ValuePeriodStart = ua.ValuePeriodStart,
                ValuePeriodEnd = ua.ValuePeriodEnd,
                ValueBoolean = ua.ValueBoolean,
                ValueOptionId = ua.ValueOptionId,
                ValueOptionLabel = ua.ValueOption?.Label,
                ValueContentUrl = ua.ValueContent?.SecureUrl,
                ValueContentId = ua.ValueContentId,
                IsFilled = ua.ValueGeneric != null || ua.ValueNumeric != null || ua.ValueDate != null
                   || ua.ValuePeriodStart != null || ua.ValuePeriodEnd != null
                   || ua.ValueBoolean != null || ua.ValueOptionId != null || ua.ValueContentId != null,
                IsRemovable = ua.Attribute?.IsRemovable ?? true,
                
            };
        }
    }
}