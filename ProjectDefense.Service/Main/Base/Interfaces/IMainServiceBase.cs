using ProjectDefense.Common.Models.Shared;
using StatusGeneric;

namespace ProjectDefense.Service.Main.Base.Interfaces
{
    public interface IMainServiceBase<TFilterOptions, TDto, in TCreateModel, in TUpdateModel>
        : IStatusGeneric
        where TDto : class
    {
        Task<PaginationModel<TDto>> GetAllAsync(TFilterOptions filterOptions);
        Task<TDto?> GetByIdAsync<TId>(TId id);
        Task<TId?> AddAsync<TId>(TCreateModel createModel);
        Task<IStatusGeneric> UpdateAsync<TId>(TId id, TUpdateModel updateModel);
        Task<IStatusGeneric> DeleteAsync<TId>(TId id);
    }
}
