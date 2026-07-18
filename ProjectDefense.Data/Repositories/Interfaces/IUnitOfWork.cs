using Microsoft.EntityFrameworkCore.Storage;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Data.Entities.MainEntities;

namespace ProjectDefense.Data.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        IBaseRepository<Role> RoleRepository();
        IBaseRepository<AttributeCategory> AttributeCategoryRepository();
        IBaseRepository<AttributeType> AttributeTypeRepository();
        IBaseRepository<CommonStatus> CommonStatusRepository();
        IBaseRepository<ContentType> ContentTypeRepository();
        IBaseRepository<CVStatus> CVStatusRepository();
        IBaseRepository<Rule> RuleRepository();
        IBaseRepository<UserStatus> UserStatusRepository();
        IBaseRepository<Data.Entities.MainEntities.Attribute> AttributeRepository();
        IBaseRepository<AttributeOption> AttributeOptionRepository();
        IBaseRepository<Content> ContentRepository();
        IBaseRepository<CV> CVRepository();
        IBaseRepository<CVAttribute> CVAttributeRepository();
        IBaseRepository<Position> PositionRepository();
        IBaseRepository<PositionAttribute> PositionAttributeRepository();
        IBaseRepository<PositionProjectTag> PositionProjectTagRepository();
        IBaseRepository<Project> ProjectRepository();
        IBaseRepository<ProjectTag> ProjectTagRepository();
        IBaseRepository<Tag> TagRepository();
        IUserRepository UserRepository();
        IBaseRepository<UserAttribute> UserAttributeRepository();
        IBaseRepository<UserLike> UserLikeRepository();
        IBaseRepository<UserRole> UserRoleRepository();
        IBaseRepository<DiscussionMessage> DiscussionMessageRepository();

        IBaseRepository<PositionRule> PositionRuleRepository();
        Task SaveChanges();
        IDbContextTransaction BeginTransaction();
        IDbContextTransaction? CurrentTransaction();
    }
}
