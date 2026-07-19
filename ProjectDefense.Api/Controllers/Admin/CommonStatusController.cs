using ProjectDefense.Api.Controllers.Admin.Base;
using ProjectDefense.Common.DTOs.Info;
using ProjectDefense.Common.Models.Info;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Service.Admin.Base.Interfaces;

namespace ProjectDefense.Api.Controllers.Admin;

public class CommonStatusController(IBaseInfoService<CommonStatus> service)
    : BaseInfoController<CommonStatus, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, short>(service)
{
}