using Microsoft.EntityFrameworkCore;
using ProjectDefense.Api.Hubs;
using ProjectDefense.Common.Settings.Cloudinary;
using ProjectDefense.Common.Settings.Google;
using ProjectDefense.Common.Settings.Jwt;
using ProjectDefense.Data.Context;
using ProjectDefense.Data.Repositories;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Admin;
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



var builder = WebApplication.CreateBuilder(args);

// ---- MVC / Swagger / SignalR ----
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// ---- DbContext ----
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---- Settings ----
builder.Services.Configure<GoogleAuthSettings>(builder.Configuration.GetSection("Authentication:Google"));
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
// TODO: also Configure<JwtSetting> and Configure<EmailSettings> if not already elsewhere

// ---- Repositories ----
builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// ---- Auth ----
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ISocialLoginProvider, GoogleLoginProvider>();

// ---- Infrastructure ----
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

// ---- Common ----
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddScoped<IUserHelper, UserHelper>(); // confirm this is your actual IUserHelper impl name

// ---- Main entities ----
builder.Services.AddScoped<ICvService, CvService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IAttributeService, AttributeService>();
builder.Services.AddScoped<IUserAttributeService, UserAttributeService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<ILikeService, LikeService>();
builder.Services.AddScoped<IDiscussionMessageService, DiscussionMessageService>();
builder.Services.AddScoped<IPositionAccessService, PositionAccessService>();
builder.Services.AddScoped<ISearchService, SearchService>();

// ---- Admin ----
builder.Services.AddScoped<IAdminUserService, Admin>();

// ---- Info lookup CRUD (generic) ----
builder.Services.AddScoped(typeof(IBaseInfoService<>), typeof(BaseInfoService<>));


var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSetting>()!;

builder.Services.AddAuthentication(JwtBearerDe.AuthenticationScheme)
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();
app.MapHub<DiscussionHub>("/hubs/discussion");

app.Run();