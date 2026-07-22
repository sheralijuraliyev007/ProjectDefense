using ProjectDefense.Data.Entities.BaseEntities;
namespace ProjectDefense.Common.Models.Main.Attribute
{
    public class AttributeUpdateModel : IHasVersion
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required short CategoryCode { get; set; }
        public required int Version { get; set; }
        public List<string>? Options { get; set; }
    }
}