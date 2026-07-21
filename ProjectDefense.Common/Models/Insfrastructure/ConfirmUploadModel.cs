using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.Models.Insfrastructure
{
    public class ConfirmUploadModel
    {
        public required string PublicId { get; set; }
        public required string OriginalFilename { get; set; }
        public required string MimeType { get; set; }
    }


}
