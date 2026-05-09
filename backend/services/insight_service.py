from backend.models.trade import TradeHistory
from datetime import datetime, timezone
import collections

class InsightService:
    @staticmethod
    def generate_insights() -> dict:
        """
        Analyze trade history and generate actionable text insights.
        """
        trades = TradeHistory.query.all()
        if not trades:
            return {"insights": ["Not enough data to generate insights. Add more trades!"]}

        insights = []
        
        # 1. Overall Win Rate
        winning_trades = [t for t in trades if t.net_profit > 0]
        win_rate = (len(winning_trades) / len(trades)) * 100
        if win_rate > 60:
            insights.append({"type": "positive", "text": f"Great job! Your overall win rate is {win_rate:.1f}%, which is highly profitable."})
        elif win_rate < 40:
            insights.append({"type": "negative", "text": f"Your win rate is {win_rate:.1f}%. Consider reviewing your risk management and entry criteria."})
        else:
            insights.append({"type": "neutral", "text": f"Your win rate is {win_rate:.1f}%. A steady average, focus on maximizing profit per winning trade."})

        # 2. Segment Performance
        segment_pnl = collections.defaultdict(float)
        segment_count = collections.defaultdict(int)
        for t in trades:
            segment_pnl[t.segment] += t.net_profit
            segment_count[t.segment] += 1
            
        if segment_pnl:
            best_segment = max(segment_pnl.items(), key=lambda x: x[1])
            worst_segment = min(segment_pnl.items(), key=lambda x: x[1])
            
            if best_segment[1] > 0:
                insights.append({"type": "positive", "text": f"Your most profitable segment is {best_segment[0].replace('_', ' ').title()}, yielding ₹{best_segment[1]:.2f} across {segment_count[best_segment[0]]} trades."})
            if worst_segment[1] < 0:
                insights.append({"type": "warning", "text": f"Watch out! {worst_segment[0].replace('_', ' ').title()} is your weakest segment with a loss of ₹{abs(worst_segment[1]):.2f}."})

        # 3. Brokerage / Charges Impact
        total_profit = sum(t.net_profit for t in trades if t.net_profit > 0)
        total_charges = sum(t.total_charges for t in trades)
        if total_profit > 0:
            charge_ratio = (total_charges / total_profit) * 100
            if charge_ratio > 30:
                insights.append({"type": "warning", "text": f"High fees! Taxes and brokerage consume {charge_ratio:.1f}% of your gross profits. Avoid overtrading."})
            elif charge_ratio < 10:
                insights.append({"type": "positive", "text": f"Efficient trading! Your charges are only {charge_ratio:.1f}% of your profits."})

        # 4. Day of week analysis
        day_pnl = collections.defaultdict(float)
        for t in trades:
            day = t.created_at.strftime("%A")
            day_pnl[day] += t.net_profit
            
        if day_pnl:
            best_day = max(day_pnl.items(), key=lambda x: x[1])
            worst_day = min(day_pnl.items(), key=lambda x: x[1])
            if best_day[1] > 0:
                 insights.append({"type": "info", "text": f"Statistically, {best_day[0]} is your best trading day (₹{best_day[1]:.2f} profit)."})
            if worst_day[1] < 0:
                 insights.append({"type": "warning", "text": f"{worst_day[0]} tends to be your worst trading day (₹{abs(worst_day[1]):.2f} loss). Consider trading lighter on this day."})

        return {
            "insights": insights,
            "metrics": {
                "win_rate": round(win_rate, 2),
                "total_trades": len(trades),
                "best_segment": best_segment[0] if segment_pnl else None,
            }
        }
