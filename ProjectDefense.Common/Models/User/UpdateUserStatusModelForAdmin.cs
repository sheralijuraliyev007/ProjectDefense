namespace ProjectDefense.Common.Models.User
{
    public class UpdateUserStatusModelForAdmin
    {
        public Guid UserId { get; set; }
        public short StatusCode { get; set; }   
        public int Version { get; set; }      
    }

}
