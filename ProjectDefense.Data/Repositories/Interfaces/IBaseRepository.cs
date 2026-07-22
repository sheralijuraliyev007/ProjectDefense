using System.Linq.Expressions;


namespace ProjectDefense.Data.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        IQueryable<T> GetAll(params Expression<Func<T, object>>[] includes);

        Task<T?> GetById<TK>(TK id);

        Task Add(T entity);
        Task Update(T entity);
        void Delete(T entity);
        void AddRange(List<T> entities);
        void UpdateRange(List<T> entities);
        void DeleteRange(List<T> entities);
        Task SaveChanges();
    }
}
