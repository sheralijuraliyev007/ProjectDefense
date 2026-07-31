namespace ProjectDefense.Common.Models.Salesforce
{
    public class SyncToCrmResultModel
    {
        public bool Success { get; set; }
        public string? SalesforceAccountId { get; set; }
        public string? SalesforceContactId { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime SyncedAtUtc { get; set; }
    }
}
