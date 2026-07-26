namespace ProjectDefense.Common.Models.Auth
{
    public class SocialLoginModel
    {
        public string Provider { get; set; } = null!;  
        public string IdToken { get; set; } = null!;
    }

}
