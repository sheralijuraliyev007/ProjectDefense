using ProjectDefense.Common.Models.Dropbox;
using StatusGeneric;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface ISupportTicketService : IStatusGeneric
    {
        Task CretaeSupportTicket(CreateSupportTicketModel createSupportTicketModel);
    }
}
