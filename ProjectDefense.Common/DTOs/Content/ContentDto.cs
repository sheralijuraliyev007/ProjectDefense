namespace ProjectDefense.Common.DTOs.Content
{
    public class ContentDto
    {
        public long Id { get; set; }
        public string SecureUrl { get; set; } = string.Empty;
        public int Width { get; set; }
        public int Height { get; set; }
        public long SizeBytes { get; set; }
    }

}
