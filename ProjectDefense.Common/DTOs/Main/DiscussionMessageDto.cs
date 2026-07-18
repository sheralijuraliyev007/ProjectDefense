using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectDefense.Common.DTOs.Main
{
    public class DiscussionMessageDto
    {
        public long Id { get; set; }
        public long? ResponseToId { get; set; }
        public int PositionId { get; set; }
        public Guid UserId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTimeOffset CreatedDateTime { get; set; }
    }
}
