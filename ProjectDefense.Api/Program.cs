using ProjectDefense.Common.Settings.Cloudinary;
using ProjectDefense.Common.Settings.Google;
using ProjectDefense.Service.Infrastructure;
using ProjectDefense.Service.Infrastructure.Interfaces;
using ProjectDefense.Service.Main;
using ProjectDefense.Service.Main.Interfaces;

var builder = WebApplication.CreateBuilder(args);





builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.Configure<GoogleAuthSettings>(builder.Configuration.GetSection("Authentication:Google"));
builder.Services.AddScoped<ISocialLoginProvider, GoogleLoginProvider>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
