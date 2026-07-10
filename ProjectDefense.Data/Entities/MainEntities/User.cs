using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("users")]
    public class User : BaseEntity
    {
        [Key]
        [Column("users")]
        public Guid Id { get; set; }

        [Column("email")]
        [MaxLength(255)]
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("is_verified")]
        public bool IsVerified { get; set; }

        [Required]
        [Column("status_code")]
        public short StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual UserStatus? Status { get; set; }

        [Required]
        [Column("version")]
        public int Version { get; set; }

        [Column("refresh_token_expiry_time")]
        [Required]
        public DateTimeOffset RefreshTokenExpireTime { get; set; }
    }
}
