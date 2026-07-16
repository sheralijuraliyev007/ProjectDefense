using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.BaseEntities
{
    public class BaseInfoEntity : BaseEntity
    {
        [Key]
        [Column("id")]
        public short Id { get; set; }

        [Required]
        [Column("code")]
        public short Code { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(50)]
        public string Name { get; set; }  = string.Empty;
        
    }
}
