

using StatusGeneric;

namespace ProjectDefense.Service.Auth.Interfaces
{
    public interface IAuthService : IStatusGeneric
    {

        public Task<string> VerifyEmail(Guid verificationToken);

        Task<UserDto?> RegisterAsync(RegisterModel registerModel);
        Task<TokenDto?> LoginAsync(LoginModel loginModel);
    }
}
