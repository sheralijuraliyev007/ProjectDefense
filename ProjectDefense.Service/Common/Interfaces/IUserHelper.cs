namespace ProjectDefense.Service.Common.Interfaces
{
    public interface IUserHelper
    {
        Guid? GetUserId();
        List<short> GetUserRoleCodes();
        bool IsInRole(short code);
    }
}
