using ProjectDefense.Data.Entities.MainEntities;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface ITagService
    {
        Task<List<Tag>> GetOrCreateTagsAsync(IEnumerable<string> labels);
        Task<List<Tag>> SearchByPrefixAsync(string prefix, int limit = 10);
    }
}
