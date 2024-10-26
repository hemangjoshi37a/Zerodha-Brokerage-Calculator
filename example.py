# example.py

"""
This script demonstrates the usage of the zerodha_brokerage_calculator package.
It includes examples for all types of calculations supported by the package,
along with explanations for each calculation.
"""

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

# Example 1: Equity Intraday Calculation
# --------------------------------------
# Calculate the charges and net profit/loss for an intraday equity trade.

print("Equity Intraday Calculation:")
buy_price = 1000  # Buy price per share
sell_price = 1100  # Sell price per share
quantity = 400  # Number of shares
exchange = 'NSE'  # Exchange: 'NSE' or 'BSE'

result_intraday = calculate_equity_intraday(buy_price, sell_price, quantity, exchange)

print(f"Net Profit: {result_intraday['net_profit']}")
print(f"Total Charges: {result_intraday['total_charges']}")
print(f"Points to Break-even: {result_intraday['points_to_breakeven']}\n")

# Example 2: Equity Delivery Calculation
# --------------------------------------
# Calculate the charges and net profit/loss for a delivery equity trade.

print("Equity Delivery Calculation:")
buy_price = 1000
sell_price = 1100
quantity = 400
exchange = 'NSE'

result_delivery = calculate_equity_delivery(buy_price, sell_price, quantity, exchange)

print(f"Net Profit: {result_delivery['net_profit']}")
print(f"Total Charges: {result_delivery['total_charges']}")
print(f"Points to Break-even: {result_delivery['points_to_breakeven']}\n")

# Example 3: Equity Futures Calculation
# -------------------------------------
# Calculate the charges and net profit/loss for an equity futures trade.

print("Equity Futures Calculation:")
buy_price = 1000
sell_price = 1100
quantity = 400
exchange = 'NSE'

result_futures = calculate_equity_futures(buy_price, sell_price, quantity, exchange)

print(f"Net Profit: {result_futures['net_profit']}")
print(f"Total Charges: {result_futures['total_charges']}")
print(f"Points to Break-even: {result_futures['points_to_breakeven']}\n")

# Example 4: Equity Options Calculation
# -------------------------------------
# Calculate the charges and net profit/loss for an equity options trade.

print("Equity Options Calculation:")
buy_price = 100  # Buy premium per lot
sell_price = 110  # Sell premium per lot
quantity = 400  # Number of lots
exchange = 'NSE'

result_options = calculate_equity_options(buy_price, sell_price, quantity, exchange)

print(f"Net Profit: {result_options['net_profit']}")
print(f"Total Charges: {result_options['total_charges']}")
print(f"Points to Break-even: {result_options['points_to_breakeven']}\n")

# Example 5: Currency Futures Calculation
# ---------------------------------------
# Calculate the charges and net profit/loss for a currency futures trade.

print("Currency Futures Calculation:")
buy_price = 74.50  # Buy price per unit
sell_price = 74.75  # Sell price per unit
quantity = 1  # Number of lots (each lot is typically 1000 units)
exchange = 'NSE'

result_currency_futures = calculate_currency_futures(buy_price, sell_price, quantity, exchange)

print(f"Net Profit: {result_currency_futures['net_profit']}")
print(f"Total Charges: {result_currency_futures['total_charges']}")
print(f"Points to Break-even: {result_currency_futures['points_to_breakeven']}\n")

# Example 6: Currency Options Calculation
# ---------------------------------------
# Calculate the charges and net profit/loss for a currency options trade.

print("Currency Options Calculation:")
buy_price = 0.50  # Buy premium per unit
sell_price = 0.75  # Sell premium per unit
quantity = 1  # Number of lots
exchange = 'NSE'

result_currency_options = calculate_currency_options(buy_price, sell_price, quantity, exchange)

print(f"Net Profit: {result_currency_options['net_profit']}")
print(f"Total Charges: {result_currency_options['total_charges']}")
print(f"Points to Break-even: {result_currency_options['points_to_breakeven']}\n")

# Example 7: Commodity Futures Calculation
# ----------------------------------------
# Calculate the charges and net profit/loss for a commodity futures trade.

print("Commodity Futures Calculation:")
buy_price = 48000  # Buy price per unit
sell_price = 48200  # Sell price per unit
quantity = 1  # Number of lots
multiplier = 1  # Multiplier depends on the commodity (e.g., Gold Mini has multiplier of 100)
exchange = 'MCX'

result_commodity_futures = calculate_commodity_futures(buy_price, sell_price, quantity, multiplier, exchange)

print(f"Net Profit: {result_commodity_futures['net_profit']}")
print(f"Total Charges: {result_commodity_futures['total_charges']}")
print(f"Points to Break-even: {result_commodity_futures['points_to_breakeven']}\n")

# Example 8: Commodity Options Calculation
# ----------------------------------------
# Calculate the charges and net profit/loss for a commodity options trade.

print("Commodity Options Calculation:")
buy_price = 100  # Buy premium per unit
sell_price = 120  # Sell premium per unit
quantity = 1  # Number of lots
multiplier = 100  # Multiplier depends on the commodity (e.g., Silver options may have different multiplier)
exchange = 'MCX'

result_commodity_options = calculate_commodity_options(buy_price, sell_price, quantity, multiplier, exchange)

print(f"Net Profit: {result_commodity_options['net_profit']}")
print(f"Total Charges: {result_commodity_options['total_charges']}")
print(f"Points to Break-even: {result_commodity_options['points_to_breakeven']}\n")
