using StatusGeneric;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface ILikeService
    {
        Task<IStatusGeneric> ToggleLikeAsync(long cvId);
        Task<int> GetLikeCountAsync(long cvId);
    }
}
