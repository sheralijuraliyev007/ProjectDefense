using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.FilterOptions
{

    public class PositionFilterOptions : BaseFilterOptions
    {
        public bool? IsPublic { get; set; }
        public short? StatusCode { get; set; }
    }
}
