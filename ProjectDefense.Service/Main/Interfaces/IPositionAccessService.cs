namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IPositionAccessService
    {
        Task<bool> CanAccessAsync(int positionId, Guid userId);
    }
}
