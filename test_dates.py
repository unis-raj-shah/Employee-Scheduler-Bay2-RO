from api_client import get_tomorrow_date_range
from datetime import datetime

tomorrow_start, tomorrow_end, day_after_start, day_after_end = get_tomorrow_date_range()

print(f'Tomorrow: {tomorrow_start.strftime("%Y-%m-%d")} to {tomorrow_end.strftime("%Y-%m-%d")}')
print(f'Day After: {day_after_start.strftime("%Y-%m-%d")} to {day_after_end.strftime("%Y-%m-%d")}')
print(f'Tomorrow weekday: {tomorrow_start.weekday()} ({tomorrow_start.strftime("%A")})')
print(f'Day After weekday: {day_after_start.weekday()} ({day_after_start.strftime("%A")})')

# Check if dates are the same
if tomorrow_start.date() == day_after_start.date():
    print("ERROR: Tomorrow and Day After are the SAME DATE!")
else:
    print("OK: Tomorrow and Day After are different dates") 