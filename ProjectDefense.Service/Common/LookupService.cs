using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.DTOs.Info;
using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Admin.Interfaces;
using ProjectDefense.Service.Common.Interfaces;

namespace ProjectDefense.Service.Common
{
    public class LookupService(IUnitOfWork unitOfWork) : ILookupService
    {
        public Task<List<InfoDto>> AttributeCategoriesSelect() => GetAll(unitOfWork.AttributeCategoryRepository());
        public Task<List<InfoDto>> AttributeTypesSelect() => GetAll(unitOfWork.AttributeTypeRepository());
        public Task<List<InfoDto>> RolesSelect() => GetAll(unitOfWork.RoleRepository());
        public Task<List<InfoDto>> CommonStatusesSelect() => GetAll(unitOfWork.CommonStatusRepository());
        public Task<List<InfoDto>> CvStatusesSelect() => GetAll(unitOfWork.CVStatusRepository());
        public Task<List<InfoDto>> UserStatusesSelect() => GetAll(unitOfWork.UserStatusRepository());
        public Task<List<InfoDto>> ContentTypesSelect() => GetAll(unitOfWork.ContentTypeRepository());
        public Task<List<InfoDto>> RuleOperatorsSelect() => GetAll(unitOfWork.RuleRepository());

        private static async Task<List<InfoDto>> GetAll<TEntity>(IBaseRepository<TEntity> repository)
            where TEntity : BaseInfoEntity
        {
            var rows = await repository.GetAll().OrderBy(e => e.Code).ToListAsync();
            return rows.Select(ToDto).ToList();
        }

        private static InfoDto ToDto(BaseInfoEntity e) => new()
        {
            Id = e.Id,
            Code = e.Code,
            Name = e.Name
        };
    }
}