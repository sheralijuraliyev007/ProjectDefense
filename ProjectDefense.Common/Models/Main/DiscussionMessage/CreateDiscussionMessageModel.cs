namespace ProjectDefense.Common.Models.Main.DiscussionMessage
{
    public class CreateDiscussionMessageModel
    {
        public required int PositionId { get; set; }
        public long? ResponseToId { get; set; }
        public required string Message { get; set; }
    }
}
