# Equity Options Trading Guide

Equity Options provide the right (but not the obligation) to buy or sell a stock at a specified price.

## Charge Breakdown

### 1. Brokerage
- **Rate**: Flat Rs. 20 per executed order.
- This is regardless of the premium value or quantity.

### 2. STT/CTT
- **Rate**: 0.0625% on the Sell side (on the premium value).
- STT is not charged on the buy side for option buyers.

### 3. Transaction Charges
- **NSE**: 0.053% (on the premium value).
- **BSE**: 0.0375% (on the premium value).

### 4. GST
- **Rate**: 18% on (Brokerage + Transaction Charges).

### 5. SEBI Charges
- **Rate**: Rs. 10 per crore.

### 6. Stamp Duty
- **Rate**: 0.003% or Rs. 300 per crore on the Buy side only.

## Mathematical Formula

The total charges (C) can be calculated as:
`C = B + STT + T + GST + SEBI + SD`

Where:
- `B = 20 * 2 = 40` (One buy and one sell order)
- `STT = 0.000625 * sell_premium_value`
- `T = 0.00053 * total_premium_turnover`
- `GST = 0.18 * (B + T)`
- `SEBI = 0.0000001 * total_premium_turnover`
- `SD = 0.00003 * buy_premium_value`

## Options Trading Tips
- Option premiums are highly volatile.
- Time decay (Theta) works against the buyer.
- Our calculator uses premium-based transaction charges as per the latest SEBI norms.
