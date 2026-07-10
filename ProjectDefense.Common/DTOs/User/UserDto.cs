namespace ProjectDefense.Common.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public bool IsVerified { get; set; }
        public string StatusName { get; set; } = null!;   
        public List<string> Roles { get; set; } = new();  
        
    }
}
