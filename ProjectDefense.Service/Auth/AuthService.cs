using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.Models.Auth;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Auth.Interfaces;
using ProjectDefense.Service.Infrastructure.Interfaces;
using StatusGeneric;


namespace ProjectDefense.Service.Auth
{
    internal class AuthService(IUnitOfWork unitOfWork, IEnumerable<ISocialLoginProvider> socialLoginProviders, JwtService jwtService) : StatusGenericHandler, IAuthService
    {
        public Task<TokenDto?> LoginAsync(LoginModel loginModel)
        {
            throw new NotImplementedException();
        }

        public Task LogoutAsync(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<TokenDto?> RefreshTokenAsync(string refreshToken)
        {
            throw new NotImplementedException();
        }

        public Task<UserDto?> RegisterAsync(RegisterModel registerModel)
        {
            throw new NotImplementedException();
        }

        public async Task<TokenDto?> SocialLoginAsync(SocialLoginModel model)
        {
            var provider = GetProvider(model.Provider);
            if (provider is null) return null;

            var socialInfo = await ValidateSocialToken(provider, model.IdToken);
            if (socialInfo is null) return null;

            var user = await FindOrCreateUser(socialInfo);
            return jwtService.GenerateToken(user);
        }

        public Task<string> VerifyEmail(Guid verificationToken)
        {
            throw new NotImplementedException();
        }


        private ISocialLoginProvider? GetProvider(string providerName)
        {
            var provider = socialLoginProviders.FirstOrDefault(p => p.ProviderName == providerName);
            if (provider is null) AddError("Unsupported provider");
            return provider;

        }
        
        private async Task<SocialUserInfoDto?> ValidateSocialToken(ISocialLoginProvider provider, string idToken)
        {
            try
            {
                return await provider.ValidateTokenAsync(idToken);
            }
            catch(Exception)
            {
                AddError("Invalid token");
                return null;
            }

         }

        private async Task<User> FindOrCreateUser(SocialUserInfoDto socialUserInfoDto)
        {
            var user = await unitOfWork.UserRepository().GetByEmail(socialUserInfoDto.Email);
            if (user != null) return user;

            user = new User
            {
                Email = socialUserInfoDto.Email,
                IsVerified = socialUserInfoDto.EmailVerified,
            };
            await unitOfWork.UserRepository().Add(user);
            await unitOfWork.SaveChanges();

            var userRole = new UserRole { UserId = user.Id, RoleCode = RoleConstants.CandidateCode};
            await unitOfWork.UserRoleRepository().Add(userRole);
            await unitOfWork.SaveChanges();

            user.UserRoles.Add(userRole);   
            return user;
        }
    }
}
