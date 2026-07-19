using ProjectDefense.Common.DTOs.Info;

namespace ProjectDefense.Service.Admin.Interfaces
{
    public interface ILookupService
    {
        Task<List<InfoDto>> AttributeCategoriesSelect();
        Task<List<InfoDto>> AttributeTypesSelect();
        Task<List<InfoDto>> RolesSelect();
        Task<List<InfoDto>> CommonStatusesSelect();
        Task<List<InfoDto>> CvStatusesSelect();
        Task<List<InfoDto>> UserStatusesSelect();
        Task<List<InfoDto>> ContentTypesSelect();
        Task<List<InfoDto>> RuleOperatorsSelect();
    }
}