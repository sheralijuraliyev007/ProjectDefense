using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.Models.Main.UserAttribute;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class UserAttributeService(IUnitOfWork unitOfWork, IUserHelper userHelper) : StatusGenericHandler,IUserAttributeService
    {

        public async Task<IStatusGeneric> AddAttributeAsync(int attributeId, Guid? targetUserId = null)
        {
            var (exists, userId) = await UserExist();
            if(!exists)
            {
                AddError("You are not logged in");
                return this;
            }

            var (attributeExist, attribute) = await AttributeExist(attributeId);
            if(!attributeExist)
            {
                AddError("Attribute doesn;t exist");
                return this;
            }


            var ownerId = targetUserId ?? userId!.Value;
            if (ownerId != userId && !await IsAdministrator(userId!.Value))
            {
                AddError("You can't add to here");
                return this;
            }


            if (await unitOfWork.UserAttributeRepository().GetAll().AnyAsync(ua => ua.UserId == userId && ua.AttributeId == attributeId))
            {
                AddError("There is already this attibute in your profile");
                return this;
            }

            await unitOfWork.UserAttributeRepository().Add(new UserAttribute
            {
                UserId = userId!.Value,
                AttributeId = attributeId,
                CreatedUserId = userId

            });
            await unitOfWork.UserAttributeRepository().SaveChanges();
            return this;

        }

        public async Task<List<UserAttributeDto>> GetMyAttributesAsync()
        {
            var userId = userHelper.GetUserId();
            if(userId == null)
            {
                AddError("You are not logged in");
                return [];
            }
            var rows = await unitOfWork.UserAttributeRepository().GetAll(ua => ua.Attribute!, ua => ua.ValueOption!)
                .Where(ua => ua.UserId == userId).ToListAsync();

            return rows.MapToDtos<UserAttribute, UserAttributeDto>();
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

        public async Task<IStatusGeneric> SetValueAsync(SetUserAttributeValueModel model, Guid? targetUserId = null)
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
                .FirstOrDefaultAsync(ua => ua.UserId == ownerId && ua.AttributeId == model.AttributeId);
            if (entry == null) { AddError("Add this attribute to your profile first."); return this; }

            var attribute = await unitOfWork.AttributeRepository().GetById(model.AttributeId);
            if (attribute == null) { AddError("Attribute not found."); return this; }

            if (!TryApplyValue(entry, attribute.DtypeCode, model))
            {
                AddError("The value doesn't match this attribute's type.");
                return this;
            }

            entry.ModifiedUserId = callerId;
            entry.Version++;
            await unitOfWork.UserAttributeRepository().Update(entry);
            await unitOfWork.SaveChanges();
            return this;
        }

        private  Task<bool> IsAdministrator(Guid userId) => unitOfWork.UserRoleRepository().GetAll().AnyAsync(ur => ur.UserId == userId && ur.RoleCode == RoleConstants.Administrator);


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
    }
}
