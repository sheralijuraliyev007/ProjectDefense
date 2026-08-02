namespace ProjectDefense.Service.Infrastructure.Interfaces
{
    public interface IDropBoxService
    {
        Task UploadJsonAsync (string fileName, string jsonContent);
    }

}
