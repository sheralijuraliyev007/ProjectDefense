using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.Settings.Jwt;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Service.Auth.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace ProjectDefense.Service.Auth
{
    public class JwtService(IConfiguration configuration) : IJwtService
    {
        private readonly JwtSetting _jwtSetting = configuration.GetSection("JwtSettings").Get<JwtSetting>()!;
        public TokenDto GenerateToken(User user)
        {
            var signingKey = GetSingningKey();
            var claims = BuildClaims(user);
            var expiresAt = DateTime.UtcNow.AddHours(1);


            var security = new JwtSecurityToken(
                issuer: _jwtSetting.Issuer,
                audience: _jwtSetting.Audience,
                signingCredentials: signingKey,
                claims: claims,
                expires: expiresAt
                );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(security);
            var roles = user.UserRoles.Select(ur => ur.Role!.Name).ToList();

            return new TokenDto(accessToken, expiresAt, roles);
        }

        private SigningCredentials GetSingningKey()
        {
            var key = Encoding.UTF8.GetBytes(_jwtSetting.Key);

            var signingKey = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            return signingKey;
        }

        private List<Claim> BuildClaims(User user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier , user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            foreach(var userRole in user.UserRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole.Role!.Name));
                claims.Add(new Claim("role_code", userRole.Role.Code.ToString()));
            }
            return claims;
        }
    }
}
