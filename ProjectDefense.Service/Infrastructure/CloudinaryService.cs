using ProjectDefense.Service.Infrastructure.Interfaces;

namespace ProjectDefense.Service.Infrastructure
{
    public class CloudinaryService : ICloudinaryService
    {
        public Task<bool> DeleteImageAsync(string publicId)
        {
            throw new NotImplementedException();
        }

        public UploadSignatureDto GenerateUploadSignature()
        {
            throw new NotImplementedException();
        }

        public Task<UploadResultDto> VerifyUploadAsync(string publicId)
        {
            throw new NotImplementedException();
        }
    }
}
