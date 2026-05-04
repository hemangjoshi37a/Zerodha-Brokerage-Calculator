# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2024-05-04

### Added
- **Premium Web Dashboard**: A fully functional Flask-based frontend with ultra-premium CSS.
- **Data Visualization**: Integrated Chart.js for profit projection and charge composition.
- **Trade History**: Persistence layer using LocalStorage to track recent calculations.
- **Comprehensive Documentation**: Added a full `docs/` suite with segment-specific guides and API references.
- **Stress Testing**: Added `tests/test_stress.py` with 1,000+ test permutations.
- **Utility Module**: New `utils/helpers.py` for high-precision math and formatting.
- **Sample Data Engine**: New `scripts/generate_sample_data.py` for automated test case generation.

### Fixed
- **Encoding Issues**: Fixed `UnicodeDecodeError` in `setup.py` when reading UTF-8 files on Windows.
- **Precision Errors**: Refined the break-even calculation logic for penny stocks.

### Changed
- **UI Design**: Migrated from a basic HTML layout to a high-fidelity glassmorphic dashboard.
- **README**: Completely overhauled the documentation for clarity and technical depth.

## [0.1.5] - 2024-03-20

### Added
- Support for MCX Commodity Options.
- Parameterized multipliers for gold and silver contracts.

### Fixed
- GST rounding issue on high-value trades.

## [0.1.0] - 2024-01-15

### Added
- Initial release of the core calculator package.
- Support for Equity Intraday, Delivery, Futures, and Options.
- Basic command-line example script.

---

## Future Roadmap
- [ ] Mobile App integration using React Native.
- [ ] Real-time price updates via WebSocket.
- [ ] Multi-user profiles and cloud-synced trade journals.

[0.2.0]: https://github.com/hemangjoshi37a/Zerodha-Brokerage-Calculator/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/hemangjoshi37a/Zerodha-Brokerage-Calculator/compare/v0.1.0...v0.1.5
[0.1.0]: https://github.com/hemangjoshi37a/Zerodha-Brokerage-Calculator/releases/tag/v0.1.0
