"""
price_service.py
Fetches live / delayed stock quotes from Yahoo Finance via yfinance.
Indian stocks: appends .NS (NSE) or .BO (BSE).
Commodity / Currency stubs: returns None (no reliable free feed).
"""

import yfinance as yf

EXCHANGE_SUFFIX = {
    "NSE": ".NS",
    "BSE": ".BO",
    "MCX": None,   # No yfinance support for MCX; handled gracefully
}


class PriceService:
    @staticmethod
    def get_quote(symbol: str, exchange: str = "NSE") -> dict:
        """
        Fetch the latest price for an Indian equity symbol.

        Parameters
        ----------
        symbol   : Ticker without exchange suffix, e.g. "RELIANCE"
        exchange : "NSE" | "BSE" | "MCX"

        Returns
        -------
        dict with keys: symbol, exchange, ltp, open, high, low, prev_close,
                        change, change_pct, volume
        Raises ValueError if the symbol is invalid or feed unavailable.
        """
        suffix = EXCHANGE_SUFFIX.get(exchange.upper())
        if suffix is None:
            raise ValueError(
                f"Live price feed is not available for {exchange}. "
                "Please enter the price manually."
            )

        ticker_symbol = f"{symbol.upper().strip()}{suffix}"
        ticker = yf.Ticker(ticker_symbol)

        # fast_info is lightweight (no history download)
        try:
            info = ticker.fast_info
            ltp = info.last_price
        except Exception:
            ltp = None

        if not ltp:
            # Fallback: pull 1-day 1-min bar
            try:
                hist = ticker.history(period="1d", interval="1m")
                if hist.empty:
                    raise ValueError(
                        f"Symbol '{symbol}' not found on {exchange}. "
                        "Check the ticker and try again."
                    )
                ltp = round(float(hist["Close"].iloc[-1]), 2)
            except Exception as inner:
                raise ValueError(str(inner)) from inner

        # Build richer response when possible
        try:
            prev_close = round(float(info.previous_close or 0), 2)
            open_price = round(float(info.open or 0), 2)
            high = round(float(info.day_high or 0), 2)
            low = round(float(info.day_low or 0), 2)
            volume = int(info.three_month_average_volume or 0)
        except Exception:
            prev_close = open_price = high = low = 0
            volume = 0

        change = round(ltp - prev_close, 2) if prev_close else 0
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

        return {
            "symbol": symbol.upper(),
            "exchange": exchange.upper(),
            "ltp": round(ltp, 2),
            "open": open_price,
            "high": high,
            "low": low,
            "prev_close": prev_close,
            "change": change,
            "change_pct": change_pct,
            "volume": volume,
        }
