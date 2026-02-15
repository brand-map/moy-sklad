import { ApiClient } from "./api-client"
import type { ApiClientOptions } from "./api-client"
import { allAssortment, firstAssortment, listAssortment } from "./endpoints/assortment"
import type { AllAssortmentOptions, FirstAssortmentOptions, ListAssortmentOptions } from "./endpoints/assortment"
import { allProducts, firstProduct, listProducts } from "./endpoints/product"
import type { AllProductsOptions, FirstProductOptions, ListProductsOptions } from "./endpoints/product"
import type { Subset } from "./types"

/**
 * Creates a МойСклад client with implemented endpoints (assortment and product).
 * Use this instead of building the client and calling standalone functions manually.
 *
 * @param options - API client options (auth, baseUrl, etc.)
 * @returns Object with `client` and endpoints that have `list`, `all`, `first` methods
 *
 * @example
 * ```ts
 * const moysklad = createMoysklad({
 *   auth: { token: "your-token" }
 * });
 * const { rows } = await moysklad.assortment.list({ pagination: { limit: 10 } });
 * const { rows: products } = await moysklad.product.all();
 * ```
 */
export function createMoysklad(options: ApiClientOptions) {
  const client = new ApiClient(options)

  return {
    client,

    assortment: {
      list(opts?: ListAssortmentOptions) {
        return listAssortment(client, opts)
      },
      all(opts?: AllAssortmentOptions) {
        return allAssortment(client, opts)
      },
      first(opts?: FirstAssortmentOptions) {
        return firstAssortment(client, opts)
      },
    },

    product: {
      list(opts?: ListProductsOptions) {
        return listProducts(client, opts)
      },
      all(opts?: AllProductsOptions) {
        return allProducts(client, opts)
      },
      first(opts?: FirstProductOptions) {
        return firstProduct(client, opts)
      },
    },
  }
}
