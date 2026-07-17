using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;
using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Interfaces;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class LikeService(IBaseRepository<UserLike> likeRepo, 
        IBaseRepository<UserRole> userRoleRepo, IUserHelper userHelper) :StatusGenericHandler ,ILikeService
    {

        public async Task<int> GetLikeCountAsync(long cvId) =>
            await likeRepo.GetAll().CountAsync(ul => ul.CVId == cvId);

        public async Task<IStatusGeneric> ToggleLikeAsync(long cvId)
        {
            var userId = userHelper.GetUserId();
            if(userId == null)
            {
                AddError("You are not logged in");
                return this;
            }
            if(!await IsRecruiter(userId.Value))
            {
                AddError("Only recruiters can like cv");
                return this;
            }
            var existing = await likeRepo.GetAll().
                FirstOrDefaultAsync(ul=>ul.CVId == cvId && ul.UserId == userId.Value);

            if (existing != null) likeRepo.Delete(existing);
            else await likeRepo.Add(new UserLike {UserId = userId.Value, CVId = cvId , CreatedUserId = userId});

            await likeRepo.SaveChanges();
            return this;
        }

        private async Task<bool> IsRecruiter(Guid userId) =>
            await userRoleRepo.GetAll().AnyAsync(ur => ur.UserId == userId && ur.RoleCode == RoleConstants.Recruiter );
        
    }
}
