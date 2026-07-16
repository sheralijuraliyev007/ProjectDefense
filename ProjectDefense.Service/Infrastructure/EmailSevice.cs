using Microsoft.Extensions.Configuration;
using ProjectDefense.Common.Settings.Email;
using ProjectDefense.Service.Infrastructure.Interfaces;
using System.Net;
using System.Net.Mail;

namespace ProjectDefense.Service.Infrastructure
{
    public class EmailService(IConfiguration configuration) : IEmailService
    {
        private readonly EmailSettings _emailSettings = configuration.GetSection("EmailSettings").Get<EmailSettings>()!;

        public async Task SendVerificationEmailAsync(string email, Guid verificationToken)
        {
            var link = BuildVerificationLink(verificationToken);
            await SendEmailAsync(email, "Verify your email", BuildVerificationBody(link));
        }

        private string BuildVerificationLink(Guid token) =>
            $"{_emailSettings.AppBaseUrl}/verify-email?token={token}";

        private static string BuildVerificationBody(string link) =>
            $"Please verify your account by clicking this link: {link}";

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var message = new MailMessage(_emailSettings.From, toEmail, subject, body) { IsBodyHtml = true };
            await SendAsync(message);
        }

        private async Task SendAsync(MailMessage message)
        {
            using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.Port)
            {
                Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password),
                EnableSsl = true
            };
            await client.SendMailAsync(message);
        }
    }
}