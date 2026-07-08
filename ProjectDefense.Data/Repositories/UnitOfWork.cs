using ProjectDefense.Data.Context;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Data.Repositories.Interfaces;


namespace ProjectDefense.Data.Repositories
{
    public class UnitOfWork(
        AppDbContext context,
        IBaseRepository<Role> roleRepository)
        : IUnitOfWork
    {
       
        public IBaseRepository<Role>  RoleRe
    }
}
