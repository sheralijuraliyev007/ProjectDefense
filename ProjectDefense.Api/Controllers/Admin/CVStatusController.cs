using ProjectDefense.Api.Controllers.Admin.Base;
using ProjectDefense.Common.DTOs.Info;
using ProjectDefense.Common.Models.Info;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Service.Admin.Base.Interfaces;

namespace ProjectDefense.Api.Controllers.Admin;

public class CVStatusController(IBaseInfoService<CVStatus> service)
    : BaseInfoController<CVStatus, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, short>(service)
{
}