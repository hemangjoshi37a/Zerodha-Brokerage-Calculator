from app import create_app
from backend.models.trade import TradeHistory
from datetime import datetime

app = create_app()
with app.app_context():
    today = datetime.utcnow().strftime('%Y-%m-%d')
    count_today = TradeHistory.query.filter(TradeHistory.created_at >= today).count()
    count_total = TradeHistory.query.count()
    print(f"TODAY_COUNT:{count_today}")
    print(f"TOTAL_COUNT:{count_total}")
