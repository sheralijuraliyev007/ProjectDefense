using Microsoft.AspNetCore.Mvc;

namespace ProjectDefense.Api.Controllers.Base
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected Guid? CurrentUserId =>
            Guid.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id)
                ? id : null;
    }
}