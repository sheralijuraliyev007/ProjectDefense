namespace ProjectDefense.Service.Infrastructure.Interfaces
{
    public interface ICloudinaryService
    {
        UploadSignatureDto GenerateUploadSignature();
        Task<UploadResultDto> VerifyUploadAsync(string publicId);
        Task<bool> DeleteImageAsync(string publicId);
    }

}
