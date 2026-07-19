using ProjectDefense.Api.Controllers.Admin.Base;
using ProjectDefense.Common.DTOs.Info;
using ProjectDefense.Common.Models.Info;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Service.Admin.Base.Interfaces;

namespace ProjectDefense.Api.Controllers.Admin;

public class RuleOperatorController(IBaseInfoService<Rule> service)
    : BaseInfoController<Rule, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, short>(service)
{
}