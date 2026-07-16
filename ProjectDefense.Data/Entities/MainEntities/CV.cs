using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("cv")]
    public class CV : BaseEntity, IHasVersion
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("position_id")]
        public int PositionId { get; set; }

        [ForeignKey(nameof(PositionId))]
        public virtual Position? Position { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [Required]
        [Column("status_code")]
        public short StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual CVStatus? Status { get; set; }

        [Required]
        [Column("version")]
        public int Version { get; set; } = 1;
    
    }
}
