using AutoMapper;
using AutoMapper.Internal;
using Demo.API;
using Demo.API.Configuration;
using Demo.Services.Mappers;
using Microsoft.AspNetCore.OData;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
if (!builder.Environment.IsDevelopment())
{
    builder.Configuration.SetBasePath(builder.Environment.ContentRootPath)
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
        .AddEnvironmentVariables();
    builder.Configuration.AddCustomConfiguration(builder.Environment, $"appsettings.{builder.Environment.EnvironmentName}.json");
}

var mapperConfig = new MapperConfiguration(cfg =>
{
    cfg.AddProfile(new AutoMapping());
    cfg.Internal().ForAllMaps((_, mapping) => mapping.MaxDepth(64));
}, NullLoggerFactory.Instance);

builder.Services.AddSingleton(mapperConfig.CreateMapper());
builder.Services.AddCORSPolicy();
builder.Services.AddControllers().AddOData(options => options.Select().Filter().OrderBy());
builder.Services.AddEntityFramework(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "custom", Version = "v1" });
    c.AddSecurityDefinition(Constants.Apikey, new OpenApiSecurityScheme
    {
        Description = "ApiKey missing in header",
        Type = SecuritySchemeType.ApiKey,
        Name = Constants.Apikey,
        In = ParameterLocation.Header,
        Scheme = "ApiKeyScheme"
    });
    var key = new OpenApiSecurityScheme
    {
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = Constants.Apikey
        },
        In = ParameterLocation.Header
    };
    var requirement = new OpenApiSecurityRequirement
    {
        { key, new List<string>() }
    };
    c.AddSecurityRequirement(requirement);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseMiddleware<CustomValidationMiddleware>();

app.MapControllers();

app.Run();
