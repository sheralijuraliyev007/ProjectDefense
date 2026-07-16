using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.FilterOptions
{
    public class AttributeFilterOptions : BaseFilterOptions
    {
        public short? CategoryCode { get; set; }
        public short? DtypeCode { get; set; }
    }
}
