namespace ProjectDefense.Common.Models.Dropbox
{
    public class CreateSupportTicketModel
    {
        public int? PositionId { get; set; }

        public string PageLink { get; set; }

        public string Summary { get; set; }

        public int Priority { get; set; }
    }
}
