namespace ProjectDefense.Common.DTOs.Main
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime? PeriodStart { get; set; }
        public DateTime? PeriodEnd { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = [];
        public int Version { get; set; }
    }
}
