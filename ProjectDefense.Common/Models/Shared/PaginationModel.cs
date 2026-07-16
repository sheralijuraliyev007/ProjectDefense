namespace ProjectDefense.Common.Models.Shared
{
    public class PaginationModel<T> where T : class
    {
        public IEnumerable<T> Rows { get; set; } = [];
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
    }
}