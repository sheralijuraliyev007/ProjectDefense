using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("positions")]
    public class Position: BaseEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("short_description")]
        [MaxLength(500)]
        public string ShortDescription { get; set; } = string.Empty;

        [Required]
        [Column("is_public")]
        public bool IsPublic { get; set; } = true;

        [Required]
        [Column("max_projects")]
        public short MaxProjects { get; set; } 

        [Required]
        [Column("status_code")]
        public short StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual CommonStatus? Status { get; set; }

        [Required]
        [Column("version")]
        public int Version { get; set; } = 1;
    }
}
