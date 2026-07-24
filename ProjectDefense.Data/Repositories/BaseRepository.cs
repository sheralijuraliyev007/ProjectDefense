using Microsoft.EntityFrameworkCore;
using ProjectDefense.Data.Context;
using ProjectDefense.Data.Entities.BaseEntities;
using ProjectDefense.Data.Repositories.Interfaces;

using System.Linq.Expressions;

namespace ProjectDefense.Data.Repositories
{
    public class BaseRepository<T>(AppDbContext context) :
        IBaseRepository<T> where T : BaseEntity
    {
        public async Task Add(T entity)
        {
            if (entity is BaseEntity baseEntity)
                baseEntity.CreatedDateTime = DateTimeOffset.UtcNow;

            await context.Set<T>().AddAsync(entity);
        }

        public void AddRange(List<T> entities)
        {
            foreach (var entity in entities)
                entity.ModifiedDateTime = DateTimeOffset.UtcNow;
            context.Set<T>().AddRange(entities);
        }

        public void Delete(T entity)
        {
            context.Set<T>().Remove(entity);

        }
        

        public void DeleteRange(List<T> entities)
        {
            context.Set<T>().RemoveRange(entities);
        }

        public IQueryable<T> GetAll(params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = context.Set<T>();

            

            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return query;
        }

        public async Task<T?> GetById<TK>(TK id)
        {
            var entity = await context.Set<T>().FindAsync(id);
            return entity;
        }

        
        public async Task SaveChanges() => await context.SaveChangesAsync();

        public async Task Update(T entity)
        {

            entity.ModifiedDateTime = DateTimeOffset.UtcNow;

            context.Set<T>().Update(entity);
        }

        public void UpdateRange(List<T> entities)
        {

            foreach (var entity in entities)
                entity.ModifiedDateTime = DateTimeOffset.UtcNow;
            context.Set<T>().UpdateRange(entities);
        }
    }
}
