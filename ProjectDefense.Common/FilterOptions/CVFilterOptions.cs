namespace ProjectDefense.Common.FilterOptions
{
    public class CVFilterOptions : BaseFilterOptions
    {
        public int? PositionId { get; set; }

        public short? StatusCode { get; set; }

        public Guid? UserId { get; set; }
    }
}