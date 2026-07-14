using Microsoft.EntityFrameworkCore;
using ProjectDefense.Data.Context;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;

namespace ProjectDefense.Data.Repositories
{
    public class UserRepository(AppDbContext context) : BaseRepository<User>(context), IUserRepository
    {
        public async Task<User?> GetByEmail(string email)
        {
            return await context.Set<User>().FirstOrDefaultAsync(x => x.Email == email);
        }
    }
}