# 📊 Zerodha Brokerage Calculator

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python Package](https://img.shields.io/badge/python-v3.7+-blue.svg)](https://www.python.org/)
[![PyPI version](https://badge.fury.io/py/zerodha-brokerage-calculator.svg)](https://badge.fury.io/py/zerodha-brokerage-calculator)

A powerful Python package that simplifies the calculation of Zerodha brokerage charges across various trading segments including equities, commodities, and currencies. Built with precision and ease of use in mind.


![image](https://github.com/user-attachments/assets/c14574fe-a234-423f-b553-638757ea1b3d)


## 🌟 Features

- ✨ **Comprehensive Coverage**: Support for multiple trading segments
- 🚀 **Easy Integration**: Simple API for quick implementation
- 💯 **Accurate Calculations**: Precise brokerage and charges computation
- 🔄 **Real-time Updates**: Always current with latest Zerodha charges

## 📦 Installation

Get started with a simple pip install:

```bash
pip install zerodha-brokerage-calculator
```

## 🚀 Quick Start

Here's a quick example to calculate equity intraday charges:

```python
from zerodha_brokerage_calculator import calculate_equity_intraday

# Calculate charges for an intraday equity trade
result = calculate_equity_intraday(
    buy_price=1000,
    sell_price=1100,
    quantity=400,
    exchange='NSE'
)

print(f"Net Profit: ₹{result['net_profit']:,.2f}")
print(f"Total Charges: ₹{result['total_charges']:,.2f}")
```

## 📘 Available Functions

### 📈 Equity Trading
| Function | Description |
|----------|-------------|
| `calculate_equity_intraday()` | Calculate intraday trading charges |
| `calculate_equity_delivery()` | Calculate delivery trading charges |
| `calculate_equity_futures()` | Calculate futures trading charges |
| `calculate_equity_options()` | Calculate options trading charges |

### 💱 Currency Trading
| Function | Description |
|----------|-------------|
| `calculate_currency_futures()` | Calculate currency futures charges |
| `calculate_currency_options()` | Calculate currency options charges |

### 🏭 Commodities Trading
| Function | Description |
|----------|-------------|
| `calculate_commodity_futures()` | Calculate commodity futures charges |
| `calculate_commodity_options()` | Calculate commodity options charges |

## 📊 Function Parameters

| Parameter | Description | Type |
|-----------|-------------|------|
| `buy_price` | Purchase price of the asset | float |
| `sell_price` | Selling price of the asset | float |
| `quantity` | Number of units traded | int |
| `exchange` | Trading exchange (NSE/BSE/MCX) | str |
| `multiplier` | Contract size multiplier (for commodities) | float |

## 📋 Return Values

Each function returns a comprehensive dictionary containing:

```python
{
    'turnover': float,          # Total transaction value
    'brokerage': float,         # Brokerage charges
    'stt': float,              # Securities Transaction Tax
    'exchange_txn_charges': float,  # Exchange transaction charges
    'sebi_charges': float,      # SEBI charges
    'gst': float,              # Goods and Services Tax
    'stamp_duty': float,        # Stamp duty charges
    'total_charges': float,     # Sum of all charges
    'gross_profit': float,      # Profit before charges
    'net_profit': float,        # Profit after charges
    'points_to_breakeven': float # Required points for breakeven
}
```

## 📁 Package Structure

```
zerodha_brokerage_calculator/
├── zerodha_brokerage_calculator/
│   ├── __init__.py
│   └── calculator.py
├── README.md
├── setup.py
└── LICENSE
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📫 Contact & Support

<div align="center">
  
[![Website](https://img.shields.io/badge/Website-hjlabs.in-blue?style=flat-square&logo=similarweb)](https://hjlabs.in/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat-green?style=flat-square&logo=whatsapp)](https://wa.me/917016525813)
[![Email](https://img.shields.io/badge/Email-hemangjoshi37a@gmail.com-red?style=flat-square&logo=gmail)](mailto:hemangjoshi37a@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/hemang-joshi-046746aa)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-blue?style=flat-square&logo=twitter)](https://twitter.com/HemangJ81509525)
[![Stack Overflow](https://img.shields.io/badge/Stack%20Overflow-Profile-orange?style=flat-square&logo=stackoverflow)](https://stackoverflow.com/users/8090050/hemang-joshi)

</div>

---

<div align="center">
  <sub>Built with ❤️ by Hemang Joshi</sub>
</div>
