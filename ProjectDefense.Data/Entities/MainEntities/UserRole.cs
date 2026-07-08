using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("user_roles")]
    public class UserRole : BaseEntity
    {
        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; } 

        [Required]
        [Column("role_code")]
        public short RoleCode { get; set; }

        [ForeignKey(nameof(RoleCode))]
        public virtual Role? Role { get; set; }

    }
}
