
## Package Structure

```
zerodha_brokerage_calculator/
├── zerodha_brokerage_calculator/
│   ├── __init__.py
│   └── calculator.py
├── README.md
├── setup.py
└── LICENSE (optional)
```

```
# Zerodha Brokerage Calculator

A Python package to calculate Zerodha brokerage charges for various trading segments including equities, commodities, and currencies.

## Installation

You can install the package via pip:

```bash
pip install zerodha_brokerage_calculator
```

## Usage

```
pip install zerodha-brokerage-calculator
```

```python
from zerodha_brokerage_calculator import calculate_equity_intraday

# Example calculation for Equity Intraday
result = calculate_equity_intraday(
    buy_price=1000,
    sell_price=1100,
    quantity=400,
    exchange='NSE'
)

print(f"Net Profit: {result['net_profit']}")
print(f"Total Charges: {result['total_charges']}")
```

## Functions

### Equity

- `calculate_equity_intraday(buy_price, sell_price, quantity, exchange='NSE')`
- `calculate_equity_delivery(buy_price, sell_price, quantity, exchange='NSE')`
- `calculate_equity_futures(buy_price, sell_price, quantity, exchange='NSE')`
- `calculate_equity_options(buy_price, sell_price, quantity, exchange='NSE')`

### Currency

- `calculate_currency_futures(buy_price, sell_price, quantity, exchange='NSE')`
- `calculate_currency_options(buy_price, sell_price, quantity, exchange='NSE')`

### Commodities

- `calculate_commodity_futures(buy_price, sell_price, quantity, multiplier, exchange='MCX')`
- `calculate_commodity_options(buy_price, sell_price, quantity, multiplier, exchange='MCX')`

## Parameters

- `buy_price`: The price at which you buy the asset.
- `sell_price`: The price at which you sell the asset.
- `quantity`: Number of units.
- `exchange`: Exchange name ('NSE', 'BSE', 'MCX', etc.).
- `multiplier`: Contract size multiplier (for commodities).

## Returns

All functions return a dictionary containing:

- `turnover`
- `brokerage`
- `stt` or `ctt`
- `exchange_txn_charges`
- `sebi_charges`
- `gst`
- `stamp_duty`
- `total_charges`
- `gross_profit`
- `net_profit`
- `points_to_breakeven`

## License

This project is licensed under the MIT License.

```
