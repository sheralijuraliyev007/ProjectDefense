using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("position_rules")]
    public class PositionRule : BaseEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("position_id")]
        public int PositionId { get; set; }

        [ForeignKey(nameof(PositionId))]
        public virtual Position? Position { get; set; }

        [Required]
        [Column("attribute_id")]
        public int AttributeId { get; set; }

        [ForeignKey(nameof(AttributeId))]
        public virtual Attribute? Attribute { get; set; }

        [Required]
        [Column("rule_code")]
        public short RuleCode { get; set; }

        [ForeignKey(nameof(RuleCode))]
        public virtual Rule? RuleOperator { get; set; }

        [Column("value_numeric")]
        public decimal? ValueNumeric { get; set; }

        [Column("value_date")]
        public DateTime? ValueDate { get; set; }

        [Column("value_boolean")]
        public bool? ValueBoolean { get; set; }

        [Column("value_option_id")]
        public int? ValueOptionId { get; set; }

        [ForeignKey(nameof(ValueOptionId))]
        public virtual AttributeOption? ValueOption { get; set; }
    }
}