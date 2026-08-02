using Microsoft.Extensions.Configuration;
using ProjectDefense.Service.Infrastructure.Interfaces;

namespace ProjectDefense.Service.Infrastructure
{
    public class DropBoxService(IConfiguration configuration, IHttpClientFactory httpClientFactory) : IDropBoxService
    {
        public async Task UploadJsonAsync(string fileName, string jsonContent)
        {
            var client = httpClientFactory.CreateClient();
            var token = configuration["DropBox:Token"];
            var request = new HttpRequestMessage(HttpMethod.Post, "https://content.dropboxapi.com/2/files/upload");
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Headers.Add("Dropbox-API-Arg", $"{{\"path\": \"/{fileName}\",\"mode\": \"add\",\"autorename\": true,\"mute\": false}}");
            request.Content = new StringContent(jsonContent);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
        }
    }
}
