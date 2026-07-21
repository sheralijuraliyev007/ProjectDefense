namespace ProjectDefense.Common.Constants
{
    public static class ContentTypeConstants
    {
        public const short JpegCode = 1;
        public const short PngCode = 2;
        public const short WebpCode = 3;
        public const short PdfCode = 4;
        public const short CsvCode = 5;

        public const string JpegMime = "image/jpeg";
        public const string PngMime = "image/png";
        public const string WebpMime = "image/webp";
        public const string PdfMime = "application/pdf";
        public const string CsvMime = "text/csv";

        public static readonly IReadOnlyDictionary<string, short> CodeByMimeType = new Dictionary<string, short>
        {
            [JpegMime] = JpegCode,
            [PngMime] = PngCode,
            [WebpMime] = WebpCode,
            [PdfMime] = PdfCode,
            [CsvMime] = CsvCode,
        };

        public static readonly IReadOnlySet<short> ImageCodes = new HashSet<short> { JpegCode, PngCode, WebpCode };
    }
}