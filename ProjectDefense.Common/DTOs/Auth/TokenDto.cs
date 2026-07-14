namespace ProjectDefense.Common.DTOs.Auth
{
    public record TokenDto(string AccessToken, DateTimeOffset ExpiresAt, List<string> Roles);
}
