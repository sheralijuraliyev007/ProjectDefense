using ProjectDefense.Data.Entities.MainEntities;

namespace ProjectDefense.Data.Repositories.Interfaces
{
    public interface IUserRepository : IBaseRepository<User>
    {
        Task<User?> GetByEmail(string email);
    }
}
