using ProjectDefense.Common.DTOs.Main;


namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IPositionExportService
    {
        Task<string> GenerateApiTokenAsync(int positionId);
        Task<PositionExportDto?> GetByTokenAsync(string token);
    }
}
