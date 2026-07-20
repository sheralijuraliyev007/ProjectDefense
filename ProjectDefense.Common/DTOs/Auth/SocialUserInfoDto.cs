namespace ProjectDefense.Common.DTOs.Auth
{
    public class SocialUserInfoDto
    {
        public string Email { get; set; } = null!;
        public string ExternalId { get; set; } = null!;
        public bool EmailVerified { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
