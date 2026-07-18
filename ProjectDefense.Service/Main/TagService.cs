using Microsoft.EntityFrameworkCore;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Main.Interfaces;

namespace ProjectDefense.Service.Main
{
    public class TagService(IBaseRepository<Tag> tagRepository) : ITagService
    {
        public async Task<List<Tag>> GetOrCreateTagsAsync(IEnumerable<string> labels)
        {
            var normalized = labels.Select(l => l.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
            if (normalized.Count == 0) return [];

            var existing = await FindExisting(normalized);
            var missing = FindMissingLabels(normalized, existing);

            if (missing.Count > 0)
                existing.AddRange(await CreateTags(missing));

            return existing;
        }

        public Task<List<Tag>> SearchByPrefixAsync(string prefix, int limit = 10) =>
            tagRepository.GetAll()
                .Where(t => EF.Functions.Like(t.Label, prefix + "%"))
                .Take(limit)
                .ToListAsync();

        private Task<List<Tag>> FindExisting(List<string> labels) =>
            tagRepository.GetAll()
                .Where(t => labels.Contains(t.Label))
                .ToListAsync();

        private static List<string> FindMissingLabels(List<string> wanted, List<Tag> found)
        {
            var foundLabels = found.Select(t => t.Label).ToHashSet(StringComparer.OrdinalIgnoreCase);
            return wanted.Where(l => !foundLabels.Contains(l)).ToList();
        }

        private async Task<List<Tag>> CreateTags(List<string> labels)
        {
            var newTags = labels.Select(l => new Tag { Label = l }).ToList();
            tagRepository.AddRange(newTags);
            await tagRepository.SaveChanges();
            return newTags;
        }
    }
}