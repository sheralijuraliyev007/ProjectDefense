using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.DTOs.Auth
{
    public class SocialUserInfoDto
    {
        public string Email { get; set; } = null!;
        public string ExternalId { get; set; } = null!;
        public bool EmailVerified { get; set; }
    }
}
