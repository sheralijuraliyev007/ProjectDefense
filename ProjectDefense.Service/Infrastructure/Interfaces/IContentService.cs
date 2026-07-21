using ProjectDefense.Common.DTOs.Content;
using ProjectDefense.Common.Models.Insfrastructure;
using StatusGeneric;

namespace ProjectDefense.Service.Infrastructure.Interfaces
{
    public interface IContentService : IStatusGeneric
    {
        UploadSignatureDto GetUploadSignature();
        Task<(IStatusGeneric Status, ContentDto? Content)> ConfirmUploadAsync(ConfirmUploadModel model);
    }

}
