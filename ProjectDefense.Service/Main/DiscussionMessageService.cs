using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ProjectDefense.Api.Hubs;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.DiscussionMessage;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class DiscussionMessageService(
    IUnitOfWork unitOfWork,
    IUserHelper userHelper,
    IHubContext<DiscussionHub> hubContext)
    : StatusGenericHandler, IDiscussionMessageService
    {
        public async Task<List<DiscussionMessageDto>> GetByPositionAsync(int positionId)
        {
            var rows = await unitOfWork.DiscussionMessageRepository()
                .GetAll(m => m.User!)
                .Where(m => m.PositionId == positionId)
                .OrderBy(m => m.CreatedDateTime)
                .ToListAsync();

            return rows.Select(ToDto).ToList();
        }

        public async Task<IStatusGeneric> PostAsync(CreateDiscussionMessageModel model)
        {
            var userId = userHelper.GetUserId();
            if (userId == null) { AddError("You need to be logged in to post."); return this; }

            if (!await PositionExists(model.PositionId)) { AddError("Position not found."); return this; }

            if (model.ResponseToId.HasValue && !await MessageExists(model.ResponseToId.Value))
            {
                AddError("The message you're replying to no longer exists.");
                return this;
            }

            var message = await SaveMessage(model, userId.Value);
            await BroadcastMessage(message);

            return this;
        }

        private async Task<DiscussionMessage> SaveMessage(CreateDiscussionMessageModel model, Guid userId)
        {
            var message = new DiscussionMessage
            {
                PositionId = model.PositionId,
                ResponseToId = model.ResponseToId,
                UserId = userId,
                Message = model.Message,
                CreatedUserId = userId
            };

            await unitOfWork.DiscussionMessageRepository().Add(message);
            await unitOfWork.SaveChanges();

            // reload with User included so ToDto has the author info, without a second manual query
            message.User = await unitOfWork.UserRepository().GetById(userId);
            return message;
        }

        private async Task BroadcastMessage(DiscussionMessage message)
        {
            var group = DiscussionHub.GroupName(message.PositionId);
            var dto = ToDto(message);
            await hubContext.Clients.Group(group).SendAsync("MessageReceived", dto);
        }

        private Task<bool> PositionExists(int positionId) =>
            unitOfWork.PositionRepository().GetAll().AnyAsync(p => p.Id == positionId);

        private Task<bool> MessageExists(long messageId) =>
            unitOfWork.DiscussionMessageRepository().GetAll().AnyAsync(m => m.Id == messageId);

        private static DiscussionMessageDto ToDto(DiscussionMessage m) => new()
        {
            Id = m.Id,
            ResponseToId = m.ResponseToId,
            PositionId = m.PositionId,
            UserId = m.UserId,
            AuthorName = m.User?.Email ?? "Unknown",
            Message = m.Message,
            CreatedDateTime = m.CreatedDateTime
        };
    }
}