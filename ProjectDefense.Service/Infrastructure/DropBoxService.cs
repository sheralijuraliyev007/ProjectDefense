using Microsoft.Extensions.Configuration;
using ProjectDefense.Service.Infrastructure.Interfaces;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

public class DropBoxService(IConfiguration configuration, IHttpClientFactory httpClientFactory) : IDropBoxService
{
    private readonly SemaphoreSlim _tokenLock = new(1, 1);
    private string? _cachedToken;
    private DateTime _tokenExpiresAtUtc;

    public async Task UploadJsonAsync(string fileName, string jsonContent)
    {
        var token = await GetAccessTokenAsync();
        var client = httpClientFactory.CreateClient();
        var request = BuildUploadRequest(fileName, jsonContent, token);
        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    private HttpRequestMessage BuildUploadRequest(string fileName, string jsonContent, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://content.dropboxapi.com/2/files/upload");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Add("Dropbox-API-Arg", $"{{\"path\": \"/{fileName}\",\"mode\": \"add\",\"autorename\": true,\"mute\": false}}");
        request.Content = new StringContent(jsonContent);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        return request;
    }

    private async Task<string> GetAccessTokenAsync()
    {
        if (_cachedToken is not null && DateTime.UtcNow < _tokenExpiresAtUtc)
            return _cachedToken;
        return await RefreshAccessTokenAsync();
    }

    private async Task<string> RefreshAccessTokenAsync()
    {
        await _tokenLock.WaitAsync();
        try { return await FetchAndCacheTokenAsync(); }
        finally { _tokenLock.Release(); }
    }

    private async Task<string> FetchAndCacheTokenAsync()
    {
        var client = httpClientFactory.CreateClient();
        var response = await client.SendAsync(BuildTokenRequest());
        var token = await ParseTokenResponseAsync(response);
        CacheToken(token);
        return token.AccessToken;
    }

    private HttpRequestMessage BuildTokenRequest()
    {
        var form = new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = configuration["DropBox:RefreshToken"]!,
            ["client_id"] = configuration["DropBox:AppKey"]!,
            ["client_secret"] = configuration["DropBox:AppSecret"]!
        };
        return new HttpRequestMessage(HttpMethod.Post, "https://api.dropbox.com/oauth2/token")
        {
            Content = new FormUrlEncodedContent(form)
        };
    }

    private async Task<DropboxTokenResponse> ParseTokenResponseAsync(HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Dropbox auth failed ({(int)response.StatusCode}): {body}");
        return JsonSerializer.Deserialize<DropboxTokenResponse>(body)
            ?? throw new InvalidOperationException($"Unexpected Dropbox auth response: {body}");
    }

    private void CacheToken(DropboxTokenResponse token)
    {
        _cachedToken = token.AccessToken;
        _tokenExpiresAtUtc = DateTime.UtcNow.AddSeconds(token.ExpiresIn - 60);
    }
}

class DropboxTokenResponse
{
    [JsonPropertyName("access_token")] public string AccessToken { get; set; } = null!;
    [JsonPropertyName("expires_in")] public int ExpiresIn { get; set; }
}