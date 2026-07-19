using Microsoft.AspNetCore.Mvc;
using ProjectDefense.Service.Admin.Interfaces;


namespace ProjectDefense.Api.Controllers;

[Route("api/lookups/[action]")]
[ApiController]
public class LookupController(ILookupService service) : ControllerBase
{
    
}