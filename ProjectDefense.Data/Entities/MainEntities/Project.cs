using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("projects")]
    public class Project
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; }  = string.Empty;

        
        [Column("period_start")]
        public DateTime? PeriodStart { get; set; }

        [Column("period_end")]
        public DateTime? PeriodEnd { get; set; }

        [Column("description")]
        [Required]
        [MaxLength(2500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column("version")]
        public int Version { get; set; } 

    }
}
