namespace ProjectDefense.Common.FilterOptions
{
    public abstract class BaseFilterOptions
    {
        public const string ORDER_TYPE_ASC = "ASC";
        public const string ORDER_TYPE_DESC = "DESC";

        public string? Search { get; set; }
        public string? SortBy { get; set; }

        private string _orderType = ORDER_TYPE_ASC;
        public string OrderType
        {
            get => _orderType;
            set =>
                _orderType = new[] { ORDER_TYPE_ASC, ORDER_TYPE_DESC }
                    .Contains(value.ToUpper())
                    ? value.ToUpper()
                    : ORDER_TYPE_ASC;
        }

        private int _pageSize = 20;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value is < 1 or > 100 ? 20 : value; 
        }

        private int _page = 1;
        public int Page
        {
            get => _page;
            set => _page = value < 1 ? 1 : value;
        }

        public bool HasSearch() => !string.IsNullOrEmpty(Search);
        public bool HasSort() => !string.IsNullOrEmpty(SortBy);
    }
}