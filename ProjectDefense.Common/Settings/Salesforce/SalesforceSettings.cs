namespace ProjectDefense.Common.Settings.Salesforce
{
    public class SalesforceSettings
    {
        public string InstanceUrl { get; set; } = null!;
        public string TokenUrl { get; set; } = null!;
        public string ClientId { get; set; } = null!;
        public string ClientSecret { get; set; } = null!;
        public string ApiVersion { get; set; } = "v60.0";
    }
    }
}
