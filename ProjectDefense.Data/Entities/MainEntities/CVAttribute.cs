using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("cv_attributes")]
    public class CVAttribute : BaseEntity
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("cv_id")]
        [Required]
        public long CVId { get; set; }

        [ForeignKey(nameof(CVId))]
        public virtual CV? CV { get; set; }


        [Column("attribute_id")]
        [Required]
        public int AttributeId { get; set; }

        [ForeignKey(nameof(AttributeId))]
        public virtual Attribute? Attribute { get; set; }

        [Column("value_generic")]

        public string? ValueGeneric { get; set; }

        [Column("value_numeric")]
        public decimal? ValueNumeric { get; set; }

        [Column("value_date")]
        public DateTime? ValueDate { get; set; }


        [Column("value_period_start")]
        public DateTime? ValuePeriodStart { get; set; }

        [Column("value_period_end")]
        public DateTime? ValuePeriodEnd { get; set; }

        [Column("value_boolean")]
        public bool? ValueBoolean { get; set; }

        [Column("value_option_id")]
        public int? ValueOptionId { get; set; }

        [ForeignKey(nameof(ValueOptionId))]
        public virtual AttributeOption? ValueOption { get; set; }

        [Column("value_content_id")]
        public long? ValueContentId { get; set; }

        [ForeignKey(nameof(ValueContentId))]
        public virtual Content? ValueContent { get; set; }

    }
}
