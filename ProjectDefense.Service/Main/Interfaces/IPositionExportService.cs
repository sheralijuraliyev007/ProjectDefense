using ProjectDefense.Common.DTOs.Main;
using StatusGeneric;


namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IPositionExportService : IStatusGeneric
    {
        Task<string> GenerateApiTokenAsync(int positionId);
        Task<PositionExportDto?> GetByTokenAsync(string token);
    }
}
