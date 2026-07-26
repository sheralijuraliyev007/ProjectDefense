using ProjectDefense.Common.Constants;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;


namespace ProjectDefense.Api.Middlewares
{
    public class BlockedUserMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context, IUnitOfWork unitOfWork, 
             IUserHelper userHelper)
        {
            if(context.User.Identity?.IsAuthenticated == true)
            {
                var userId = userHelper.GetUserId();
                if (userId != null) {
                    var user = await unitOfWork.UserRepository().GetById(userId);
                    if (user != null && user.StatusCode == UserStatusConstants.BlockedStatusCode) {
                        context.Response.StatusCode = UserStatusConstants.BlockedStatusCode;
                        await context.Response.WriteAsJsonAsync(new { message = "Your account has been blocked by admin" });

                        return;
                    }
                }
            }
            await next(context);
        }
    }
}
