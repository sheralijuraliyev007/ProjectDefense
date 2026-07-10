namespace ProjectDefense.Common.Models.Auth
{
    public class RegisterModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
    }
}
