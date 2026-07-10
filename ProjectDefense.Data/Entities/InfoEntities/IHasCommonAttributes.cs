using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Data.Entities.InfoEntities
{
    public interface IHasCommonAttributes
    {
        Guid? CreatedUserId { get; set; }

        Guid? ModifiedUserId { get; set; }

        DateTimeOffset? ModifiedDateTime { get; set; }
    }
}
