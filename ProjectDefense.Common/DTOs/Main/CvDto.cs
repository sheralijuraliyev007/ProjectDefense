namespace ProjectDefense.Common.DTOs.Main
{
    public class CvDto
    {
        public long Id { get; set; }
        public int PositionId { get; set; }
        public string PositionTitle { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public short StatusCode { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public int Version { get; set; }
        public DateTimeOffset CreatedDateTime { get; set; }
    }
}
