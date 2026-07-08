using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.InfoEntities
{
    [Table("info_rule", Schema = "info")]
    public class Rule : BaseInfoEntity
    {

    }
}