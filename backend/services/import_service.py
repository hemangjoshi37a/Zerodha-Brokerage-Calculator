from backend.models.trade import db, TradeHistory
from backend.services.calculator_service import CalculatorService

class ImportService:
    @staticmethod
    def bulk_import(trades: list[dict]) -> dict:
        """
        Takes a list of raw trade dictionaries (parsed from CSV),
        maps them to the required calculation format,
        and saves them using CalculatorService.
        """
        success_count = 0
        failed_count = 0
        errors = []

        for index, row in enumerate(trades):
            try:
                # Basic mapping from Zerodha Tradebook to our format
                # Expected fields from frontend mapping:
                # segment, exchange, buy_price, sell_price, quantity
                
                segment = row.get('segment')
                buy_price = float(row.get('buy_price', 0))
                sell_price = float(row.get('sell_price', 0))
                quantity = int(row.get('quantity', 0))
                exchange = row.get('exchange', 'NSE')
                
                if not segment:
                    raise ValueError("Missing 'segment'")
                if buy_price <= 0 and sell_price <= 0:
                    raise ValueError("Both buy and sell price cannot be zero")
                if quantity <= 0:
                    raise ValueError("Quantity must be greater than zero")

                req_data = {
                    "segment": segment,
                    "exchange": exchange,
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "quantity": quantity,
                    "multiplier": float(row.get('multiplier', 1)),
                    "notes": row.get('notes', 'Imported from CSV'),
                    "tags": row.get('tags', ['imported'])
                }

                CalculatorService.calculate_and_save(req_data)
                success_count += 1
            except Exception as e:
                failed_count += 1
                errors.append({"row": index + 1, "error": str(e), "data": row})

        return {
            "total_processed": len(trades),
            "success": success_count,
            "failed": failed_count,
            "errors": errors[:50] # Limit errors returned
        }
