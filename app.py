from flask import Flask, render_template, request, jsonify
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

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        segment = data.get('segment')
        buy_price = float(data.get('buy_price', 0))
        sell_price = float(data.get('sell_price', 0))
        quantity = int(data.get('quantity', 0))
        exchange = data.get('exchange', 'NSE')
        multiplier = float(data.get('multiplier', 1))

        if segment == 'equity_intraday':
            result = calculate_equity_intraday(buy_price, sell_price, quantity, exchange)
        elif segment == 'equity_delivery':
            result = calculate_equity_delivery(buy_price, sell_price, quantity, exchange)
        elif segment == 'equity_futures':
            result = calculate_equity_futures(buy_price, sell_price, quantity, exchange)
        elif segment == 'equity_options':
            result = calculate_equity_options(buy_price, sell_price, quantity, exchange)
        elif segment == 'currency_futures':
            result = calculate_currency_futures(buy_price, sell_price, quantity, exchange)
        elif segment == 'currency_options':
            result = calculate_currency_options(buy_price, sell_price, quantity, exchange)
        elif segment == 'commodity_futures':
            result = calculate_commodity_futures(buy_price, sell_price, quantity, multiplier, exchange)
        elif segment == 'commodity_options':
            result = calculate_commodity_options(buy_price, sell_price, quantity, multiplier, exchange)
        else:
            return jsonify({'error': 'Invalid segment'}), 400

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
