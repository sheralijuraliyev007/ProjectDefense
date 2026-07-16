using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.Models.Main.Project
{
    public class ProjectCreateModel
    {
        public required string Name { get; set; }

        public DateTime? PeriodStart { get; set; }

        public DateTime? PeriodEnd { get; set; }

        public required string Description { get; set; }

        public List<string> Tags { get; set; } = [];
    }
}
