using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.Models.Auth;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Auth.Interfaces;
using ProjectDefense.Service.Infrastructure.Interfaces;
using StatusGeneric;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Service.Auth
{
    internal class AuthService(IUnitOfWork unitOfWork, IEnumerable<ISocialLoginProvider> socialLoginProviders) : StatusGenericHandler, IAuthService
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
            var provider = socialLoginProviders.FirstOrDefault(p => p.ProviderName == model.Provider);
            if (provider is null)
            {
                AddError("Unsupported login provider.");
                return null;
            }

            SocialUserInfoDto socialInfo;
            try
            {
                socialInfo = await provider.ValidateTokenAsync(model.IdToken);
            }
            catch (Exception)
            {
                AddError("Invalid or expired social login token.");
                return null;
            }

            var user = await unitOfWork.UserRepository().GetByEmail(socialInfo.Email);
            if (user is null)
            {
                user = new User
                {
                    Email = socialInfo.Email,
                    IsVerified = socialInfo.EmailVerified,
                    CreatedUserId = null   // self-registered
                };
                await unitOfWork.UserRepository().AddAsync(user);
                
                await unitOfWork.UserRoleRepository().AssignRoleAsync(user.Id, RoleConstants.CandidateRoleCode);
                await unitOfWork.SaveChangesAsync();
            }

            return await GenerateTokenAsync(user);
        }

        public Task<string> VerifyEmail(Guid verificationToken)
        {
            throw new NotImplementedException();
        }
    }
}
