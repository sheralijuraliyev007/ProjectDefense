using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.Models.Auth
{
    public class SocialLoginModel
    {
        public string Provider { get; set; } = null!;  
        public string IdToken { get; set; } = null!;
    }

}
