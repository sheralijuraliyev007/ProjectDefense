using Microsoft.AspNetCore.Http;

using ProjectDefense.Service.Common.Interfaces;
using System.Security.Claims;
namespace ProjectDefense.Service.Common
{
    public class UserHelper(IHttpContextAccessor contextAccessor) : IUserHelper
    {
        private ClaimsPrincipal? User = contextAccessor.HttpContext.User;

        public Guid? GetUserId() => Guid.TryParse(User?.FindFirst
            (ClaimTypes.NameIdentifier)?.Value, out var userId)
            ? userId: null;


        public List<short> GetUserRoleCodes() =>
            User?.FindAll(ClaimTypes.Role).Select(r => short.Parse(r.Value)).ToList() ?? new List<short>();

        public bool IsInRole(short code) =>
            User?.FindAll("role_code").Any(r => r.Value == code.ToString()) ?? false;
    }
}
