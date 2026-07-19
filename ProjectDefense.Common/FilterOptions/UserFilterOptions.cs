namespace ProjectDefense.Common.FilterOptions
{
    public class UserFilterOptions : BaseFilterOptions
    {
        private static readonly HashSet<string> _allowedSortFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "Id", "Email", "CreatedDateTime", "StatusCode"
    };

        public short? StatusCode { get; set; }
        public short? RoleCode { get; set; }
        public bool? IsVerified { get; set; }

        public new bool HasSort() => base.HasSort() && _allowedSortFields.Contains(SortBy!);
    }
}
