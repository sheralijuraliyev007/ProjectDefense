namespace ProjectDefense.Data.Repositories.Interfaces
{
    public interface IUserRepository : IBaseRepository<User>
    {
        Task<User?> GetByEmail(string email);
    }
}
