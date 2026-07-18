namespace ProjectDefense.Common.DTOs.Content
{
    public class UploadResultDto
    {
        public required string PublicId { get; set; }
        public required string SecureUrl { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public long Bytes { get; set; }
    }
}
