using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.Constants;

namespace ProjectDefense.Api.Controllers.Admin.Base;

[Authorize(Roles = $"{RoleConstants.RecruiterRoleName},{RoleConstants.AdministratorRoleName}")]
[Route("api/admin/[controller]/[action]")]
[ApiController]
public abstract class BaseLibraryController : ControllerBase
{
}