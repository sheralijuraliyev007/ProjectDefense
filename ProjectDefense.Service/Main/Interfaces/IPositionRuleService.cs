using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Models.Main.Position;
using StatusGeneric;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Service.Main.Interfaces
{
    public interface IPositionRuleService : IStatusGeneric
    {
        Task<List<PositionRuleDto>> GetRulesAsync(int positionId);
        Task<IStatusGeneric> SetRulesAsync(int positionId, List<PositionRuleModel> rules);
    }

}
