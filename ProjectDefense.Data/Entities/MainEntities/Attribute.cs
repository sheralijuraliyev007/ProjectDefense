using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("attributes")]
    public class Attribute : BaseEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;


        [Required]
        [Column("description")]
        [MaxLength(150)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column("dtype_code")]
        public short DtypeCode { get; set; }

        [ForeignKey(nameof(DtypeCode))]
        public virtual AttributeType? DType { get; set; }

        [Required]
        [Column("category_code")]
        public short CategoryCode { get; set; }

        [ForeignKey(nameof(CategoryCode))]
        public virtual AttributeCategory? CategoryType { get; set; }

        [Required]
        [Column("is_removable")]
        public bool IsRemovable { get; set; } = true;

        [Required]
        [Column("version")]
        public int Version { get; set; } = 1;

    }
}
