using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Salesforce;
using ProjectDefense.Common.Settings.Salesforce;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Infrastructure.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ProjectDefense.Service.Infrastructure
{
    public class SalesforceService(
        IOptions<SalesforceSettings> options,
        IHttpClientFactory httpClientFactory,
        IUserAttributeService userAttributeService,
        IUnitOfWork unitOfWork,
        IUserHelper userHelper) : ISalesforceService
    {
        private readonly SalesforceSettings _options = options.Value;
        private readonly SemaphoreSlim _tokenLock = new(1, 1);
        private string? _cachedToken;
        private DateTime _tokenExpiresAtUtc;

        public async Task<SyncToCrmResultModel> SyncCurrentUserToCrmAsync(SyncToCrmRequestModel form, CancellationToken ct)
        {
            var user = await GetCurrentUserAsync(ct);
            var token = await GetAccessTokenAsync(ct);
            var accountId = await CreateAccountAsync(token, form, user.FirstName, user.LastName, ct);
            var contactId = await CreateContactAsync(token, form, user.FirstName, user.LastName, user.Email, accountId, ct);
            return BuildSuccessResult(accountId, contactId);
        }

        private record CurrentUserCrmInfo(string FirstName, string LastName, string Email);

        private async Task<CurrentUserCrmInfo> GetCurrentUserAsync(CancellationToken ct)
        {
            var userId = userHelper.GetUserId() ?? throw new UnauthorizedAccessException("No user id claim found.");
            var email = await GetUserEmailAsync(userId, ct);
            var attributes = await userAttributeService.GetAttributesAsync();
            var firstName = ExtractAttributeValue(attributes, "First Name");
            var lastName = ExtractAttributeValue(attributes, "Last Name");
            return new CurrentUserCrmInfo(firstName, lastName, email);
        }

        private async Task<string> GetUserEmailAsync(Guid userId, CancellationToken ct)
        {
            var user = await unitOfWork.UserRepository().GetAll().FirstOrDefaultAsync(u => u.Id == userId, ct);
            return user?.Email ?? throw new InvalidOperationException("User not found.");
        }

        private string ExtractAttributeValue(List<UserAttributeDto> attributes, string attributeName)
        {
            var match = attributes.FirstOrDefault(a => a.AttributeName == attributeName);
            if (match is null || !match.IsFilled || string.IsNullOrWhiteSpace(match.ValueGeneric))
                throw new InvalidOperationException($"Please fill in your {attributeName} before syncing to CRM.");
            return match.ValueGeneric;
        }


        private async Task<string> GetAccessTokenAsync(CancellationToken ct)
        {
            if (_cachedToken is not null && DateTime.UtcNow < _tokenExpiresAtUtc)
                return _cachedToken;
            return await RefreshAccessTokenAsync(ct);
        }

        private async Task<string> RefreshAccessTokenAsync(CancellationToken ct)
        {
            await _tokenLock.WaitAsync(ct);
            try { return await FetchAndCacheTokenAsync(ct); }
            finally { _tokenLock.Release(); }
        }

        private async Task<string> FetchAndCacheTokenAsync(CancellationToken ct)
        {
            var client = httpClientFactory.CreateClient();
            var response = await client.SendAsync(BuildTokenRequest(), ct);
            var token = await ParseTokenResponseAsync(response);
            CacheToken(token);
            return token.AccessToken;
        }

        private HttpRequestMessage BuildTokenRequest()
        {
            var form = new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = _options.ClientId,
                ["client_secret"] = _options.ClientSecret
            };
            return new HttpRequestMessage(HttpMethod.Post, _options.TokenUrl) { Content = new FormUrlEncodedContent(form) };
        }

        private async Task<SalesforceTokenResponse> ParseTokenResponseAsync(HttpResponseMessage response)
        {
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Salesforce auth failed ({(int)response.StatusCode}): {body}");
            return JsonSerializer.Deserialize<SalesforceTokenResponse>(body)
                ?? throw new InvalidOperationException($"Unexpected Salesforce auth response: {body}");
        }

        private void CacheToken(SalesforceTokenResponse token)
        {
            _cachedToken = token.AccessToken;
            _tokenExpiresAtUtc = DateTime.UtcNow.AddMinutes(90);
        }

        private async Task<string> CreateAccountAsync(string accessToken, SyncToCrmRequestModel form, string firstName, string lastName, CancellationToken ct)
        {
            var url = $"{_options.InstanceUrl}/services/data/{_options.ApiVersion}/sobjects/Account/";
            var payload = BuildAccountPayload(form, firstName, lastName);
            return await PostToSalesforceAsync(url, payload, accessToken, ct);
        }

        private Dictionary<string, object?> BuildAccountPayload(SyncToCrmRequestModel form, string firstName, string lastName)
        {
            var name = string.IsNullOrWhiteSpace(form.CompanyName) ? $"{firstName} {lastName}" : form.CompanyName;
            return new() { ["Name"] = name, ["Industry"] = form.Industry, ["Phone"] = form.Phone };
        }

        private async Task<string> CreateContactAsync(string accessToken, SyncToCrmRequestModel form, string firstName, string lastName, string email, string accountId, CancellationToken ct)
        {
            var url = $"{_options.InstanceUrl}/services/data/{_options.ApiVersion}/sobjects/Contact/";
            var payload = BuildContactPayload(form, firstName, lastName, email, accountId);
            return await PostToSalesforceAsync(url, payload, accessToken, ct);
        }

        private Dictionary<string, object?> BuildContactPayload(SyncToCrmRequestModel form, string firstName, string lastName, string email, string accountId)
        {
            return new()
            {
                ["AccountId"] = accountId,
                ["FirstName"] = firstName,
                ["LastName"] = lastName,
                ["Email"] = email,
                ["Phone"] = form.Phone
            };
        }

        private async Task<string> PostToSalesforceAsync(string url, Dictionary<string, object?> payload, string accessToken, CancellationToken ct)
        {
            var request = BuildAuthorizedPostRequest(url, payload, accessToken);
            var client = httpClientFactory.CreateClient();
            var response = await client.SendAsync(request, ct);
            return await ParseCreateResponseAsync(response);
        }

        private HttpRequestMessage BuildAuthorizedPostRequest(string url, Dictionary<string, object?> payload, string accessToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = JsonContent.Create(payload) };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            return request;
        }

        private async Task<string> ParseCreateResponseAsync(HttpResponseMessage response)
        {
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Salesforce create failed ({(int)response.StatusCode}): {body}");
            return ExtractCreatedId(body);
        }

        private string ExtractCreatedId(string body)
        {
            var result = JsonSerializer.Deserialize<SalesforceCreateResponse>(body)
                ?? throw new InvalidOperationException($"Unexpected Salesforce response: {body}");
            if (!result.Success)
                throw new InvalidOperationException($"Salesforce reported failure: {body}");
            return result.Id;
        }

        private SyncToCrmResultModel BuildSuccessResult(string accountId, string contactId)
        {
            return new SyncToCrmResultModel
            {
                Success = true,
                SalesforceAccountId = accountId,
                SalesforceContactId = contactId,
                SyncedAtUtc = DateTime.UtcNow
            };
        }
    }

    class SalesforceCreateResponse
    {
        [JsonPropertyName("id")] public string Id { get; set; } = null!;
        [JsonPropertyName("success")] public bool Success { get; set; }
    }

    class SalesforceTokenResponse
    {
        [JsonPropertyName("access_token")] public string AccessToken { get; set; } = null!;
        [JsonPropertyName("instance_url")] public string InstanceUrl { get; set; } = null!;
    }
}