using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.InfoEntities
{
    [Table("info_position_status", Schema = "info")]
    public class PositionStatus : BaseInfoEntity
    {
    }
}
