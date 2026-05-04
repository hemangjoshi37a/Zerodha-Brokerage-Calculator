# Zerodha Brokerage Calculator: Complete User Guide

Welcome to the ultimate guide for using the Zerodha Brokerage Calculator. Whether you are a retail investor or a professional day trader, this guide will help you navigate the costs of trading.

## 🌟 Introduction

Trading in the Indian markets involves more than just the buy and sell price. A variety of taxes, levies, and brokerage charges are applied to every transaction. Our tool helps you see the "Net" result of your trade before you even execute it.

---

## 🚀 Getting Started with the Web UI

1. **Access the Dashboard**: Once the server is running, navigate to `http://127.0.0.1:5000`.
2. **Select Your Segment**: Use the dropdown to choose between Intraday, Delivery, F&O, etc.
3. **Enter Trade Details**:
   - **Buy Price**: Your entry price per unit.
   - **Sell Price**: Your planned exit price.
   - **Quantity**: Number of shares or lots.
4. **Analyze**: Click "Analyze Trade" to see the magic happen.

---

## 📈 Understanding the Results

### The Profit Display
The large number at the center shows your **Net Profit or Loss**.
- **Green**: You are making money after all taxes.
- **Red**: Your gross profit is being eaten up by charges, or you are in a direct loss.

### The Charts
- **Profit Scenarios**: Hover over the line chart to see how your profit changes if the sell price fluctuates by +/- 5%.
- **Charge Composition**: See how much of your cost is going to the broker vs. the Government (STT, GST, etc.).

---

## 📚 Glossary of Terms

### Brokerage
The fee charged by Zerodha for executing your trade. In delivery, this is ₹0. In other segments, it's typically capped at ₹20 per order.

### STT (Securities Transaction Tax)
A direct tax levied by the Government of India on the value of securities (except debt) traded on a recognized stock exchange.

### Turnover
The total value of your trade. Calculated as: `(Buy Price + Sell Price) * Quantity`.

### Break-even Points
The minimum movement required in the stock price to cover all your trading costs. If the stock moves more than this amount in your favor, you start making a net profit.

---

## 💡 Pro Tips for Traders

1. **Watch the Break-even**: Always ensure your target profit is significantly higher than the break-even points.
2. **Delivery is King**: For long-term wealth, prefer delivery trading to take advantage of the zero-brokerage model.
3. **Options are Tricky**: Remember that Option brokerage is flat per order. Trading very small quantities in options can lead to high percentage costs.
4. **Use the History**: Use the sidebar to compare different scenarios for the same stock.

---

## 🛠️ Troubleshooting

- **Server Not Found**: Ensure you have run `python app.py` and the terminal is still open.
- **Wrong Calculations**: Double-check the "Segment" selection. Each segment has vastly different tax structures.
- **Multiplier Issues**: For commodities, ensure you enter the correct contract multiplier (e.g., 100 for Gold Mini).

---

## 📞 Support and Feedback

If you encounter issues or have feature requests, please open an issue on our GitHub repository or contact the HJ Labs team.

---

*Happy Trading! May the markets be in your favor.*
