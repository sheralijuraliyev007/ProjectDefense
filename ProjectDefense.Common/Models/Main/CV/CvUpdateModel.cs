using ProjectDefense.Data.Entities.BaseEntities;

namespace ProjectDefense.Common.Models.Main.CV
{
    public class CvUpdateModel : IHasVersion
    {
        public required int Version { get; set; } 
    }
}
