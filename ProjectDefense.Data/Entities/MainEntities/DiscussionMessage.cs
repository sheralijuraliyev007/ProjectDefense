using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("discussion_messages")]
    public class DiscussionMessage : BaseEntity
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("response_to_id")]
        public long? ResponseToId { get; set; }

        [ForeignKey(nameof(ResponseToId))]
        public virtual DiscussionMessage? ResponseTo { get; set; }

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
        [Column("message")]
        public string Message { get; set; } = string.Empty;
    }
}
