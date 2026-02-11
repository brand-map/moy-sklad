import { ApiClient } from "./api-client"
import type { ApiClientOptions } from "./api-client"
import {
  allAssortment,
  firstAssortment,
  listAssortment,
} from "./endpoints/assortment"
import type {
  AllAssortmentOptions,
  FirstAssortmentOptions,
  ListAssortmentOptions,
} from "./endpoints/assortment"
import {
  allProducts,
  firstProduct,
  listProducts,
} from "./endpoints/product"
import type {
  AllProductsOptions,
  FirstProductOptions,
  ListProductsOptions,
} from "./endpoints/product"
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
      list<T extends ListAssortmentOptions = ListAssortmentOptions>(
        opts?: Subset<T, ListAssortmentOptions>,
      ) {
        return listAssortment(client, opts)
      },
      all<T extends AllAssortmentOptions = AllAssortmentOptions>(
        opts?: Subset<T, AllAssortmentOptions>,
      ) {
        return allAssortment(client, opts)
      },
      first<T extends FirstAssortmentOptions = FirstAssortmentOptions>(
        opts?: Subset<T, FirstAssortmentOptions>,
      ) {
        return firstAssortment(client, opts)
      },
    },

    product: {
      list<T extends ListProductsOptions = ListProductsOptions>(
        opts?: Subset<T, ListProductsOptions>,
      ) {
        return listProducts(client, opts)
      },
      all<T extends AllProductsOptions = AllProductsOptions>(
        opts?: Subset<T, AllProductsOptions>,
      ) {
        return allProducts(client, opts)
      },
      first<T extends FirstProductOptions = FirstProductOptions>(
        opts?: Subset<T, FirstProductOptions>,
      ) {
        return firstProduct(client, opts)
      },
    },
  }
}
