using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    public class User : BaseEntity
    {
        [Key]
        [Column("users")]
        public Guid Id { get; set; }

        [Column("email")]
        [MaxLength(255)]
        [Required]
        public string Email { get; set; } = string.Empty;

    //    id uuid primary key,
    //email                varchar(255) not null unique,
    //is_verified boolean not null default false,
    //status_code smallint not null references info.info_user_status(code) default 1,
    //version int not null default 1,
    }
}
