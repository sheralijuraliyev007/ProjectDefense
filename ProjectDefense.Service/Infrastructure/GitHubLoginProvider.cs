using Microsoft.Extensions.Options;
using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.Settings.Facebook;
using ProjectDefense.Service.Infrastructure.Interfaces;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace ProjectDefense.Service.Infrastructure
{
    public class GitHubLoginProvider(
        IHttpClientFactory httpClientFactory,
        IOptions<GitHubAuthSettings> options) : ISocialLoginProvider
    {
        private readonly GitHubAuthSettings _settings = options.Value;
        public string ProviderName => "GitHub";

        // NOTE: for GitHub, "idToken" is actually the OAuth "code" from the redirect callback
        public async Task<SocialUserInfoDto> ValidateTokenAsync(string idToken)
        {
            var client = httpClientFactory.CreateClient();
            var accessToken = await ExchangeCodeForToken(client, idToken);
            var profile = await FetchProfile(client, accessToken);
            var email = await FetchPrimaryEmail(client, accessToken);

            return new SocialUserInfoDto
            {
                Email = email ?? throw new InvalidOperationException("GitHub account has no accessible email."),
                ExternalId = profile.Id.ToString(),
                EmailVerified = true, // only verified emails are returned by the emails endpoint
                FirstName = SplitName(profile.Name).first,
                LastName = SplitName(profile.Name).last
            };
        }

        private async Task<string> ExchangeCodeForToken(HttpClient client, string code)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "https://github.com/login/oauth/access_token")
            {
                Content = JsonContent.Create(new
                {
                    client_id = _settings.ClientId,
                    client_secret = _settings.ClientSecret,
                    code
                })
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.SendAsync(request);
            var result = await response.Content.ReadFromJsonAsync<GitHubTokenResponse>()
                ?? throw new InvalidOperationException("Could not exchange GitHub code for a token.");

            if (result.AccessToken is null)
                throw new InvalidOperationException(result.ErrorDescription ?? "GitHub token exchange failed.");

            return result.AccessToken;
        }

        private static async Task<GitHubProfileResponse> FetchProfile(HttpClient client, string accessToken)
        {
            var request = BuildAuthorizedRequest(HttpMethod.Get, "https://api.github.com/user", accessToken);
            var response = await client.SendAsync(request);
            return await response.Content.ReadFromJsonAsync<GitHubProfileResponse>()
                ?? throw new InvalidOperationException("Could not fetch GitHub profile.");
        }

        private static async Task<string?> FetchPrimaryEmail(HttpClient client, string accessToken)
        {
            var request = BuildAuthorizedRequest(HttpMethod.Get, "https://api.github.com/user/emails", accessToken);
            var response = await client.SendAsync(request);
            var emails = await response.Content.ReadFromJsonAsync<List<GitHubEmailResponse>>() ?? [];

            return emails.FirstOrDefault(e => e.Primary && e.Verified)?.Email
                ?? emails.FirstOrDefault(e => e.Verified)?.Email;
        }

        private static HttpRequestMessage BuildAuthorizedRequest(HttpMethod method, string url, string accessToken)
        {
            var request = new HttpRequestMessage(method, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.ParseAdd("ProjectDefense");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
            return request;
        }

        private static (string? first, string? last) SplitName(string? fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return (null, null);
            var parts = fullName.Trim().Split(' ', 2);
            return parts.Length == 2 ? (parts[0], parts[1]) : (parts[0], null);
        }

        private class GitHubTokenResponse
        {
            [JsonPropertyName("access_token")]
            public string? AccessToken { get; set; }
            [JsonPropertyName("error_description")]
            public string? ErrorDescription { get; set; }
        }

        private class GitHubProfileResponse
        {
            public long Id { get; set; }
            public string? Name { get; set; }
        }

        private class GitHubEmailResponse
        {
            public string Email { get; set; } = null!;
            public bool Primary { get; set; }
            public bool Verified { get; set; }
        }
    }
}