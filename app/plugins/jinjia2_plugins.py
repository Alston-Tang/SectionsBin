from app import app


def pretty_date(date_time):
    return date_time.strftime('%Y/%m/%d %H:%M')

app.jinja_env.filters['pretty_date'] = pretty_date
