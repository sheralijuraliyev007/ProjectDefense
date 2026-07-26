using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ProjectDefense.Service.Hubs
{
    [Authorize]
    public class UserNotificationHub : Hub
    {
    }
}