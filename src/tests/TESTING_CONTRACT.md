# Testing Contract

This document defines expected behavior for request-shape unit tests and endpoint integration tests.

## Scope

- Unit tests target top-level endpoint files only:
  - `src/endpoints/assortment.ts`
  - `src/endpoints/bundle.ts`
  - `src/endpoints/image.ts`
  - `src/endpoints/product.ts`
  - `src/endpoints/report.ts`
  - `src/endpoints/service.ts`
  - `src/endpoints/variant.ts`
  - `src/endpoints/webhook.ts`
- Integration tests live beside unit tests under `src/tests/endpoints`.
- Network integration tests are disabled by default.

## Request Serialization Rules

1. Request method/path must match endpoint method intent.
2. `searchParameters` must include only defined values.
3. `undefined` and `null` values must not be serialized into query parameters.
4. Request body objects and arrays are JSON-serialized before dispatch.

## Pagination and Chunking Rules

1. `ApiClient.getAll(...)` accumulates rows from `getAllByChunks(...)`.
2. `ApiClient.getAllByChunks(...)` must:
   - always fetch page at `offset=0` first,
   - use `expandLimit` when `hasExpand=true`, otherwise use `limit`,
   - fetch remaining pages using offsets `limit, limit*2, ...`,
   - yield chunk rows in deterministic order.
3. Boundary behavior:
   - `size <= limit`: exactly one fetch,
   - `size > limit`: fetch all required pages.

## Expand + Limit Behavior

1. Collection requests with `expand` and no explicit pagination limit can default to `limit=100`.
2. Single-resource `byId` requests must not implicitly add `limit=100`.

## Endpoint Coverage Matrix

Each top-level endpoint has two test files:

- `src/tests/endpoints/<endpoint>.unit.test.ts`
- `src/tests/endpoints/<endpoint>.integration.test.ts`

Unit tests must cover all callable methods and branching behavior. Integration tests are smoke checks guarded by environment flags.

## Integration Test Gating

Integration suites run only when all are set:

- `MOYSKLAD_INTEGRATION=1`
- Valid credentials/environment for live API access

Otherwise integration suites are skipped.

## Current Not-Implemented Methods

The following methods currently throw by design and are unit-tested as throwing behavior:

- `ProductEndpoint.get`
- `ProductEndpoint.size`
- `ProductEndpoint.delete`
- `ProductEndpoint.update`
- `ProductEndpoint.upsert`
- `ProductEndpoint.batchDelete`
- `ProductEndpoint.trash`
- `ProductEndpoint.audit`
- `AssortmentEndpoint.size`

When these methods are implemented, tests must be switched from throw assertions to request-shape assertions.
