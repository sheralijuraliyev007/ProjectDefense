using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.InfoEntities
{
    [Table("info_user_status", Schema = "info")]
    public class UserStatus : BaseInfoEntity
    {
    }
}
