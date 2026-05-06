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
    def calculate_only(data):
        """Run calculation without persisting to DB. Returns raw results dict."""
        segment = data.get('segment')
        buy_price = float(data.get('buy_price', 0))
        sell_price = float(data.get('sell_price', 0))
        quantity = int(data.get('quantity', 0))
        exchange = data.get('exchange', 'NSE')
        multiplier = float(data.get('multiplier', 1))

        calc_func = CalculatorService.CALC_MAP.get(segment)
        if not calc_func:
            raise ValueError(f"Invalid segment: {segment}")

        if segment.startswith('commodity'):
            res = calc_func(buy_price, sell_price, quantity, multiplier, exchange)
        else:
            res = calc_func(buy_price, sell_price, quantity, exchange)

        # Enrich result with derived metrics
        gross_profit = res.get('gross_profit', 0)
        total_charges = res.get('total_charges', 0)
        turnover = res.get('turnover', 1) or 1
        res['roi_pct'] = round((res['net_profit'] / (buy_price * quantity * multiplier)) * 100, 4) if buy_price > 0 else 0
        res['charge_to_turnover_pct'] = round((total_charges / turnover) * 100, 4)
        res['effective_brokerage_rate'] = round((res.get('brokerage', 0) / turnover) * 100, 4)
        res['segment'] = segment
        res['exchange'] = exchange
        res['buy_price'] = buy_price
        res['sell_price'] = sell_price
        res['quantity'] = quantity
        return res

    @staticmethod
    def calculate_target_price(segment, exchange, buy_price, quantity, multiplier, target_profit, stop_loss_pct):
        """
        Reverse-calculate: binary-search for the exit price that yields exactly target_profit net,
        and compute the stop-loss price from stop_loss_pct.
        """
        calc_func = CalculatorService.CALC_MAP.get(segment)
        if not calc_func:
            raise ValueError(f"Invalid segment: {segment}")

        def get_net(sell_p):
            if segment.startswith('commodity'):
                res = calc_func(buy_price, sell_p, quantity, multiplier, exchange)
            else:
                res = calc_func(buy_price, sell_p, quantity, exchange)
            return res['net_profit']

        # Binary search for target exit price
        lo, hi = buy_price * 0.5, buy_price * 3.0
        for _ in range(60):
            mid = (lo + hi) / 2
            if get_net(mid) < target_profit:
                lo = mid
            else:
                hi = mid
        target_exit = round((lo + hi) / 2, 2)

        # Compute total charges at current buy/sell for breakeven reference
        be_sell = buy_price  # start from buy
        lo2, hi2 = buy_price * 0.5, buy_price * 3.0
        for _ in range(60):
            mid = (lo2 + hi2) / 2
            if get_net(mid) < 0:
                lo2 = mid
            else:
                hi2 = mid
        breakeven_exit = round((lo2 + hi2) / 2, 2)

        # Stop-loss price
        stop_loss_price = round(buy_price * (1 - stop_loss_pct / 100), 2) if stop_loss_pct else None
        stop_loss_pnl = round(get_net(stop_loss_price), 2) if stop_loss_price else None

        return {
            "target_exit_price": target_exit,
            "breakeven_exit_price": breakeven_exit,
            "stop_loss_price": stop_loss_price,
            "stop_loss_pnl": stop_loss_pnl,
            "target_profit": target_profit,
            "buy_price": buy_price,
            "quantity": quantity,
        }


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
        
        trades = TradeHistory.query.order_by(TradeHistory.created_at.asc()).all()
        
        total_trades = len(trades)
        today_trades = sum(1 for t in trades if t.created_at >= today_start)
        
        total_net_profit = sum(t.net_profit for t in trades)
        total_charges = sum(t.total_charges for t in trades)
        total_brokerage = sum(t.brokerage for t in trades)
        
        # Segment performance
        segment_stats = {}
        for t in trades:
            if t.segment not in segment_stats:
                segment_stats[t.segment] = {"count": 0, "profit": 0}
            segment_stats[t.segment]["count"] += 1
            segment_stats[t.segment]["profit"] += t.net_profit
            
        # Time series for profit curve
        profit_curve = []
        cumulative_profit = 0
        for t in trades:
            cumulative_profit += t.net_profit
            profit_curve.append({
                "date": t.created_at.isoformat(),
                "profit": cumulative_profit
            })
            
        # Charge breakdown
        charge_breakdown = {
            "brokerage": total_brokerage,
            "stt_ctt": sum(t.stt_ctt for t in trades),
            "txn_charges": sum(t.txn_charges for t in trades),
            "sebi_charges": sum(t.sebi_charges for t in trades),
            "gst": sum(t.gst for t in trades),
            "stamp_duty": sum(t.stamp_duty for t in trades)
        }
        
        return {
            "total_trades": total_trades,
            "today_trades": today_trades,
            "total_net_profit": round(total_net_profit, 2),
            "total_charges": round(total_charges, 2),
            "segment_stats": segment_stats,
            "profit_curve": profit_curve,
            "charge_breakdown": {k: round(v, 2) for k, v in charge_breakdown.items()}
        }

