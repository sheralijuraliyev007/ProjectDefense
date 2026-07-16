namespace ProjectDefense.Common.DTOs.Main
{
    public class PositionDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public short MaxProjects { get; set; }
        public short StatusCode { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public int Version { get; set; }
        public int CvCount { get; set; }
    }
}
