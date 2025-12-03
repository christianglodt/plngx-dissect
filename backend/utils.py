import calendar
from dateutil import parser
from datetime import date


PARSE_DATE_LOCALES = ['fr_FR', 'de_DE', 'en_US']


def parse_date(date_string: str) -> date:    
    for loc_name in PARSE_DATE_LOCALES:
        if '.' not in loc_name:
            loc_name += '.UTF-8'
        try:
            cal = calendar.LocaleTextCalendar(locale=loc_name) # type: ignore
            
            short_weekday_names = cal.formatweekheader(2).split()
            long_weekday_names = cal.formatweekheader(20).split()
            short_month_names = [cal.formatmonthname(3, i, width=20, withyear=False).strip() for i in range(1, 13)]
            long_month_names = [cal.formatmonthname(20, i, width=20, withyear=False).strip() for i in range(1, 13)]
            
            class LocaleParserInfo(parser.parserinfo):
                MONTHS = list(zip(short_month_names, long_month_names))
                WEEKDAYS = list(zip(short_weekday_names, long_weekday_names))
    
            parsed_dt = parser.parse(date_string, parserinfo=LocaleParserInfo())
            
            return parsed_dt.date()

        except Exception:
            continue # Try the next locale
            
    # If the loop finishes without returning, parsing failed for all locales
    raise ValueError(f"Could not parse '{date_string}' with any of the supported locales: {PARSE_DATE_LOCALES}")
