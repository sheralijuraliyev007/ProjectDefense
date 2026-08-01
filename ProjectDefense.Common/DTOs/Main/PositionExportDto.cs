namespace ProjectDefense.Common.DTOs.Main
{
    public class PositionExportDto
    {
        public string Title { get; set; } 

        public string ShortDescription { get; set; }

        public List<AttributeAggregateDto> AttributeAggregateDtos { get; set; }
    }
}
