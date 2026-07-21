namespace ProjectDefense.Common.Models.Shared
{
    public class ApiResponse<T>
    {
        public required T Data { get; set; }
        public string? Message { get; set; }
    }
}
