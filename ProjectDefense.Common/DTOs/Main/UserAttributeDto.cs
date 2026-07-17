namespace ProjectDefense.Common.DTOs.Main
{
    public class UserAttributeDto
    {
        public int Id { get; set; }
        public int AttributeId { get; set; }
        public string AttributeName { get; set; } = string.Empty;
        public short DtypeCode { get; set; }
        public string? ValueGeneric { get; set; }
        public decimal? ValueNumeric { get; set; }
        public DateTime? ValueDate { get; set; }
        public DateTime? ValuePeriodStart { get; set; }
        public DateTime? ValuePeriodEnd { get; set; }
        public bool? ValueBoolean { get; set; }
        public int? ValueOptionId { get; set; }
        public string? ValueOptionLabel { get; set; }
        public long? ValueContentId { get; set; }
        public bool IsFilled { get; set; }
    }
}
