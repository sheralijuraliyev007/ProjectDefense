using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.Models.Main.Attribute
{
    public class AttributeCreateModel
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required short DtypeCode { get; set; }
        public required short CategoryCode { get; set; }
        public List<string> Options { get; set; } = [];
    }
}
