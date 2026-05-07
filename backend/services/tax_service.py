"""
tax_service.py
Estimates Indian income-tax liability on trade P&L using SEBI / IT-Act rules.

Categories
----------
1. SPECULATIVE BUSINESS INCOME
   - Equity Intraday  → taxed at slab rate (we show a note; no deduction)
   
2. NON-SPECULATIVE BUSINESS INCOME  
   - Equity Futures, Equity Options
   - Currency Futures/Options
   - Commodity Futures/Options
   → taxed at slab rate; STT paid is deductible as expense (approximated)

3. SHORT-TERM CAPITAL GAIN (STCG)
   - Equity Delivery held < 1 year  → flat 15% (Section 111A)
   
4. LONG-TERM CAPITAL GAIN (LTCG)
   - Equity Delivery held ≥ 1 year  → 10% on gains ABOVE ₹1,00,000 (Section 112A)

NOTE: This is an *estimate only* — does not constitute tax advice.
      Actual liability depends on the user's income slab, other deductions, etc.
"""

from datetime import datetime, timezone, timedelta

# Segments considered speculative (Schedule BP - Speculative)
SPECULATIVE_SEGMENTS = {"equity_intraday"}

# Segments considered non-speculative business income (F&O + Currency + Commodity)
BUSINESS_SEGMENTS = {
    "equity_futures",
    "equity_options",
    "currency_futures",
    "currency_options",
    "commodity_futures",
    "commodity_options",
}

# Equity Delivery = Capital Gains (STCG / LTCG)
DELIVERY_SEGMENT = "equity_delivery"

# LTCG threshold (₹ 1 lakh exemption per FY)
LTCG_EXEMPTION = 100_000

# Flat tax rates
STCG_RATE = 0.15   # 15%
LTCG_RATE = 0.10   # 10%


def _classify(trade: dict) -> str:
    """Return 'speculative' | 'business' | 'stcg' | 'ltcg'."""
    seg = trade.get("segment", "")
    if seg in SPECULATIVE_SEGMENTS:
        return "speculative"
    if seg in BUSINESS_SEGMENTS:
        return "business"
    if seg == DELIVERY_SEGMENT:
        # Determine holding period using created_at (we only have one timestamp,
        # so we compare it against "today" to simulate)
        created_raw = trade.get("created_at", "")
        try:
            created = datetime.fromisoformat(created_raw.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            days_held = (now - created).days
        except Exception:
            days_held = 0
        return "ltcg" if days_held >= 365 else "stcg"
    return "business"  # safe default


class TaxService:
    @staticmethod
    def estimate_tax(trades: list) -> dict:
        """
        Parameters
        ----------
        trades : list of trade dicts (from TradeHistory.to_dict())

        Returns
        -------
        dict with per-category P&L, applicable rate, and estimated tax.
        """
        buckets = {
            "speculative": 0.0,
            "business": 0.0,
            "stcg": 0.0,
            "ltcg": 0.0,
        }
        counts = {k: 0 for k in buckets}

        for trade in trades:
            cat = _classify(trade)
            pnl = trade.get("results", {}).get("net_profit", 0) or 0
            buckets[cat] += pnl
            counts[cat] += 1

        # --- Tax computation ---
        # Speculative income: show at 30% (highest slab; user sees a note)
        spec_profit = max(0, buckets["speculative"])
        spec_tax = round(spec_profit * 0.30, 2)

        # Business income: 30% on profit (offset losses allowed within same head)
        biz_profit = max(0, buckets["business"])
        biz_tax = round(biz_profit * 0.30, 2)

        # STCG: 15% flat on net gain
        stcg_profit = max(0, buckets["stcg"])
        stcg_tax = round(stcg_profit * STCG_RATE, 2)

        # LTCG: 10% on gains above ₹1L exemption
        ltcg_profit = max(0, buckets["ltcg"])
        ltcg_taxable = max(0, ltcg_profit - LTCG_EXEMPTION)
        ltcg_tax = round(ltcg_taxable * LTCG_RATE, 2)

        total_profit = sum(buckets.values())
        total_tax = spec_tax + biz_tax + stcg_tax + ltcg_tax

        return {
            "disclaimer": (
                "Estimated only. Actual tax depends on your income slab, "
                "set-off rules, and deductions. Consult a CA for filing."
            ),
            "summary": {
                "total_pnl": round(total_profit, 2),
                "total_estimated_tax": round(total_tax, 2),
                "effective_rate_pct": round(
                    (total_tax / total_profit * 100) if total_profit > 0 else 0, 2
                ),
            },
            "categories": {
                "speculative": {
                    "label": "Speculative Business (Equity Intraday)",
                    "trade_count": counts["speculative"],
                    "net_pnl": round(buckets["speculative"], 2),
                    "taxable_amount": round(spec_profit, 2),
                    "rate_pct": 30,
                    "note": "Highest slab rate shown (30%). Actual depends on total income.",
                    "estimated_tax": spec_tax,
                },
                "business": {
                    "label": "Non-Speculative Business (F&O / Currency / Commodity)",
                    "trade_count": counts["business"],
                    "net_pnl": round(buckets["business"], 2),
                    "taxable_amount": round(biz_profit, 2),
                    "rate_pct": 30,
                    "note": "30% slab shown. Losses can be carried forward 8 years.",
                    "estimated_tax": biz_tax,
                },
                "stcg": {
                    "label": "Short-Term Capital Gain (Delivery < 1 Year)",
                    "trade_count": counts["stcg"],
                    "net_pnl": round(buckets["stcg"], 2),
                    "taxable_amount": round(stcg_profit, 2),
                    "rate_pct": 15,
                    "note": "Flat 15% under Section 111A.",
                    "estimated_tax": stcg_tax,
                },
                "ltcg": {
                    "label": "Long-Term Capital Gain (Delivery ≥ 1 Year)",
                    "trade_count": counts["ltcg"],
                    "net_pnl": round(buckets["ltcg"], 2),
                    "taxable_amount": round(ltcg_taxable, 2),
                    "rate_pct": 10,
                    "note": f"10% above ₹1L exemption (Section 112A). Exempt: ₹{min(ltcg_profit, LTCG_EXEMPTION):,.0f}",
                    "estimated_tax": ltcg_tax,
                },
            },
        }
