# Equity Futures Trading Guide

Equity Futures are derivative contracts that allow you to buy or sell an underlying stock at a fixed price at a future date.

## Charge Breakdown

### 1. Brokerage
- **Rate**: 0.03% or Rs. 20 per executed order, whichever is lower.
- Applied on both buy and sell transactions.

### 2. STT/CTT
- **Rate**: 0.0125% only on the Sell side.

### 3. Transaction Charges
- **NSE**: 0.0019%
- **BSE**: 0.0005%

### 4. GST
- **Rate**: 18% on the sum of Brokerage and Transaction charges.

### 5. SEBI Charges
- **Rate**: Rs. 10 per crore of turnover.

### 6. Stamp Duty
- **Rate**: 0.002% or Rs. 200 per crore on the Buy side only.

## Mathematical Formula

The total charges (C) can be calculated as:
`C = B + STT + T + GST + SEBI + SD`

Where:
- `B = min(0.0003 * turnover, 20) * 2`
- `STT = 0.000125 * sell_value`
- `T = 0.000019 * total_turnover`
- `GST = 0.18 * (B + T)`
- `SEBI = 0.0000001 * total_turnover`
- `SD = 0.00002 * buy_value`

## Futures Trading Tips
- Futures offer high leverage, meaning you can control a large position with a small capital (margin).
- Always maintain sufficient margin to avoid MTM (Mark-to-Market) shortfalls.
- The break-even point is critical as it includes the cost of carry.
