namespace ProjectDefense.Common.DTOs.Main
{
    public class PositionRuleDto
    {
        public int Id { get; set; }
        public int AttributeId { get; set; }
        public string AttributeName { get; set; } = string.Empty;
        public short RuleCode { get; set; }
        public string RuleName { get; set; } = string.Empty;
        public decimal? ValueNumeric { get; set; }
        public DateTime? ValueDate { get; set; }
        public bool? ValueBoolean { get; set; }
        public int? ValueOptionId { get; set; }
        public string? ValueOptionLabel { get; set; }
    }

}
