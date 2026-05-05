from app import create_app
from backend.models.trade import TradeHistory
from datetime import datetime, date

app = create_app()
with app.app_context():
    today_start = datetime.combine(date.today(), datetime.min.time())
    count = TradeHistory.query.filter(TradeHistory.created_at >= today_start).count()
    total = TradeHistory.query.count()
    print(f"TODAY: {count}")
    print(f"TOTAL: {total}")
