using ProjectDefense.Common.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Service.Infrastructure.Interfaces
{
    public interface ISocialLoginProvider
    {
        string ProviderName { get; }
        Task<SocialUserInfoDto> ValidateTokenAsync(string idToken);
    }
}
