import math
from typing import Dict

class GreeksService:
    """
    Computes Option Greeks using the Black-Scholes-Merton model with pure math.
    """

    @staticmethod
    def _phi(x: float) -> float:
        """Standard normal probability density function (PDF)."""
        return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)

    @staticmethod
    def _Phi(x: float) -> float:
        """Standard normal cumulative distribution function (CDF) using an approximation."""
        # Constants for approximation
        a1 =  0.254829592
        a2 = -0.284496736
        a3 =  1.421413741
        a4 = -1.453152027
        a5 =  1.061405429
        p  =  0.3275911

        sign = 1 if x >= 0 else -1
        x_abs = abs(x) / math.sqrt(2.0)

        t = 1.0 / (1.0 + p * x_abs)
        y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * math.exp(-x_abs * x_abs)

        return 0.5 * (1.0 + sign * y)

    @staticmethod
    def calculate_greeks(
        S: float,      # Current underlying price
        K: float,      # Strike price
        T: float,      # Time to expiration in years
        r: float,      # Risk-free interest rate (e.g., 0.05 for 5%)
        v: float,      # Volatility (e.g., 0.20 for 20%)
        is_call: bool  # True for Call, False for Put
    ) -> Dict[str, float]:
        """
        Calculate Delta, Gamma, Theta, Vega, and Rho.
        Handles edge cases for T=0 or v=0.
        """
        if T <= 0.0 or v <= 0.0:
            # At expiration or zero vol
            intrinsic = max(S - K, 0) if is_call else max(K - S, 0)
            delta = (1.0 if S > K else 0.0) if is_call else (-1.0 if S < K else 0.0)
            if S == K:
                delta = 0.5 if is_call else -0.5 # At-the-money edge case
            return {
                "price": round(intrinsic, 4),
                "delta": round(delta, 4),
                "gamma": 0.0,
                "theta": 0.0,
                "vega": 0.0,
                "rho": 0.0
            }

        d1 = (math.log(S / K) + (r + 0.5 * v**2) * T) / (v * math.sqrt(T))
        d2 = d1 - v * math.sqrt(T)

        pdf_d1 = GreeksService._phi(d1)
        cdf_d1 = GreeksService._Phi(d1)
        cdf_d2 = GreeksService._Phi(d2)

        # Gamma and Vega are identical for calls and puts
        gamma = pdf_d1 / (S * v * math.sqrt(T))
        vega = S * pdf_d1 * math.sqrt(T) * 0.01 # 1% change in vol

        if is_call:
            price = S * cdf_d1 - K * math.exp(-r * T) * cdf_d2
            delta = cdf_d1
            theta = (- (S * v * pdf_d1) / (2 * math.sqrt(T)) 
                     - r * K * math.exp(-r * T) * cdf_d2) / 365.0 # 1 day decay
            rho = K * T * math.exp(-r * T) * cdf_d2 * 0.01 # 1% change in rate
        else:
            cdf_minus_d1 = GreeksService._Phi(-d1)
            cdf_minus_d2 = GreeksService._Phi(-d2)
            
            price = K * math.exp(-r * T) * cdf_minus_d2 - S * cdf_minus_d1
            delta = cdf_d1 - 1.0
            theta = (- (S * v * pdf_d1) / (2 * math.sqrt(T)) 
                     + r * K * math.exp(-r * T) * cdf_minus_d2) / 365.0
            rho = -K * T * math.exp(-r * T) * cdf_minus_d2 * 0.01

        return {
            "price": round(price, 4),
            "delta": round(delta, 4),
            "gamma": round(gamma, 4),
            "theta": round(theta, 4),
            "vega": round(vega, 4),
            "rho": round(rho, 4)
        }

    @staticmethod
    def calculate_strategy_greeks(legs: list[dict], current_price: float, dte: int, volatility: float, risk_free_rate: float = 0.07) -> dict:
        """
        Calculates aggregate greeks for an entire option strategy.
        dte = Days To Expiry.
        """
        T = dte / 365.0
        v = volatility / 100.0 # Convert from percentage
        
        total_delta = 0.0
        total_gamma = 0.0
        total_theta = 0.0
        total_vega = 0.0

        for leg in legs:
            is_call = leg['type'].lower() == 'call'
            strike = leg['strike']
            qty = leg['lot_size'] * leg.get('quantity', 1)
            is_buy = leg['action'].lower() == 'buy'
            
            greeks = GreeksService.calculate_greeks(
                S=current_price,
                K=strike,
                T=T,
                r=risk_free_rate,
                v=v,
                is_call=is_call
            )
            
            sign = 1 if is_buy else -1
            
            total_delta += greeks['delta'] * qty * sign
            total_gamma += greeks['gamma'] * qty * sign
            total_theta += greeks['theta'] * qty * sign
            total_vega += greeks['vega'] * qty * sign
            
        return {
            "net_delta": round(total_delta, 2),
            "net_gamma": round(total_gamma, 4),
            "net_theta": round(total_theta, 2),
            "net_vega": round(total_vega, 2)
        }
