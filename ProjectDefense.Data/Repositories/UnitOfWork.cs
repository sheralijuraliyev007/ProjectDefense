using Microsoft.EntityFrameworkCore.Storage;
using ProjectDefense.Data.Context;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;


namespace ProjectDefense.Data.Repositories
{
    public class UnitOfWork(
        AppDbContext context,
        IBaseRepository<AttributeCategory> attributeCategoryRepository,
        IBaseRepository<AttributeType> attributeTypeRepository,
        IBaseRepository<CommonStatus> commonStatusRepository,
        IBaseRepository<ContentType> contentTypeRepository,
        IBaseRepository<CVStatus> cvStatusRepository,
        IBaseRepository<Role> roleRepository,
        IBaseRepository<Rule> ruleRepository,
        IBaseRepository<UserStatus> userStatusRepository,
        IBaseRepository<Entities.MainEntities.Attribute> attributeRepository,
        IBaseRepository<AttributeOption> attributeOptionRepository,
        IBaseRepository<Content> contentRepository,
        IBaseRepository<CV> cvRepository,
        IBaseRepository<CVAttribute> cvAttributeRepository,
        IBaseRepository<Position> positionRepository,
        IBaseRepository<PositionAttribute> positionAttributeRepository,
        IBaseRepository<PositionProjectTag> positionProjectTagRepository,
        IBaseRepository<Project> projectRepository,
        IBaseRepository<ProjectTag> projectTagRepository,
        IBaseRepository<Tag> tagRepository,
        IUserRepository userRepository,
        IBaseRepository<UserAttribute> userAttributeRepository,
        IBaseRepository<UserLike> userLikeRepository,
        IBaseRepository<UserRole> userRoleRepository,
        IBaseRepository<PositionRule> positionRuleRepository,
        IBaseRepository<DiscussionMessage> discussionMessageRepository,
        IBaseRepository<CvProject> cvProjectRepository)
        : IUnitOfWork
    {
        public IBaseRepository<AttributeCategory> AttributeCategoryRepository() =>
            attributeCategoryRepository ?? new BaseRepository<AttributeCategory>(context);

        public IBaseRepository<AttributeOption> AttributeOptionRepository() =>
            attributeOptionRepository ?? new BaseRepository<AttributeOption>(context);

        public IBaseRepository<Entities.MainEntities.Attribute> AttributeRepository() =>
            attributeRepository ?? new BaseRepository<Entities.MainEntities.Attribute>(context);    

        public IBaseRepository<AttributeType> AttributeTypeRepository() => attributeTypeRepository ?? new BaseRepository<AttributeType>(context);

        public IBaseRepository<CommonStatus> CommonStatusRepository() =>
            commonStatusRepository ?? new BaseRepository<CommonStatus>(context);

        public IBaseRepository<Content> ContentRepository() =>
            contentRepository ?? new BaseRepository<Content>(context);

        public IBaseRepository<ContentType> ContentTypeRepository() =>
            contentTypeRepository ?? new BaseRepository<ContentType>(context);

        public IBaseRepository<CVAttribute> CVAttributeRepository() =>
            cvAttributeRepository ?? new BaseRepository<CVAttribute>(context);

        public IBaseRepository<CV> CVRepository() =>
            cvRepository ?? new BaseRepository<CV>(context);

        public IBaseRepository<CVStatus> CVStatusRepository() =>
            cvStatusRepository ?? new BaseRepository<CVStatus>(context);

        public IBaseRepository<PositionAttribute> PositionAttributeRepository() =>
            positionAttributeRepository ?? new BaseRepository<PositionAttribute>(context);

        public IBaseRepository<PositionProjectTag> PositionProjectTagRepository() => 
            positionProjectTagRepository ?? new BaseRepository<PositionProjectTag>(context);
            

        public IBaseRepository<Position> PositionRepository() =>
            positionRepository ?? new BaseRepository<Position>(context);

        public IBaseRepository<Project> ProjectRepository() =>
            projectRepository ?? new BaseRepository<Project>(context);

        public IBaseRepository<ProjectTag> ProjectTagRepository() =>
            projectTagRepository ?? new BaseRepository<ProjectTag>(context);

        public IBaseRepository<Role> RoleRepository() =>
            roleRepository ?? new BaseRepository<Role>(context);

        public IBaseRepository<Rule> RuleRepository() =>
            ruleRepository ?? new BaseRepository<Rule>(context);

        public IBaseRepository<Tag> TagRepository() =>
            tagRepository ?? new BaseRepository<Tag>(context);

        public IBaseRepository<UserAttribute> UserAttributeRepository() =>
            userAttributeRepository ?? new BaseRepository<UserAttribute>(context);

        public IBaseRepository<UserLike> UserLikeRepository() =>
            userLikeRepository ?? new BaseRepository<UserLike>(context);

        public IUserRepository UserRepository() =>
            userRepository ?? new UserRepository(context);

        public IBaseRepository<UserRole> UserRoleRepository() =>
            userRoleRepository ?? new BaseRepository<UserRole>(context);

        public IBaseRepository<UserStatus> UserStatusRepository() =>
            userStatusRepository ?? new BaseRepository<UserStatus>(context);
        public IBaseRepository<DiscussionMessage> DiscussionMessageRepository() =>
            discussionMessageRepository ?? new BaseRepository<DiscussionMessage>(context);

        public async Task SaveChanges() => await context.SaveChangesAsync();

        public IDbContextTransaction BeginTransaction() => context.Database.BeginTransaction();
        public IDbContextTransaction? CurrentTransaction() => context.Database.CurrentTransaction;

        public IBaseRepository<PositionRule> PositionRuleRepository() =>
            positionRuleRepository ?? new BaseRepository<PositionRule>(context);

        public IBaseRepository<CvProject> CvProjectRepository() =>
            cvProjectRepository ?? new BaseRepository<CvProject>(context);
    }
}
