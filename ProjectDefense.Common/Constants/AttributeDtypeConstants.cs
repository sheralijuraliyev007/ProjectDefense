using System;

namespace ProjectDefense.Common.Constants
{
    public static class AttributeDtypeConstants
    {
        public const short String = 1, Text = 2, Image = 3, Numeric = 4, Date = 5, Period = 6, Boolean = 7, OneOfMany = 8;
        public const string StringName = "String", TextName = "Text", ImageName = "Image", NumericName = "Numeric", DateName = "Date", PeriodName = "Period", BooleanName = "Boolean", OneOfManyName = "OneOfMany";


        public static readonly Dictionary<short, string> DtypeNames = new()
        {
            { String, StringName },
            { Text, TextName },
            { Image, ImageName },
            { Numeric, NumericName },
            { Date, DateName },
            { Period, PeriodName },
            { Boolean, BooleanName },
            { OneOfMany, OneOfManyName }
        };
    }
}
