from flask import Blueprint, request, jsonify
from pydantic import BaseModel, Field, ValidationError
from backend.services.calculator_service import CalculatorService
from backend.services.price_service import PriceService
from backend.services.tax_service import TaxService
from backend.models.trade import TradeHistory

api_bp = Blueprint('api', __name__)

class CalculationRequest(BaseModel):
    segment: str
    exchange: str = "NSE"
    buy_price: float = Field(gt=0)
    sell_price: float = Field(gt=0)
    quantity: int = Field(gt=0)
    multiplier: float = 1.0
    notes: str = None
    tags: list[str] = None
    rating: int = None

@api_bp.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate input
        req_data = CalculationRequest(**data)
        
        # Calculate and save
        result = CalculatorService.calculate_and_save(req_data.model_dump())
        return jsonify(result), 201
    
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An internal error occurred", "details": str(e)}), 500

@api_bp.route('/history', methods=['GET'])
def get_history():
    try:
        history = CalculatorService.get_history()
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/history/<int:trade_id>', methods=['PATCH'])
def update_trade_journal(trade_id):
    try:
        data = request.get_json()
        result = CalculatorService.update_journal(trade_id, data)
        if result:
            return jsonify(result), 200
        return jsonify({"error": "Trade not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/history/<int:trade_id>', methods=['DELETE'])
def delete_trade(trade_id):
    try:
        success = CalculatorService.delete_trade(trade_id)
        if success:
            return jsonify({"message": "Trade deleted successfully"}), 200
        return jsonify({"error": "Trade not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@api_bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        from_date = request.args.get('from')
        to_date = request.args.get('to')
        stats = CalculatorService.get_stats(from_date=from_date, to_date=to_date)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_bp.route('/quote', methods=['GET'])
def get_quote():
    """Fetch live/delayed price for an Indian stock ticker.
    Query params: symbol (required), exchange (optional, default NSE)
    """
    try:
        symbol = request.args.get('symbol', '').strip()
        exchange = request.args.get('exchange', 'NSE').strip()
        if not symbol:
            return jsonify({"error": "symbol query parameter is required"}), 400
        data = PriceService.get_quote(symbol, exchange)
        return jsonify(data), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Price feed unavailable", "details": str(e)}), 503


@api_bp.route('/tax-estimate', methods=['GET'])
def get_tax_estimate():
    """Estimate tax liability across all saved trades."""
    try:
        trades = TradeHistory.query.order_by(TradeHistory.created_at.asc()).all()
        trade_dicts = [t.to_dict() for t in trades]
        result = TaxService.estimate_tax(trade_dicts)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@api_bp.route('/compare', methods=['POST'])
def compare_scenarios():
    """Calculate multiple trade scenarios at once without saving to DB."""
    try:
        data = request.get_json()
        scenarios = data.get('scenarios', [])
        if not scenarios or len(scenarios) > 4:
            return jsonify({"error": "Provide between 1 and 4 scenarios"}), 400

        results = []
        for scenario in scenarios:
            req = CalculationRequest(**scenario)
            result = CalculatorService.calculate_only(req.model_dump())
            results.append(result)

        return jsonify({"scenarios": results}), 200

    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_bp.route('/target-price', methods=['POST'])
def target_price():
    """Reverse-calculate: given a desired net profit, what exit price is required?"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        segment = data.get('segment')
        exchange = data.get('exchange', 'NSE')
        buy_price = float(data.get('buy_price', 0))
        quantity = int(data.get('quantity', 0))
        multiplier = float(data.get('multiplier', 1))
        target_profit = float(data.get('target_profit', 0))
        stop_loss_pct = float(data.get('stop_loss_pct', 0))

        if not all([segment, buy_price, quantity]):
            return jsonify({"error": "segment, buy_price, and quantity are required"}), 400

        result = CalculatorService.calculate_target_price(
            segment=segment,
            exchange=exchange,
            buy_price=buy_price,
            quantity=quantity,
            multiplier=multiplier,
            target_profit=target_profit,
            stop_loss_pct=stop_loss_pct
        )
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_bp.route('/export/csv', methods=['GET'])
def export_csv():
    import csv
    import io
    from flask import make_response
    
    try:
        history = CalculatorService.get_history()
        if not history:
            return jsonify({"error": "No data to export"}), 400
            
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        headers = ['ID', 'Date', 'Segment', 'Exchange', 'Buy Price', 'Sell Price', 'Quantity', 'Turnover', 'Brokerage', 'STT', 'TXN Charges', 'SEBI', 'GST', 'Stamp Duty', 'Total Charges', 'Net P&L']
        writer.writerow(headers)
        
        # Data
        for trade in history:
            res = trade['results']
            writer.writerow([
                trade['id'],
                trade['created_at'],
                trade['segment'],
                trade['exchange'],
                trade['buy_price'],
                trade['sell_price'],
                trade['quantity'],
                res['turnover'],
                res['brokerage'],
                res['stt'],
                res['exchange_txn_charges'],
                res['sebi_charges'],
                res['gst'],
                res['stamp_duty'],
                res['total_charges'],
                res['net_profit']
            ])
            
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=trade_history.csv"
        response.headers["Content-type"] = "text/csv"
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
