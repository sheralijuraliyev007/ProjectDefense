using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProjectDefense.Api.Hubs;
using ProjectDefense.Common.Mapping;
using ProjectDefense.Common.Settings.Cloudinary;
using ProjectDefense.Common.Settings.Facebook;
using ProjectDefense.Common.Settings.Google;
using ProjectDefense.Common.Settings.Jwt;
using ProjectDefense.Data.Context;
using ProjectDefense.Data.Repositories;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Admin.Base;
using ProjectDefense.Service.Admin.Base.Interfaces;
using ProjectDefense.Service.Admin.Interfaces;
using ProjectDefense.Service.Admin.Users;
using ProjectDefense.Service.Admin.Users.Interfaces;
using ProjectDefense.Service.Auth;
using ProjectDefense.Service.Auth.Interfaces;
using ProjectDefense.Service.Common;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Infrastructure;
using ProjectDefense.Service.Infrastructure.Interfaces;
using ProjectDefense.Service.Main;
using ProjectDefense.Service.Main.Interfaces;
using System.Text;



var builder = WebApplication.CreateBuilder(args);

// ---- MVC / Swagger / SignalR ----
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSignalR();

builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Description = "JWT Bearer. : \"Authorization: Bearer { token } \"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.Configure<GoogleAuthSettings>(builder.Configuration.GetSection("Authentication:Google"));
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
builder.Services.Configure<GitHubAuthSettings>(builder.Configuration.GetSection("Authentication:GitHub"));
builder.Services.AddHttpClient();
builder.Services.AddScoped<ISocialLoginProvider, GitHubLoginProvider>();



builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUnitOfWork,UnitOfWork>();


builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ISocialLoginProvider, GoogleLoginProvider>();


builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();


builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddScoped<IUserHelper, UserHelper>(); 


builder.Services.AddScoped<ICvService, CvService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IAttributeService, AttributeService>();
builder.Services.AddScoped<IUserAttributeService, UserAttributeService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<ILikeService, LikeService>();
builder.Services.AddScoped<IDiscussionMessageService, DiscussionMessageService>();
builder.Services.AddScoped<IPositionAccessService, PositionAccessService>();
builder.Services.AddScoped<IContentService, ContentService>();
//builder.Services.AddScoped<ISearchService, SearchService>();


builder.Services.AddScoped<IAdminUserService, AdminUserService>();


builder.Services.AddScoped(typeof(IBaseInfoService<>), typeof(BaseInfoService<>));

AttributeMapConfig.Register();
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSetting>()!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ValidateLifetime = true
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<DiscussionHub>("/hubs/discussion");

app.Run();