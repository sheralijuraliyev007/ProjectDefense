namespace ProjectDefense.Common.DTOs.Content
{
    public class UploadSignatureDto
    {
        public required string Signature { get; set; }
        public required long Timestamp { get; set; }
        public required string ApiKey { get; set; }
        public required string CloudName { get; set; }
        public string? Folder { get; set; }
    }
}
