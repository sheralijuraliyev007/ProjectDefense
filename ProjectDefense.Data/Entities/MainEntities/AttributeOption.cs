using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("attribute_options")]
    public class AttributeOption : BaseEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("attribute_id")]
        public int AttributeId { get; set; }

        [ForeignKey(nameof(AttributeId))]
        public virtual Attribute? Attribute { get; set; }


        [Required]
        [Column("label")]
        [MaxLength(100)]
        public string Label { get; set; } = string.Empty;

        [Required]
        [Column("sort_order")]
        public short SortOrder { get; set; } = 0;
    }
}
