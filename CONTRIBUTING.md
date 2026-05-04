# Contributing to Zerodha Brokerage Calculator

Thank you for your interest in contributing to this project! This document outlines the standards and processes for making contributions.

## 🌈 Code of Conduct

By participating in this project, you agree to maintain a professional and respectful environment.

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.8+
- `pytest` for running the test suite
- `flask` for the web interface

### 2. Setting Up Your Environment
```bash
git clone https://github.com/your-username/Zerodha-Brokerage-Calculator.git
cd Zerodha-Brokerage-Calculator
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
pip install -e .
```

## 📝 Contribution Workflow

### 1. Identify an Issue
Check the GitHub Issues page or create a new one to discuss your proposed change.

### 2. Development
- Create a new branch: `git checkout -b feature/your-feature-name`.
- Implement your changes.
- Follow the PEP 8 style guide.
- Add docstrings to all new functions.

### 3. Testing
You **must** run the existing test suite and add new tests for your changes.
```bash
pytest tests/test_calculator.py
pytest tests/test_stress.py
```

### 4. Pull Request
Submit your PR with a clear description of:
- What was changed.
- Why it was changed.
- How it was tested.

## 🎨 Design Standards

### Python Code
- Use type hints wherever possible.
- Keep functions focused and small.
- Use meaningful variable names (e.g., `total_charges` instead of `tc`).

### Frontend (HTML/CSS)
- Maintain the premium, dark-mode aesthetic.
- Ensure responsiveness across mobile and desktop.
- Use CSS variables for colors.

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## 💬 Communication

If you have questions, feel free to open a discussion or contact the maintainers at `hemangjoshi37a@gmail.com`.

---

Thank you for making this tool better for the trading community! ❤️
