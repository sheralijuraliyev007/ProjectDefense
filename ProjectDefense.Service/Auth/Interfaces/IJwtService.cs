using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Data.Entities.MainEntities;

namespace ProjectDefense.Service.Auth.Interfaces
{
    public interface IJwtService
    {
        TokenDto GenerateToken(User user);
    }
}
