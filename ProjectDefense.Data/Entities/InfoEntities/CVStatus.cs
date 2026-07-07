using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.InfoEntities
{
    [Table("info_cv_status", Schema = "info")]
    public class CVStatus : BaseInfoEntity
    {
    }
}
