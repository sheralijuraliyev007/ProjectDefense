using ProjectDefense.Data.Entities.BaseEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.Models.Main.Project
{
    public class ProjectUpdateModel : IHasVersion
    {
        public required string Name { get; set; }
        public DateTime? PeriodStart { get; set; }
        public DateTime? PeriodEnd { get; set; }
        public required string Description { get; set; }
        public required int Version { get; set; }
    }
}
