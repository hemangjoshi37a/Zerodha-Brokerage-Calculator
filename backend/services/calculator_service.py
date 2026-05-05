from datetime import datetime, date
from backend.models.trade import db, TradeHistory
from zerodha_brokerage_calculator import (
    calculate_equity_intraday,
    calculate_equity_delivery,
    calculate_equity_futures,
    calculate_equity_options,
    calculate_currency_futures,
    calculate_currency_options,
    calculate_commodity_futures,
    calculate_commodity_options,
)

class CalculatorService:
    CALC_MAP = {
        'equity_intraday': calculate_equity_intraday,
        'equity_delivery': calculate_equity_delivery,
        'equity_futures': calculate_equity_futures,
        'equity_options': calculate_equity_options,
        'currency_futures': calculate_currency_futures,
        'currency_options': calculate_currency_options,
        'commodity_futures': calculate_commodity_futures,
        'commodity_options': calculate_commodity_options,
    }

    @staticmethod
    def calculate_and_save(data):
        segment = data.get('segment')
        buy_price = float(data.get('buy_price', 0))
        sell_price = float(data.get('sell_price', 0))
        quantity = int(data.get('quantity', 0))
        exchange = data.get('exchange', 'NSE')
        multiplier = float(data.get('multiplier', 1))

        calc_func = CalculatorService.CALC_MAP.get(segment)
        if not calc_func:
            raise ValueError(f"Invalid segment: {segment}")

        # Execute core logic
        if segment.startswith('commodity'):
            res = calc_func(buy_price, sell_price, quantity, multiplier, exchange)
        else:
            res = calc_func(buy_price, sell_price, quantity, exchange)

        # Save to database
        trade = TradeHistory(
            segment=segment,
            exchange=exchange,
            buy_price=buy_price,
            sell_price=sell_price,
            quantity=quantity,
            multiplier=multiplier,
            turnover=res.get('turnover'),
            brokerage=res.get('brokerage'),
            stt_ctt=res.get('stt') or res.get('ctt', 0),
            txn_charges=res.get('exchange_txn_charges'),
            sebi_charges=res.get('sebi_charges'),
            gst=res.get('gst'),
            stamp_duty=res.get('stamp_duty'),
            total_charges=res.get('total_charges'),
            net_profit=res.get('net_profit'),
            points_to_breakeven=res.get('points_to_breakeven')
        )
        
        db.session.add(trade)
        db.session.commit()
        
        return trade.to_dict()

    @staticmethod
    def get_history():
        trades = TradeHistory.query.order_by(TradeHistory.created_at.desc()).all()
        return [t.to_dict() for t in trades]

    @staticmethod
    def delete_trade(trade_id):
        trade = TradeHistory.query.get(trade_id)
        if trade:
            db.session.delete(trade)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_stats():
        today = date.today()
        today_start = datetime.combine(today, datetime.min.time())
        
        total_trades = TradeHistory.query.count()
        today_trades = TradeHistory.query.filter(TradeHistory.created_at >= today_start).count()
        
        return {
            "total_trades": total_trades,
            "today_trades": today_trades
        }
