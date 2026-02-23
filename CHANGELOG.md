# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Reports Endpoint** - New `report` endpoint for accessing Moysklad API reports
  - Stock report (`report.stock()`) - Get inventory stock reports with filtering and pagination
  - Supports grouping by product, store, or organization (`groupBy` option)
  - Comprehensive filter support: store, organization, counterparty, product folder, stock quantity, cost, and more
  - Full TypeScript type safety with conditional types based on `groupBy` option
- **Report Types** - Exported types for stock reports:
  - `StockReport` - Base stock report interface
  - `StockReportByProduct`, `StockReportByStore`, `StockReportByOrganization` - Grouped report types
  - `StockGroupBy` - Grouping option type
  - `StockReportModel` - Model for filter type inference
  - `GetStockReportResult<T>` - Conditional result type based on grouping

### Changed

- Added `report` property to `Moysklad` class for OOP-style API access

### Usage Example

```typescript
import { Moysklad } from "moy-sklad"

const moysklad = new Moysklad({
  auth: { token: "your-auth-token" },
})

// Get stock report
const { rows } = await moysklad.report.stock({
  filter: { store: "store-id", stock: { gt: 0 } },
  pagination: { limit: 50 },
})

// Get with grouping by store
const grouped = await moysklad.report.stock({
  groupBy: "store",
})
```
