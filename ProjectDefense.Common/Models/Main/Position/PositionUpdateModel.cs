using ProjectDefense.Data.Entities.BaseEntities;

namespace ProjectDefense.Common.Models.Main.Position
{
    public class PositionUpdateModel : IHasVersion
    {
        public required string Title { get; set; }
        public required string ShortDescription { get; set; }
        public bool IsPublic { get; set; }
        public short MaxProjects { get; set; }
        public required int Version { get; set; }
    }
}
