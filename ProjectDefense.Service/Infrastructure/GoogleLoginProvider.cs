using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.Settings.Google;
using ProjectDefense.Service.Infrastructure.Interfaces;


namespace ProjectDefense.Service.Infrastructure
{
    public class GoogleLoginProvider(IOptions<GoogleAuthSettings> options) : ISocialLoginProvider
    {
        private readonly GoogleAuthSettings _settings = options.Value;
        public string ProviderName => "Google";

        public async Task<SocialUserInfoDto> ValidateTokenAsync(string idToken)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _settings.ClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            return new SocialUserInfoDto
            {
                Email = payload.Email,
                ExternalId = payload.Subject,
                EmailVerified = payload.EmailVerified
            };
        }
    }
}
