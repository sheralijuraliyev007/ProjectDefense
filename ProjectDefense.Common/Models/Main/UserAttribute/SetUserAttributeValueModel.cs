namespace ProjectDefense.Common.Models.Main.UserAttribute
{
    public class SetUserAttributeValueModel
    {
        public required int AttributeId { get; set; }
        public string? ValueGeneric { get; set; }
        public decimal? ValueNumeric { get; set; }
        public DateTime? ValueDate { get; set; }
        public DateTime? ValuePeriodStart { get; set; }
        public DateTime? ValuePeriodEnd { get; set; }
        public bool? ValueBoolean { get; set; }
        public int? ValueOptionId { get; set; }
        public long? ValueContentId { get; set; }
    }
}
