# calculator.py

def calculate_equity_intraday(buy_price, sell_price, quantity, exchange='NSE'):
    # Turnover
    turnover = (buy_price + sell_price) * quantity

    # Brokerage
    brokerage_buy = min(0.0003 * buy_price * quantity, 20)
    brokerage_sell = min(0.0003 * sell_price * quantity, 20)
    brokerage = brokerage_buy + brokerage_sell

    # STT on sell side only, 0.025%
    stt = 0.00025 * sell_price * quantity

    # Exchange Transaction Charges
    etc_rate = 0.0000345  # 0.00345%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00003 * buy_price * quantity

    # Total Charges
    total_charges = brokerage + stt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / quantity

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'stt': stt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result

def calculate_equity_delivery(buy_price, sell_price, quantity, exchange='NSE'):
    # Turnover
    turnover = (buy_price + sell_price) * quantity

    # Brokerage is zero
    brokerage = 0.0

    # STT is 0.1% on both buy and sell sides
    stt = 0.001 * (buy_price * quantity + sell_price * quantity)

    # Exchange Transaction Charges
    etc_rate = 0.0000345  # 0.00345%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00015 * buy_price * quantity

    # Total Charges
    total_charges = brokerage + stt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / quantity

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'stt': stt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result

def calculate_equity_futures(buy_price, sell_price, quantity, exchange='NSE'):
    # Turnover
    turnover = (buy_price + sell_price) * quantity

    # Brokerage
    brokerage_buy = min(0.0003 * buy_price * quantity, 20)
    brokerage_sell = min(0.0003 * sell_price * quantity, 20)
    brokerage = brokerage_buy + brokerage_sell

    # STT on sell side only, 0.01%
    stt = 0.0001 * sell_price * quantity

    # Exchange Transaction Charges
    etc_rate = 0.00002  # 0.002%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00002 * buy_price * quantity

    # Total Charges
    total_charges = brokerage + stt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / quantity

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'stt': stt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result

def calculate_equity_options(buy_price, sell_price, quantity, exchange='NSE'):
    # Turnover
    turnover = (buy_price + sell_price) * quantity

    # Brokerage
    brokerage = 20 + 20  # Flat Rs. 20 per order per side

    # STT on sell side only, 0.05% of sell premium
    stt = 0.0005 * sell_price * quantity

    # Exchange Transaction Charges
    etc_rate = 0.00053  # 0.053%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00003 * buy_price * quantity

    # Total Charges
    total_charges = brokerage + stt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / quantity

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'stt': stt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result

def calculate_currency_futures(buy_price, sell_price, quantity, exchange='NSE'):
    # Turnover
    turnover = (buy_price + sell_price) * quantity * 1000  # Lot size is 1000

    # Brokerage
    brokerage_buy = min(0.0003 * buy_price * quantity * 1000, 20)
    brokerage_sell = min(0.0003 * sell_price * quantity * 1000, 20)
    brokerage = brokerage_buy + brokerage_sell

    # STT: None for currency futures
    stt = 0.0

    # Exchange Transaction Charges
    etc_rate = 0.000009  # 0.0009%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00002 * buy_price * quantity * 1000

    # Total Charges
    total_charges = brokerage + stt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity * 1000

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / (quantity * 1000)

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'stt': stt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result

def calculate_currency_options(buy_price, sell_price, quantity, exchange='NSE'):
    # Turnover
    turnover = (buy_price + sell_price) * quantity * 1000  # Lot size is 1000

    # Brokerage
    brokerage = 20 + 20  # Flat Rs. 20 per order per side

    # STT: None for currency options
    stt = 0.0

    # Exchange Transaction Charges
    etc_rate = 0.00035  # 0.035%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00003 * buy_price * quantity * 1000

    # Total Charges
    total_charges = brokerage + stt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity * 1000

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / (quantity * 1000)

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'stt': stt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result

def calculate_commodity_futures(buy_price, sell_price, quantity, multiplier, exchange='MCX'):
    # Turnover
    turnover = (buy_price + sell_price) * quantity * multiplier

    # Brokerage
    brokerage_buy = min(0.0003 * buy_price * quantity * multiplier, 20)
    brokerage_sell = min(0.0003 * sell_price * quantity * multiplier, 20)
    brokerage = brokerage_buy + brokerage_sell

    # CTT on sell side only, 0.01%
    ctt = 0.0001 * sell_price * quantity * multiplier

    # Exchange Transaction Charges
    etc_rate = 0.000026  # 0.0026%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00002 * buy_price * quantity * multiplier

    # Total Charges
    total_charges = brokerage + ctt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity * multiplier

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / (quantity * multiplier)

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'ctt': ctt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result

def calculate_commodity_options(buy_price, sell_price, quantity, multiplier, exchange='MCX'):
    # Turnover (premium turnover)
    turnover = (buy_price + sell_price) * quantity * multiplier

    # Brokerage
    brokerage = 20 + 20  # Flat Rs. 20 per order per side

    # CTT on sell side only, 0.05% of sell premium
    ctt = 0.0005 * sell_price * quantity * multiplier

    # Exchange Transaction Charges
    etc_rate = 0.00053  # 0.053%
    etc = etc_rate * turnover

    # SEBI Charges
    sebi_charges = 0.000001 * turnover

    # GST
    gst = 0.18 * (brokerage + etc)

    # Stamp Duty on buy side only
    stamp_duty = 0.00003 * buy_price * quantity * multiplier

    # Total Charges
    total_charges = brokerage + ctt + etc + gst + sebi_charges + stamp_duty

    # Gross Profit
    gross_profit = (sell_price - buy_price) * quantity * multiplier

    # Net P&L
    net_pnl = gross_profit - total_charges

    # Points to breakeven
    points_to_breakeven = total_charges / (quantity * multiplier)

    result = {
        'turnover': turnover,
        'brokerage': brokerage,
        'ctt': ctt,
        'exchange_txn_charges': etc,
        'sebi_charges': sebi_charges,
        'gst': gst,
        'stamp_duty': stamp_duty,
        'total_charges': total_charges,
        'gross_profit': gross_profit,
        'net_profit': net_pnl,
        'points_to_breakeven': points_to_breakeven,
    }

    return result
