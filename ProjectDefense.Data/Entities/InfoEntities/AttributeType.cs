using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.InfoEntities
{
    [Table("info_attribute_type", Schema = "info")]
    public class AttributeType : BaseInfoEntity
    {
    }
}
