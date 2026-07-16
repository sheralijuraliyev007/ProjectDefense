using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.Models.Auth;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Auth.Interfaces;
using ProjectDefense.Service.Infrastructure.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Auth
{
    internal class AuthService(
        IUnitOfWork unitOfWork,
        IEnumerable<ISocialLoginProvider> socialLoginProviders,
        IJwtService jwtService,
        IEmailService emailService) : StatusGenericHandler, IAuthService
    {
        // ---------- Register ----------

        public async Task<UserDto?> RegisterAsync(RegisterModel registerModel)
        {
            if (await EmailTaken(registerModel.Email)) return null;
            var user = await CreateUser(registerModel);
            await emailService.SendVerificationEmailAsync(user.Email, user.VerificationToken!.Value);
            return user.MapToDto<User, UserDto>(_config);
        }

        private async Task<bool> EmailTaken(string email)
        {
            var existing = await unitOfWork.UserRepository().GetByEmail(email);
            if (existing is not null) AddError($"User with email '{email}' already exists.");
            return existing is not null;
        }

        private async Task<User> CreateUser(RegisterModel model)
        {
            var user = new User { Email = model.Email, StatusCode = UserStatusConstants.ActiveStatusCode };
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, model.Password);
            await SaveNewUser(user);
            return user;
        }

        private async Task SaveNewUser(User user)
        {
            if (!user.IsVerified) IssueVerificationToken(user);
            await unitOfWork.UserRepository().Add(user);
            await unitOfWork.SaveChanges();
            await AttachStatus(user);
            await AttachRole(user, RoleConstants.CandidateCode);
        }

        private static void IssueVerificationToken(User user)
        {
            user.VerificationToken = Guid.NewGuid();
            user.VerificationTokenExpiry = DateTimeOffset.UtcNow.AddHours(24);
        }

        public async Task<TokenDto?> LoginAsync(LoginModel loginModel)
        {
            var user = await unitOfWork.UserRepository().GetByEmail(loginModel.Email);
            if (!IsValidLogin(user, loginModel.Password)) return null;
            return jwtService.GenerateToken(user!);
        }

        private bool IsValidLogin(User? user, string password)
        {
            if (user is null) { AddError("Invalid email or password."); return false; }
            if (user.PasswordHash is null) { AddError("This account uses social login."); return false; }
            return VerifyPassword(user, password);
        }

        private bool VerifyPassword(User user, string password)
        {
            var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash!, password);
            if (result == PasswordVerificationResult.Failed) AddError("Invalid email or password.");
            return result != PasswordVerificationResult.Failed;
        }

        public async Task<TokenDto?> SocialLoginAsync(SocialLoginModel model)
        {
            var provider = GetProvider(model.Provider);
            if (provider is null) return null;
            var socialInfo = await ValidateSocialToken(provider, model.IdToken);
            if (socialInfo is null) return null;
            var user = await FindOrCreateSocialUser(socialInfo);
            return jwtService.GenerateToken(user);
        }

        private ISocialLoginProvider? GetProvider(string providerName)
        {
            var provider = socialLoginProviders.FirstOrDefault(p => p.ProviderName == providerName);
            if (provider is null) AddError("Unsupported login provider.");
            return provider;
        }

        private async Task<SocialUserInfoDto?> ValidateSocialToken(ISocialLoginProvider provider, string idToken)
        {
            try { return await provider.ValidateTokenAsync(idToken); }
            catch (Exception) { AddError("Invalid or expired social login token."); return null; }
        }

        private async Task<User> FindOrCreateSocialUser(SocialUserInfoDto info)
        {
            var existing = await unitOfWork.UserRepository().GetByEmail(info.Email);
            return existing ?? await CreateSocialUser(info);
        }

        private async Task<User> CreateSocialUser(SocialUserInfoDto info)
        {
            var user = new User { Email = info.Email, IsVerified = info.EmailVerified, StatusCode = UserStatusConstants.ActiveStatusCode };
            await SaveNewUser(user);
            return user;
        }

        public async Task<string> VerifyEmail(Guid verificationToken)
        {
            var user = await FindByVerificationToken(verificationToken);
            if (user is null) return "Invalid or expired verification link.";
            return await ConfirmVerification(user);
        }

        private async Task<User?> FindByVerificationToken(Guid token)
        {
            var user = await unitOfWork.UserRepository().GetAll().FirstOrDefaultAsync(u => u.VerificationToken == token);
            return IsTokenValid(user) ? user : null;
        }

        private static bool IsTokenValid(User? user) =>
            user is not null && user.VerificationTokenExpiry > DateTimeOffset.UtcNow;

        private async Task<string> ConfirmVerification(User user)
        {
            user.IsVerified = true;
            user.VerificationToken = null;
            user.VerificationTokenExpiry = null;
            await unitOfWork.UserRepository().Update(user);
            await unitOfWork.SaveChanges();
            return "Email verified successfully.";
        }

        public async Task ResendVerificationEmailAsync(string email)
        {
            var user = await unitOfWork.UserRepository().GetByEmail(email);
            if (!CanResend(user)) return;
            IssueVerificationToken(user!);
            await unitOfWork.UserRepository().Update(user!);
            await unitOfWork.SaveChanges();
            await emailService.SendVerificationEmailAsync(user!.Email, user.VerificationToken!.Value);
        }

        private bool CanResend(User? user)
        {
            if (user is null) { AddError("No account found for that email."); return false; }
            if (user.IsVerified) { AddError("This account is already verified."); return false; }
            return true;
        }

        private async Task AttachStatus(User user)
        {
            var status = await unitOfWork.UserStatusRepository().GetAll().FirstOrDefaultAsync(s => s.Code == user.StatusCode);
            user.Status = status;
        }

        private async Task AttachRole(User user, short roleCode)
        {
            var role = await unitOfWork.RoleRepository().GetAll().FirstOrDefaultAsync(r => r.Code == roleCode);
            var userRole = new UserRole { UserId = user.Id, RoleCode = roleCode, Role = role };
            await unitOfWork.UserRoleRepository().Add(userRole);
            await unitOfWork.SaveChanges();
            user.UserRoles.Add(userRole);
        }

        private static readonly TypeAdapterConfig _config = BuildMapConfig();

        private static TypeAdapterConfig BuildMapConfig()
        {
            var config = new TypeAdapterConfig();
            config.NewConfig<User, UserDto>()
                .Map(d => d.Roles, s => s.UserRoles.Select(r => r.Role!.Name).ToList())
                .Map(d => d.StatusName, s => s.Status!.Name);
            return config;
        }
    }
}