using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("position_attributes")]
    public class PositionAttribute : BaseEntity
    {
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
    }
}
