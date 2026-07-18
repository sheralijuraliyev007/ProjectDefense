using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using ProjectDefense.Common.DTOs.Content;
using ProjectDefense.Common.Settings.Cloudinary;
using ProjectDefense.Service.Infrastructure.Interfaces;

namespace ProjectDefense.Service.Infrastructure
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly CloudinarySettings _settings;

        public CloudinaryService(IOptions<CloudinarySettings> options)
        {
            _settings = options.Value;
            var account = new Account(_settings.CloudName, _settings.ApiKey, _settings.ApiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public UploadSignatureDto GenerateUploadSignature()
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var paramsToSign = BuildSignatureParams(timestamp);
            var signature = _cloudinary.Api.SignParameters(paramsToSign);

            return new UploadSignatureDto
            {
                Signature = signature,
                Timestamp = timestamp,
                ApiKey = _settings.ApiKey,
                CloudName = _settings.CloudName,
                Folder = _settings.DefaultFolder
            };
        }

        public async Task<UploadResultDto> VerifyUploadAsync(string publicId)
        {
            var resource = await _cloudinary.GetResourceAsync(publicId);

            if (resource is null || resource.StatusCode != System.Net.HttpStatusCode.OK)
                throw new InvalidOperationException("Upload could not be verified with Cloudinary.");

            return new UploadResultDto
            {
                PublicId = resource.PublicId,
                SecureUrl = resource.SecureUrl,
                Width = resource.Width,
                Height = resource.Height,
                Bytes = resource.Length
            };
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            var result = await _cloudinary.DestroyAsync(new DeletionParams(publicId));
            return result.Result == "ok";
        }

        private SortedDictionary<string, object> BuildSignatureParams(long timestamp)
        {
            var parameters = new SortedDictionary<string, object> { { "timestamp", timestamp } };

            if (!string.IsNullOrEmpty(_settings.DefaultFolder))
                parameters.Add("folder", _settings.DefaultFolder);

            return parameters;
        }
    }
}