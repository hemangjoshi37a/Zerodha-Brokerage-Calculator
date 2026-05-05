# Zerodha Brokerage Calculator - Industry Level

A professional full-stack application for calculating Zerodha brokerage and taxes with a high-fidelity React dashboard.

## 🚀 Architecture
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query.
- **Backend**: Flask (Python), SQLAlchemy (SQLite), Pydantic validation, Marshmallow.
- **Base Logic**: Modular calculation engine for all Zerodha segments.

## 🛠️ Project Structure
```text
.
├── backend/                # Professional Flask API
│   ├── api/                # Blueprints & Routes
│   ├── core/               # Configuration
│   ├── models/             # Database Schemas
│   └── services/           # Business Logic
├── frontend/               # Modern React SPA
│   ├── src/
│   │   ├── components/     # Atomic UI
│   │   ├── features/       # Modular Logic (Calculator, History)
│   │   ├── hooks/          # API Hooks
│   │   └── providers/      # App Contexts
├── zerodha_brokerage_calculator/ # Core Calculation Engine
└── app.py                  # Main Entry Point
```

## 🚦 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+

### 1. Setup Backend
```bash
pip install -r requirements.txt
python app.py
```
The API will run on `http://localhost:5000/api`.

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## ✨ Features
- **Precise Calculations**: Covers Equity, Currency, and Commodity segments.
- **Persistent History**: Saves all calculations to a local SQLite database.
- **Interactive Visualization**: Real-time charts for charges composition and profit projections.
- **Premium UI**: Glassmorphism design with smooth Framer Motion animations.
- **Type Safety**: End-to-end TypeScript and Pydantic validation.
