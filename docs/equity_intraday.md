# Equity Intraday Trading Guide

Equity Intraday refers to the buying and selling of stocks on the same trading day. If you don't square off your position before the market closes, the broker may automatically square it off, often for an additional fee.

## Charge Breakdown

### 1. Brokerage
- **Rate**: 0.03% or Rs. 20 per executed order, whichever is lower.
- **Example**: If you buy stocks worth Rs. 100,000, the brokerage is Rs. 30, but it will be capped at Rs. 20.

### 2. Securities Transaction Tax (STT)
- **Rate**: 0.025% only on the Sell side.
- **Note**: STT is not charged on the buy side for intraday trades.

### 3. Transaction Charges
- **NSE**: 0.00325%
- **BSE**: 0.00375%
- These charges are applied to the total turnover (Buy + Sell).

### 4. GST
- **Rate**: 18% applied on the sum of (Brokerage + Transaction Charges).

### 5. SEBI Charges
- **Rate**: Rs. 10 per crore of turnover.
- This is a flat fee regardless of the segment but scales with volume.

### 6. Stamp Duty
- **Rate**: 0.003% or Rs. 300 per crore on the Buy side only.

## Mathematical Formula

The total charges (C) can be calculated as:
`C = B + STT + T + GST + SEBI + SD`

Where:
- `B = min(0.0003 * turnover, 20)`
- `STT = 0.00025 * sell_value`
- `T = 0.0000325 * total_turnover`
- `GST = 0.18 * (B + T)`
- `SEBI = 0.0000001 * total_turnover`
- `SD = 0.00003 * buy_value`

## Trading Strategy Tips
- Focus on high-liquidity stocks to minimize impact cost.
- Use stop-loss orders to manage risk.
- Pay close attention to the break-even points provided by our calculator.
