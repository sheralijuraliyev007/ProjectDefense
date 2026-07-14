using ProjectDefense.Common.DTOs.Auth;

namespace ProjectDefense.Service.Auth.Interfaces
{
    public interface IJwtService
    {
        TokenDto GenerateToken(User user);

    }
}
