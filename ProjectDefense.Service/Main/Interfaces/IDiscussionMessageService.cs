using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.DiscussionMessage;
using StatusGeneric;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IDiscussionMessageService
    {
        Task<List<DiscussionMessageDto>> GetByPositionAsync(int positionId);
        Task<IStatusGeneric> PostAsync(CreateDiscussionMessageModel model);
    }
}
