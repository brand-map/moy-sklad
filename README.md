# moy-sklad

TypeScript implementation of the Moysklad API client with full type support and comprehensive error handling.

## Installation

```bash
bun install
# or
npm install
# or
yarn install
```

## Quick Start

```typescript
import { ApiClient, listProducts, allProducts } from 'moy-sklad'

// Create API client
const client = new ApiClient({
  auth: {
    token: 'your-auth-token'
  }
})

// Get list of products
const products = await listProducts(client, {
  pagination: { limit: 50, offset: 0 }
})

// Get all products with auto pagination
const allItems = await allProducts(client, {
  expand: ['images', 'variants']
})
```

## Supported Endpoints

### Products
- `listProducts()` - Get list of products
- `allProducts()` - Get all products (with auto pagination)
- `firstProduct()` - Get first product matching filter
- `productById()` - Get specific product by ID

### Services
- `listServices()` - Get list of services
- `allServices()` - Get all services
- `firstService()` - Get first service
- `serviceById()` - Get specific service by ID

### Bundles
- `listBundles()` - Get list of bundles
- `allBundles()` - Get all bundles
- `firstBundle()` - Get first bundle
- `bundleById()` - Get specific bundle by ID

### Variants
- `listVariants()` - Get list of variants
- `allVariants()` - Get all variants
- `firstVariant()` - Get first variant
- `variantById()` - Get specific variant by ID

### Webhooks
- `listWebhooks()` - Get list of webhooks
- `createWebhook()` - Create new webhook
- `updateWebhook()` - Update webhook
- `deleteWebhook()` - Delete webhook
- `getWebhook()` - Get specific webhook
- `batchCreateOrUpdateWebhooks()` - Batch create/update
- `batchDeleteWebhooks()` - Batch delete

### Assortment
- `listAssortment()` - Get list of assortment items
- `allAssortment()` - Get all assortment items
- `firstAssortment()` - Get first assortment item

## Usage Examples

### Basic Filtering and Pagination

```typescript
const products = await listProducts(client, {
  pagination: { limit: 25, offset: 50 },
  filter: { name: 'Widget' },
  order: 'name'
})
```

### Creating Webhooks

```typescript
const webhook = await createWebhook(client, {
  url: 'https://example.com/webhook',
  action: 'create',
  entityType: 'product'
})
```

## Type Safety

All operations are fully typed for excellent IDE support:

```typescript
import type { Product, Webhook, Service } from 'moy-sklad'

const product: Product = await productById(client, 'id')
```

## Authentication

### Token Authentication

```typescript
const client = new ApiClient({
  auth: {
    token: 'your-auth-token'
  },
  // Optional: customize rate limiting
  tolerateTimeout: 5000
})
```

### Basic Authentication

```typescript
const client = new ApiClient({
  auth: {
    login: 'username',
    password: 'password'
  }
})
```

## Rate Limiting

The library automatically handles Moysklad API rate limiting with a token bucket strategy. Rate limits are calculated based on:
- Authentication type (token vs user credentials)
- Request time during peak hours

## Utility Functions

The library includes helpful utilities:

```typescript
import { 
  parseDateTime, 
  composeDateTime, 
  extractIdFromMetaHref,
  isAssortmentOfType 
} from 'moy-sklad'

// Parse API datetime format
const date = parseDateTime('2024-02-15T10:30:00.000')

// Compose datetime for API
const isoString = composeDateTime(new Date())

// Extract ID from meta href
const id = extractIdFromMetaHref('https://api.moysklad.ru/api/remap/1.2/entity/product/xyz')

// Check assortment type
const isProduct = isAssortmentOfType('product', assortmentItem)
```

## Development

```bash
bun run src/test.ts
```

## License

MIT
