from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class TradeHistory(db.Model):
    __tablename__ = 'trade_history'
    
    id = db.Column(db.Integer, primary_key=True)
    segment = db.Column(db.String(50), nullable=False)
    exchange = db.Column(db.String(20), nullable=False)
    buy_price = db.Column(db.Float, nullable=False)
    sell_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    multiplier = db.Column(db.Float, default=1.0)
    
    # Results
    turnover = db.Column(db.Float)
    brokerage = db.Column(db.Float)
    stt_ctt = db.Column(db.Float)
    txn_charges = db.Column(db.Float)
    sebi_charges = db.Column(db.Float)
    gst = db.Column(db.Float)
    stamp_duty = db.Column(db.Float)
    total_charges = db.Column(db.Float)
    net_profit = db.Column(db.Float)
    points_to_breakeven = db.Column(db.Float)
    
    # Journal / Notes
    notes = db.Column(db.Text)
    tags = db.Column(db.String(255)) # Comma separated tags
    rating = db.Column(db.Integer) # 1-5 stars or thumb up/down
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'segment': self.segment,
            'exchange': self.exchange,
            'buy_price': self.buy_price,
            'sell_price': self.sell_price,
            'quantity': self.quantity,
            'multiplier': self.multiplier,
            'results': {
                'turnover': self.turnover,
                'brokerage': self.brokerage,
                'stt': self.stt_ctt,
                'exchange_txn_charges': self.txn_charges,
                'sebi_charges': self.sebi_charges,
                'gst': self.gst,
                'stamp_duty': self.stamp_duty,
                'total_charges': self.total_charges,
                'net_profit': self.net_profit,
                'points_to_breakeven': self.points_to_breakeven,
            },
            'notes': self.notes,
            'tags': self.tags.split(',') if self.tags else [],
            'rating': self.rating,
            'created_at': self.created_at.isoformat()
        }
