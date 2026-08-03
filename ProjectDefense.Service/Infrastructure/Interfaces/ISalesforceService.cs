using ProjectDefense.Common.Models.Salesforce;

namespace ProjectDefense.Service.Infrastructure.Interfaces
{
    public interface ISalesforceService
    {
        Task<CrmSyncStatus> SyncCurrentUserToCrmAsync(
            SyncToCrmRequestModel form,
            CancellationToken cancellationToken = default);
    }
}