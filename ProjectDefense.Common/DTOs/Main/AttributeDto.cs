namespace ProjectDefense.Common.DTOs.Main
{
    public class AttributeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public short DtypeCode { get; set; }
        public string DtypeName { get; set; } = string.Empty;
        public short CategoryCode { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsRemovable { get; set; }
        public int Version { get; set; }
        public List<AttributeOptionDto> Options { get; set; } = [];

    }
}
