namespace ProjectDefense.Common.DTOs.User
{
    public class UserDtoForAdmin : UserDto
    {
        public List<short> RoleId { get; set; } = new List<short>();

        public short StatusCode { get; set; }

        public DateTimeOffset RefreshTokenExpireTime { get; set; }

        public DateTime CreatedDateTime { get; set; }

        public Guid CreatedUserId {  get; set; }

        public DateTime? ModifiedDateTime { get; set; }

        public Guid? ModifiedUserId { get; set; }
    }
}
