using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.CV;
using ProjectDefense.Service.Main.Base.Interfaces;
using StatusGeneric;


namespace ProjectDefense.Service.Main.Interfaces
{
    public interface ICvService : IMainServiceBase<CVFilterOptions, CvDto, CvCreateModel, CvUpdateModel>
    {
        Task<IStatusGeneric> PublishAsync(long cvId);

        Task<List<UserAttributeDto>> GetCvAttributesAsync(long cvId);
    }
}
