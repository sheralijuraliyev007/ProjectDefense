namespace ProjectDefense.Common.DTOs.Attribute
{
    public class AttributeDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public short DtypeCode { get; set; }
        public required string DtypeName { get; set; }
        public short CategoryCode { get; set; }
        public required string CategoryName { get; set; }
        public bool IsRemovable { get; set; }
        public int Version { get; set; }
    }
}