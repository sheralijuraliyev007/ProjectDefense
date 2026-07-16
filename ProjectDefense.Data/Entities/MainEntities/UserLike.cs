using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("user_likes")]
    public class UserLike : BaseEntity
    {
        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [Column("cv_id")]
        [Required]
        public long CVId { get; set; }

        [ForeignKey(nameof(CVId))]
        public virtual CV? CV { get; set; }
    }
}
