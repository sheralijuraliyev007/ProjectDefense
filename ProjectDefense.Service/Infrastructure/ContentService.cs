using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Content;
using ProjectDefense.Common.Models.Insfrastructure;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Infrastructure.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Infrastructure
{
    public class ContentService(ICloudinaryService cloudinaryService, IUnitOfWork unitOfWork, IUserHelper userHelper) : StatusGenericHandler, IContentService
    {
        public UploadSignatureDto GetUploadSignature() => cloudinaryService.GenerateUploadSignature();

        public async Task<(IStatusGeneric Status, ContentDto? Content)> ConfirmUploadAsync(ConfirmUploadModel model)
        {
            var userid = userHelper.GetUserId();
            if (userid == null) { AddError("User is not logged"); return (this, null); }
            var typeCode = ValidateMimeType(model.MimeType);
            if (typeCode == null) { AddError("Unsupported file type."); return (this, null); }

            var verified = await VerifyWithCloudinary(model.PublicId);
            if (verified == null) { AddError("Upload could not be verified."); return (this, null); }

            var entity = await SaveContent(verified, model.OriginalFilename, typeCode.Value);
            entity.CreatedUserId = userid;
            return (this, ToDto(entity));
        }

        private static short? ValidateMimeType(string mimeType) =>
            ContentTypeConstants.CodeByMimeType.TryGetValue(mimeType, out var code) ? code : null;

        private async Task<UploadResultDto?> VerifyWithCloudinary(string publicId)
        {
            try
            {
                return await cloudinaryService.VerifyUploadAsync(publicId);
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        private async Task<Content> SaveContent(UploadResultDto uploaded, string originalFilename, short typeCode)
        {
            var entity = new Content
            {
                PublicId = uploaded.PublicId,
                SecureUrl = uploaded.SecureUrl,
                OriginalFilename = originalFilename,
                ContentTypeCode = typeCode,
                Width = uploaded.Width,
                Height = uploaded.Height,
                SizeBytes = uploaded.Bytes,
                StatusCode = CommonStatusConstants.ActiveStatusCode,
            };

            await unitOfWork.ContentRepository().Add(entity);
            await unitOfWork.ContentRepository().SaveChanges();
            return entity;
        }

        private static ContentDto ToDto(Content c) => new()
        {
            Id = c.Id,
            SecureUrl = c.SecureUrl,
            Width = c.Width,
            Height = c.Height,
            SizeBytes = c.SizeBytes,
        };

        
    }
}