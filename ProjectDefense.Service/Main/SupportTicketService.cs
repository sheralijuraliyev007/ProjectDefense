using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Dropbox;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Infrastructure.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using StatusGeneric;
using System.Text.Json;
using System.Text;

namespace ProjectDefense.Service.Main
{
    public class SupportTicketService(IUserHelper userHelper,IUnitOfWork unitOfWork, IDropBoxService dropBoxService) : StatusGenericHandler, ISupportTicketService
    {
        public async Task CretaeSupportTicket(CreateSupportTicketModel createSupportTicketModel)
        {
            var userId = userHelper.GetUserId();
            if (userId == null) { AddError("User is not authenticated."); return; }
            var dto = await GetDto(userId.Value, createSupportTicketModel);

            var options = new JsonSerializerOptions
            {
                Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
            };
            var jsonString = JsonSerializer.Serialize(dto, options);



            await dropBoxService.UploadJsonAsync($"{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}.json", jsonString);


        }

        private async Task<SupportTicketDto> GetDto(Guid userId, CreateSupportTicketModel model)
        {
            var userNameAndRoles = await GetUserNameAndRoles(userId);
            var positionName = await GetPositionName(model.PositionId);
            var adminEmails = await GetAdminEmails();
            return new SupportTicketDto
            {
                ReportedBy = userNameAndRoles,
                Link = model.PageLink,
                Summary = model.Summary,
                Pirority = (PirorityEnum)model.Priority,
                Position = positionName,
                AdminEmails = adminEmails,
            };
        }


        private async Task<string> GetUserNameAndRoles(Guid userId)
        {
            var attributeIds = await unitOfWork.AttributeRepository().GetAll().Where(a => a.Name == AttributeConstants.FirstName).Select(a =>a.Id).ToListAsync();
            var userFirstname = await unitOfWork.UserAttributeRepository().GetAll(ua => ua.Attribute)
                    .Where(ua => ua.UserId == userId && attributeIds.Contains(ua.AttributeId))
                    .Select(ua => ua.ValueGeneric)
                    .FirstOrDefaultAsync();

            var userRoles = await unitOfWork.UserRoleRepository().GetAll(ur => ur.Role).Where(x => x.UserId == userId).Select(ur=> ur.Role).ToListAsync();
            return $"{userFirstname}, roles : {string.Join(", ", userRoles.Select(r => r.Name))}";

        }

        private async Task<string?> GetPositionName(int? positionId) =>
             (await unitOfWork.PositionRepository().GetAll().Where(p => p.Id == positionId).FirstOrDefaultAsync())?.Title;

        private async Task<List<string>> GetAdminEmails()
        {
            var users = await unitOfWork.UserRoleRepository().GetAll(u=>u.User).Where(ur => ur.RoleCode == RoleConstants.Administrator).Select(u=>u.User).ToListAsync();

            return users.Select(u=> u.Email).ToList();
        }
    }

}
