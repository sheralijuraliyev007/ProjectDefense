namespace ProjectDefense.Common.Models.Main.Position
{
    public class PositionCreateModel
    {
        public required string Title { get; set; }
        public required string ShortDescription { get; set; }
        public bool IsPublic { get; set; } = true;
        public short MaxProjects { get; set; } = 5;
        public List<int> AttributeIds { get; set; } = [];
        public List<string> ProjectTagLabels { get; set; } = [];
    }
}
