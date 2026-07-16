namespace ProjectDefense.Common.Models.Attribute
{
    public class CreateattributeModel
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public short DtypeCode { get; set; }
        public short CategoryCode { get; set; }
        public bool IsRemovable { get; set; } = true;
    }
}
