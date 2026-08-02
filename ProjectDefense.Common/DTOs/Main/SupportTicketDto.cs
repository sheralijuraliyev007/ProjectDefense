namespace ProjectDefense.Common.DTOs.Main
{
    public class SupportTicketDto
    {
        public string ReportedBy { get; set; }

        public string? Position { get; set; }

        public string Link { get; set; }

        public PirorityEnum Pirority { get; set; }

        public string Summary { get; set; }

        public List<string> AdminEmails { get; set; }
    }
}
