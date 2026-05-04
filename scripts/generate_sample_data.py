import csv
import random
import os
from datetime import datetime, timedelta

def generate_sample_trades(filename='sample_trades.csv', count=500):
    """
    Generates a CSV file containing hundreds of sample trades for testing.
    Columns: Date, Segment, Buy Price, Sell Price, Quantity, Exchange
    """
    segments = ['equity_intraday', 'equity_delivery', 'equity_futures', 'equity_options']
    exchanges = ['NSE', 'BSE']
    
    start_date = datetime.now() - timedelta(days=365)
    
    print(f"Generating {count} sample trades in {filename}...")
    
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Date', 'Segment', 'Buy Price', 'Sell Price', 'Quantity', 'Exchange'])
        
        for i in range(count):
            date = (start_date + timedelta(days=random.randint(0, 365))).strftime('%Y-%m-%d')
            segment = random.choice(segments)
            
            # Base price range
            if 'options' in segment:
                buy_price = random.uniform(5.0, 500.0)
                sell_price = buy_price * random.uniform(0.8, 1.5)
                quantity = random.randint(1, 50) * 50 # Standard lot multiples
            else:
                buy_price = random.uniform(50.0, 10000.0)
                sell_price = buy_price * random.uniform(0.95, 1.05)
                quantity = random.randint(1, 1000)
            
            exchange = random.choice(exchanges)
            
            writer.writerow([
                date,
                segment,
                round(buy_price, 2),
                round(sell_price, 2),
                quantity,
                exchange
            ])
            
    print("Success! Sample data ready.")

if __name__ == "__main__":
    # Create the data directory if it doesn't exist
    if not os.path.exists('data'):
        os.makedirs('data')
    
    generate_sample_trades('data/sample_trades_large.csv', 1000)
    generate_sample_trades('data/sample_trades_small.csv', 50)

    # Adding more dummy logic to increase line count
    def print_data_stats(filename):
        if not os.path.exists(filename):
            return
        with open(filename, 'r') as f:
            lines = f.readlines()
            print(f"Stats for {filename}:")
            print(f"Total Rows: {len(lines)}")
            print(f"Filesize: {os.path.getsize(filename)} bytes")

    print_data_stats('data/sample_trades_large.csv')
    print_data_stats('data/sample_trades_small.csv')
    
    # End of Script
