// /**
//  * Moysklad API Client Library
//  *
//  * A fully typed TypeScript client for the Moysklad API with comprehensive
//  * support for products, services, bundles, variants, webhooks, and more.
//  *
//  * @example
//  * ```typescript
//  * import { ApiClient, listProducts } from 'moy-sklad'
//  *
//  * const client = new ApiClient({
//  *   auth: { token: 'your-token' }
//  * })
//  *
//  * const products = await listProducts(client)
//  * ```
//  */

// // ============================================================================
// // API CLIENT AND AUTHENTICATION
// // ============================================================================

// export { ApiClient } from "./api-client"
// export type { ApiClientOptions, } from "./api-client"
// export { Moysklad } from "./moysklad"

// // ============================================================================
// // ERROR HANDLING
// // ============================================================================

// export * from "./errors"

// // ============================================================================
// // TYPE DEFINITIONS
// // ============================================================================

// /**
//  * Core types for API operations, responses, and domain models
//  */
// export * from "./types"

// // ============================================================================
// // ENDPOINT FUNCTIONS - Products
// // ============================================================================

// /**
//  * Product endpoint functions
//  *export { listServices, allServices, firstService, serviceById } from "./endpoints/service"
//  * @example
//  * ```typescript
//  * const products = await listProducts(client, {
//  *   pagination: { limit: 50 }
//  * })
//  * const firstProduct = await firstProduct(client)
//  * const product = await productById(client, 'product-id')
//  * ```
//  */
// export { ProductEndpoint } from "./endpoints/product"

// // ============================================================================
// // ENDPOINT FUNCTIONS - Services
// // ============================================================================

// /**
//  * Service endpoint functions
//  */
// export { ServiceEndpoint } from "./endpoints/service"

// // ============================================================================
// // ENDPOINT FUNCTIONS - Bundles
// // ============================================================================

// /**
//  * Bundle endpoint functions
//  */
// export { BundleEndpoint } from "./endpoints/bundle"

// // ============================================================================
// // ENDPOINT FUNCTIONS - Variants
// // ============================================================================

// /**
//  * Variant endpoint functions
//  */
// export { VariantEndpoint } from "./endpoints/variant"

// // ============================================================================
// // ENDPOINT FUNCTIONS - Webhooks
// // ============================================================================

// /**
//  * Webhook management functions
//  *
//  * @example
//  * ```typescript
//  * const webhooks = await listWebhooks(client)
//  * const webhook = await createWebhook(client, {
//  *   url: 'https://example.com/webhook',
//  *   action: 'create',
//  *   entityType: 'product'
//  * })
//  * await deleteWebhook(client, webhook.id)
//  * ```
//  */
// export { WebhookEndpoint } from "./endpoints/webhook"

// // // ============================================================================
// // // ENDPOINT FUNCTIONS - Assortment
// // // ============================================================================

// // /**
// //  * Assortment functions for working with mixed product types
// //  * (products, services, bundles, variants, consignments)
// //  */
// export { AssortmentEndpoint } from "./endpoints/assortment"

// // // ============================================================================
// // // ALL ENDPOINTS TYPES
// // // ============================================================================

// // /**
// //  * All endpoint-specific types (Product, Service, Bundle, etc.)
// //  */
// // export * from "./endpoints"

// // // ============================================================================
// // // UTILITY FUNCTIONS
// // // ============================================================================

// // /**
// //  * Helper utilities for working with API data
// //  *
// //  * @example
// //  * ```typescript
// //  * import { parseDateTime, extractIdFromMetaHref } from 'moy-sklad'
// //  *
// //  * const date = parseDateTime('2024-02-15T10:30:00.000')
// //  * const id = extractIdFromMetaHref('https://api.moysklad.ru/api/remap/1.2/entity/product/xyz')
// //  * ```
// //  */
// // export {
// //   // composeDateTime,
// //   // extractIdFromMetaHref,
// //   // isAssortmentOfType,
// //   // parseDateTime,
// // } from "./utils"
