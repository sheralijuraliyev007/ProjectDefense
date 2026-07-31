namespace ProjectDefense.Common.Models.Salesforce
{
    public class SyncToCrmRequestModel
    {
        public string? CompanyName { get; set; }
        public string? JobTitle { get; set; }
        public string? Phone { get; set; }
        public string? Industry { get; set; }
        public bool WantsNewsletter { get; set; }
        public string? Notes { get; set; }
    }
}
