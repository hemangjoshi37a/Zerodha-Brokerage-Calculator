# Zerodha Brokerage Calculator API Reference

This document provides a comprehensive technical reference for the `zerodha_brokerage_calculator` package.

## Module Structure

The package is organized into several key calculation functions, each corresponding to a specific trading segment on the Zerodha platform.

---

## 📈 Equity Segment

### `calculate_equity_intraday`
Calculates charges for same-day equity trades.

#### Parameters:
- `buy_price` (float): The purchase price per share.
- `sell_price` (float): The selling price per share.
- `quantity` (int): The number of shares traded.
- `exchange` (str): Either 'NSE' or 'BSE'.

#### Return Schema:
```python
{
    'turnover': float,      # (buy + sell) * qty
    'brokerage': float,     # 0.03% capped at Rs. 20/order
    'stt': float,           # 0.025% on sell
    'txn_charges': float,   # Exchange specific
    'gst': float,           # 18% of (B + T)
    'sebi': float,          # Rs. 10 / Crore
    'stamp': float,         # 0.003% on buy
    'net_profit': float     # Gross - Total Charges
}
```

### `calculate_equity_delivery`
Calculates charges for long-term equity holdings.

#### Parameters:
- `buy_price` (float): The purchase price.
- `sell_price` (float): The selling price.
- `quantity` (int): The number of shares.
- `exchange` (str): 'NSE' or 'BSE'.

#### Key Differences:
- Brokerage is always **0**.
- STT is **0.1%** on both buy and sell.
- Stamp Duty is **0.015%** on buy.

---

## 🏗️ Futures & Options

### `calculate_equity_futures`
#### Parameters:
- `buy_price` (float): Entry price.
- `sell_price` (float): Exit price.
- `quantity` (int): Lot size * Number of lots.
- `exchange` (str): 'NSE' or 'BSE'.

### `calculate_equity_options`
#### Parameters:
- `buy_price` (float): Buy premium.
- `sell_price` (float): Sell premium.
- `quantity` (int): Total quantity.
- `exchange` (str): 'NSE' or 'BSE'.

---

## 💱 Currency Segment

### `calculate_currency_futures`
### `calculate_currency_options`

*Note: Currency trades do not attract STT/CTT.*

---

## 🏭 Commodity Segment

### `calculate_commodity_futures`
#### Additional Parameter:
- `multiplier` (float): The contract multiplier (e.g., 100 for Gold Mini).

---

## 🧮 Shared Logic & Constants

All functions utilize the following shared constants for precision:
- **GST_RATE**: 0.18
- **SEBI_TURNOVER_FEES**: 0.0000001
- **STAMP_DUTY_INTRADAY**: 0.00003
- **STAMP_DUTY_DELIVERY**: 0.00015

## ⚠️ Error Handling

The API will raise a `ValueError` in the following scenarios:
1. `buy_price` or `sell_price` is <= 0.
2. `quantity` is <= 0.
3. `exchange` is not 'NSE', 'BSE', or 'MCX' (where applicable).

## 💡 Best Practices

1. **Floating Point Precision**: Use the `round_precision` helper from `utils.helpers` when displaying values to users.
2. **Batch Processing**: For portfolio-wide calculations, use a list comprehension or generator to iterate through trades.
3. **Caching**: If calling the API in a loop with identical parameters, consider using `@functools.lru_cache`.

---

## 🔚 End of API Reference
