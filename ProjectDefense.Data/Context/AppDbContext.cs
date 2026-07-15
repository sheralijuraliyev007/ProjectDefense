using Microsoft.EntityFrameworkCore;
using ProjectDefense.Data.Entities.InfoEntities;
using ProjectDefense.Data.Entities.MainEntities;


namespace ProjectDefense.Data.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
           
        }

        public DbSet<AttributeCategory> AttributeCategories { get; set; }
        public DbSet<AttributeType> AttributeTypes { get; set; }
        public DbSet<CommonStatus> CommonStatuses { get; set; }
        public DbSet<ContentType> ContentTypes { get; set; }
        public DbSet<CVStatus> CVStatuses { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Rule> Rules { get; set; }
        public DbSet<UserStatus> UserStatuses { get; set; }
        public DbSet<Data.Entities.MainEntities.Attribute> Attributes{ get; set; }
        public DbSet<AttributeOption> AttributeOptions { get; set; }
        public DbSet<Content> Contents { get; set; }
        public DbSet<CV> CVs { get; set; }
        public DbSet<CVAttribute> CVAttributes { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<PositionAttribute> PositionAttributes { get; set; }
        public DbSet<PositionProjectTag> PositionProjectTags { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTag> ProjectTags{ get; set; }
        public DbSet<Tag> Tags{ get; set; }
        public DbSet<User> Users{ get; set; }
        public DbSet<UserAttribute> UserAttributes{ get; set; }
        public DbSet<UserLike> UserLikes{ get; set; }
        public DbSet<UserRole> UserRoles{ get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleCode });
        }

    }
}
