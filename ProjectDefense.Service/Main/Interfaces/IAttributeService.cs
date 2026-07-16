using ProjectDefense.Common.DTOs.Attribute;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Attribute;
using ProjectDefense.Service.Main.Base.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IAttributeService : IMainServiceBase<AttributeFilterOptions, AttributeDto, AttributeCreateModel, AttributeUpdateModel>
    {
        Task<List<AttributeDto>> SearchByPrefixAsync(string prefix, int limit = 10);
    }
}
