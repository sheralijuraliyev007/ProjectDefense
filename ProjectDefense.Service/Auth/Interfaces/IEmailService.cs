using StatusGeneric;

namespace ProjectDefense.Service.Auth.Interfaces
{
    public interface IEmailService : IStatusGeneric
    {
        Task<string> VerifyEmail(Guid verificationToken);
        Task ResendVerificationEmailAsync(string email);
    }
}
