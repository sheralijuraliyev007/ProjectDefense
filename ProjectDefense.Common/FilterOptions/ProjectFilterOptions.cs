using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.FilterOptions
{
    public class ProjectFilterOptions : BaseFilterOptions
    {
        public Guid? UserId { get; set; }

        public string? TagLabel { get; set; }
    }
}
