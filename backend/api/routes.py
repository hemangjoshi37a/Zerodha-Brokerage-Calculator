from flask import Blueprint, request, jsonify
from pydantic import BaseModel, Field, ValidationError
from backend.services.calculator_service import CalculatorService

api_bp = Blueprint('api', __name__)

class CalculationRequest(BaseModel):
    segment: str
    exchange: str = "NSE"
    buy_price: float = Field(gt=0)
    sell_price: float = Field(gt=0)
    quantity: int = Field(gt=0)
    multiplier: float = 1.0

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
        stats = CalculatorService.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
