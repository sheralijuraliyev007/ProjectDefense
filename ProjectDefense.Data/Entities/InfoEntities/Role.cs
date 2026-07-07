using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.InfoEntities
{
    [Table("info_role", Schema = "info")]
    public class Role : BaseInfoEntity
    {
    }
}
