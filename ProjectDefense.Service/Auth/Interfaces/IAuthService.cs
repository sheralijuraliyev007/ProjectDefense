using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.Models.Auth;
using StatusGeneric;

namespace ProjectDefense.Service.Auth.Interfaces
{
    public interface IAuthService : IStatusGeneric
    {
        Task<UserDto?> RegisterAsync(RegisterModel registerModel);
        Task<TokenDto?> LoginAsync(LoginModel loginModel);
        Task<TokenDto?> SocialLoginAsync(SocialLoginModel model);
        Task<string> VerifyEmail(Guid verificationToken);
    }
}