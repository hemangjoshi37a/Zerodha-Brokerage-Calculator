import numpy as np

class StrategyService:
    @staticmethod
    def calculate_payoff(current_price: float, legs: list[dict]) -> dict:
        """
        Calculate payoff chart data, max profit, max loss, and breakevens for an options strategy.
        
        legs format:
        [
            {
                "type": "call" | "put",
                "action": "buy" | "sell",
                "strike": float,
                "premium": float,
                "lot_size": int,
                "quantity": int (number of lots)
            }
        ]
        """
        if not legs:
            return {"error": "No legs provided"}

        # Determine price range for the chart (±20% of current price or derived from strikes)
        strikes = [leg['strike'] for leg in legs]
        min_strike = min(strikes) if strikes else current_price
        max_strike = max(strikes) if strikes else current_price
        
        lower_bound = min(current_price * 0.8, min_strike * 0.8)
        upper_bound = max(current_price * 1.2, max_strike * 1.2)
        
        # Generate underlying prices at expiry
        prices = np.linspace(lower_bound, upper_bound, 200)
        total_payoff = np.zeros_like(prices)
        
        # Calculate payoff for each leg
        for leg in legs:
            strike = leg['strike']
            premium = leg['premium']
            qty = leg['lot_size'] * leg.get('quantity', 1)
            is_call = leg['type'].lower() == 'call'
            is_buy = leg['action'].lower() == 'buy'
            
            # Intrinsic value at expiry
            if is_call:
                intrinsic = np.maximum(prices - strike, 0)
            else:
                intrinsic = np.maximum(strike - prices, 0)
                
            # Net payoff
            if is_buy:
                payoff = (intrinsic - premium) * qty
            else:
                payoff = (premium - intrinsic) * qty
                
            total_payoff += payoff

        # Calculate metrics
        max_profit = float(np.max(total_payoff))
        max_loss = float(np.min(total_payoff))
        
        # Handle theoretical infinite profit/loss
        is_infinite_profit = False
        is_infinite_loss = False
        
        # Check endpoints to see if profit/loss is unbounded
        if total_payoff[0] > max_profit * 0.95 or total_payoff[-1] > max_profit * 0.95:
            if max_profit > 100000: # Arbitrary high number checking
                 is_infinite_profit = True
        
        # Determine breakeven points (where payoff crosses 0)
        breakevens = []
        for i in range(len(prices) - 1):
            if (total_payoff[i] < 0 and total_payoff[i+1] > 0) or \
               (total_payoff[i] > 0 and total_payoff[i+1] < 0):
                # Linear interpolation for exact zero crossing
                x0, y0 = prices[i], total_payoff[i]
                x1, y1 = prices[i+1], total_payoff[i+1]
                zero_x = x0 - y0 * (x1 - x0) / (y1 - y0)
                breakevens.append(round(float(zero_x), 2))
                
        # Format chart data for frontend
        chart_data = []
        for p, v in zip(prices, total_payoff):
            chart_data.append({"underlying": round(float(p), 2), "pnl": round(float(v), 2)})
            
        return {
            "max_profit": "Infinite" if is_infinite_profit else round(max_profit, 2),
            "max_loss": "Infinite" if is_infinite_loss else round(max_loss, 2),
            "breakevens": sorted(list(set(breakevens))),
            "chart_data": chart_data
        }
