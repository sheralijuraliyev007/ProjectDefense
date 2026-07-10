namespace ProjectDefense.Service.Common.Interfaces
{
    public interface IUserHelper
    {
        Guid? GetUserId();
        string? GetUserEmail();

        List<short> GetUserRoleCodes();

        bool IsInRole(short code);
    }
}
