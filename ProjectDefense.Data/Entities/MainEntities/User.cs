using Microsoft.EntityFrameworkCore;
using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Data.Entities.MainEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Linq;

[Table("users")]
[Index(nameof(StatusCode), Name = "ix_users_status")]
public class User : BaseEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = null!;

    [MaxLength(255)]
    [Column("password_hash")]
    public string? PasswordHash { get; set; }   

    [Column("is_verified")]
    public bool IsVerified { get; set; }

    [Column("status_code")]
    public short StatusCode { get; set; }
    [ForeignKey(nameof(StatusCode))]
    public virtual UserStatus? Status { get; set; }

    [Column("version")]
    public int Version { get; set; } = 1;

    [InverseProperty(nameof(UserRole.User))]
    public virtual List<UserRole> UserRoles { get; set; } = new();
}