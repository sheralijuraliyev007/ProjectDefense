namespace ProjectDefense.Common.DTOs.Main
{
    public class AttributeAggregateDto
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string AggregatedResult { get; set; }  
        public Dictionary<string, object>? RawValues { get; set; } 
    }
}
