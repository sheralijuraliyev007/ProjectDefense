namespace ProjectDefense.Service.Infrastructure.Interfaces
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, Guid verificationToken);
    }

}