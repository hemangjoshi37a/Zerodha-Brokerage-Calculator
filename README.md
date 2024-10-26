
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

# Zerodha Brokerage Calculator

A Python package to calculate Zerodha brokerage charges for various trading segments including equities, commodities, and currencies.

## Installation

You can install the package via pip:

```bash
pip install zerodha-brokerage-calculator
```

## Usage

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


## 📫 How to reach me | Contact Information
<div align="center">
  <a href="https://hjlabs.in/"><img height="36" src="https://cdn.simpleicons.org/similarweb"/></a>
  <a href="https://wa.me/917016525813"><img height="36" src="https://cdn.simpleicons.org/WhatsApp"/></a>
  <a href="https://t.me/hjlabs"><img height="36" src="https://cdn.simpleicons.org/telegram"/></a>
  <a href="mailto:hemangjoshi37a@gmail.com"><img height="36" src="https://cdn.simpleicons.org/Gmail"/></a> 
  <a href="https://www.linkedin.com/in/hemang-joshi-046746aa"><img height="36" src="https://cdn.simpleicons.org/LinkedIn"/></a>
  <a href="https://www.facebook.com/hemangjoshi37"><img height="36" src="https://cdn.simpleicons.org/facebook"/></a>
  <a href="https://twitter.com/HemangJ81509525"><img height="36" src="https://cdn.simpleicons.org/Twitter"/></a>
  <a href="https://www.tumblr.com/blog/hemangjoshi37a-blog"><img height="36" src="https://cdn.simpleicons.org/tumblr"/></a>
  <a href="https://stackoverflow.com/users/8090050/hemang-joshi"><img height="36" src="https://cdn.simpleicons.org/StackOverflow"/></a>
  <a href="https://www.instagram.com/hemangjoshi37"><img height="36" src="https://cdn.simpleicons.org/Instagram"/></a>
  <a href="https://in.pinterest.com/hemangjoshi37a"><img height="36" src="https://cdn.simpleicons.org/Pinterest"/></a> 
  <a href="http://hemangjoshi.blogspot.com"><img height="36" src="https://cdn.simpleicons.org/Blogger"/></a>
  <a href="https://gitlab.com/hemangjoshi37a"><img height="36" src="https://cdn.simpleicons.org/gitlab"/></a>
</div>
