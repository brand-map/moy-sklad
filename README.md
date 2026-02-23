# @brand-map/moy-sklad

TypeScript client for MoySklad JSON API.

## Installation

```bash
bun add @brand-map/moy-sklad
# or
npm i @brand-map/moy-sklad
# or
yarn add @brand-map/moy-sklad
```

## Exports

- `@brand-map/moy-sklad` exports `Moysklad`
- `@brand-map/moy-sklad/parts` exports:
  - `ApiClient`
  - `createApiClientFetcher`
  - `AssortmentEndpoint`
  - `BundleEndpoint`
  - `ImageEndpoint`
  - `ProductEndpoint`
  - `ReportEndpoint`
  - `ServiceEndpoint`
  - `VariantEndpoint`
  - `WebhookEndpoint`

## Quick Start (Moysklad class)

```ts
import { Moysklad } from "@brand-map/moy-sklad"

const moysklad = new Moysklad({
  auth: { token: "your-token" },
})

const products = await moysklad.product.list({
  pagination: { limit: 50, offset: 0 },
})

for await (const chunk of moysklad.product.allChunks({ filter: { archived: false } })) {
  console.log(chunk.rows.length)
}
```

## Quick Start (Parts)

```ts
import {
  ApiClient,
  ProductEndpoint,
  createApiClientFetcher,
} from "@brand-map/moy-sklad/parts"

const fetcher = createApiClientFetcher({ token: "your-token" })
const client = new ApiClient(fetcher)

const product = new ProductEndpoint(client)
const first = await product.first()
```

## Authentication

### Token

```ts
new Moysklad({
  auth: { token: "your-token" },
})
```

### Basic

```ts
new Moysklad({
  auth: {
    login: "your-login",
    password: "your-password",
  },
})
```

## Implemented Endpoints

### `assortment`

- `list`
- `all`
- `allChunks`
- `first`

### `bundle`

- `list`
- `all`
- `allChunks`
- `first`
- `byId`

### `image`

- `list`
- `all`
- `allChunks`
- `first`
- `create`
- `update`
- `delete`
- `batchDelete`

### `product`

- `list`
- `all`
- `allChunks`
- `first`
- `byId`

### `report`

- `stock`

### `service`

- `list`
- `all`
- `allChunks`
- `first`
- `byId`

### `variant`

- `list`
- `all`
- `allChunks`
- `first`
- `byId`

### `webhook`

- `list`
- `all`
- `allChunks`
- `first`
- `byId`
- `create`
- `update`
- `delete`
- `batchCreateOrUpdate`
- `batchDelete`

## Notes

- Some methods in endpoint files are intentionally not implemented yet and throw `Method not implemented.`.
- Integration tests are environment-gated and skipped by default.

## Development

```bash
bun run test:unit
bun run test:coverage
bun run test:integration
```
