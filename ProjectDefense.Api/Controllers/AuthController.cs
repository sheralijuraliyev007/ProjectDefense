using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Common.DTOs.Auth;
using ProjectDefense.Common.DTOs.User;
using ProjectDefense.Common.Models.Auth;
using ProjectDefense.Common.Models.Shared;
using ProjectDefense.Service.Auth.Interfaces;

namespace ProjectDefense.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var result = await authService.RegisterAsync(model);
            return authService.IsValid ? Ok(new ApiResponse<UserDto?> { Data = result }) : BadRequest(authService.Errors);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var result = await authService.LoginAsync(model);
            return authService.IsValid ? Ok(new ApiResponse<TokenDto?> { Data = result }) : BadRequest(authService.Errors);
        }

        [HttpPost("social-login")]
        [AllowAnonymous]
        public async Task<IActionResult> SocialLogin([FromBody] SocialLoginModel model)
        {
            var result = await authService.SocialLoginAsync(model);
            return authService.IsValid ? Ok(new ApiResponse<TokenDto?> { Data = result }) : BadRequest(authService.Errors);
        }

        [HttpGet("verify-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail([FromQuery] Guid token)
        {
            var result = await authService.VerifyEmail(token);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Verified." }) : BadRequest(result.Errors);
        }

        [HttpPost("resend-verification")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendVerification([FromQuery] string email)
        {
            var result = await authService.ResendVerificationEmailAsync(email);
            return result.IsValid ? Ok(new ApiResponse<string> { Data = "Sent." }) : BadRequest(result.Errors);
        }
    }
}