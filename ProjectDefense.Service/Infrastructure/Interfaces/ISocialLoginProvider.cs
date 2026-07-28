using ProjectDefense.Common.DTOs.Auth;
namespace ProjectDefense.Service.Infrastructure.Interfaces
{
    public interface ISocialLoginProvider
    {
        string ProviderName { get; }
        Task<SocialUserInfoDto> ValidateTokenAsync(string idToken);
    }
}
