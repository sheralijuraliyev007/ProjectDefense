using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.BaseEntities
{
    public class BaseEntity
    {
        
        [Column("created_user_id")]
        public Guid? CreatedUserId { get; set; }

        [Required]
        [Column("created_date_time")]
        public DateTimeOffset CreatedDateTime { get; set; } = DateTimeOffset.UtcNow;

        [Column("modified_user_id")]
        public Guid? ModifiedUserId { get; set; }

        [Column("modified_date_time")]
        public DateTimeOffset? ModifiedDateTime { get; set;
        }
}}