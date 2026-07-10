using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;


namespace ProjectDefense.Data.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        IQueryable<T> GetAll(params Expression<Func<T, object>>[] includes);

        Task<T?> GetById<TK>(TK id);
        Task<T?> GetByEmail<TE>(TE email);

        Task Add(T entity);

        Task Update(T entity);

        Task Delete(T entity);

        void AddRange(List<T> entities);
        void UpdateRange(List<T> entities);
        void DeleteRange(List<T> entities);

        Task SaveChanges();

    }
}
