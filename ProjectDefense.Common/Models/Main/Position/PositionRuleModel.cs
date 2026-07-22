namespace ProjectDefense.Common.Models.Main.Position
{
    public class PositionRuleModel
    {
        public required int AttributeId { get; set; }
        public required short RuleCode { get; set; }
        public decimal? ValueNumeric { get; set; }
        public DateTime? ValueDate { get; set; }
        public bool? ValueBoolean { get; set; }
        public int? ValueOptionId { get; set; }
    }

}
