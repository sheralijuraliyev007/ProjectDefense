using Microsoft.EntityFrameworkCore;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using System.Security.Claims;

namespace ProjectDefense.Api.Middlewares
{
    public class StaleRoleMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context, IUnitOfWork unitOfWork, IUserHelper userHelper)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = userHelper.GetUserId();
                if (userId != null)
                {
                    var tokenRoles = context.User.FindAll(ClaimTypes.Role)
                        .Select(c => c.Value)
                        .ToHashSet();

                    var currentRoles = (await unitOfWork.UserRoleRepository().GetAll()
                        .Where(ur => ur.UserId == userId)
                        .Select(ur => ur.Role!.Name)
                        .ToListAsync())
                        .ToHashSet();

                    if (!tokenRoles.SetEquals(currentRoles))
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new { message = "Your permissions have changed. Please sign in again." });
                        return;
                    }
                }
            }

            await next(context);
        }
    }

}
