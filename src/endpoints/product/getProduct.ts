import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import type {
  BatchGetResult,
  Entity,
  GetFindResult,
  ListResponse,
  Subset,
} from "../../types"
import type {
  AllProductsOptions,
  FirstProductOptions,
  ListProductsOptions,
  ProductModel,
} from "./types"

/**
 * Fetches products from API and parses JSON response.
 */
async function fetchProductsResponse<T>(
  client: ApiClient,
  searchParameters: URLSearchParams | undefined,
): Promise<ListResponse<GetFindResult<ProductModel, T>, Entity.Product>> {
  const response = await client.get("entity/product", {
    searchParameters: searchParameters ?? undefined,
  })

  return response.json() as Promise<
    ListResponse<GetFindResult<ProductModel, T>, Entity.Product>
  >
}

/**
 * Gets list of products.
 *
 * @param client - API client instance
 * @param options - List options including filters, pagination, expand, order, search
 * @returns Promise with list response containing products
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
 *
 * @example
 * ```ts
 * const { rows } = await listProducts(apiClient, {
 *   filter: { name: "Product" },
 *   pagination: { limit: 50, offset: 0 }
 * });
 * ```
 */
export async function listProducts<T extends ListProductsOptions = ListProductsOptions>(
  client: ApiClient,
  options?: Subset<T, ListProductsOptions>,
): Promise<
  ListResponse<GetFindResult<ProductModel, T["expand"]>, Entity.Product>
> {
  const searchParameters = composeSearchParameters({
    pagination: options?.pagination,
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchProductsResponse<T["expand"]>(client, searchParameters)
}

/**
 * Gets all products.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 * @returns Promise with batch get result containing all products
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
 *
 * @example
 * ```ts
 * const { rows } = await allProducts(apiClient, {
 *   filter: { archived: false }
 * });
 * ```
 */
export async function allProducts<T extends AllProductsOptions = AllProductsOptions>(
  client: ApiClient,
  options?: Subset<T, AllProductsOptions>,
): Promise<
  BatchGetResult<GetFindResult<ProductModel, T["expand"]>, Entity.Product>
> {
  return client.batchGet(
    async (limit, offset) => {
      const searchParameters = composeSearchParameters({
        pagination: { limit, offset },
        expand: options?.expand,
        order: options?.order,
        search: options?.search,
        filter: options?.filter,
      })

      return fetchProductsResponse<T["expand"]>(client, searchParameters)
    },
    Boolean(options?.expand && Object.keys(options.expand).length > 0),
  )
}

/**
 * Gets the first product from the list.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 * @returns Promise with list response containing first product
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
 *
 * @example
 * ```ts
 * const { rows } = await firstProduct(apiClient, {
 *   filter: { name: "Product A" }
 * });
 * ```
 */
export async function firstProduct<T extends FirstProductOptions = FirstProductOptions>(
  client: ApiClient,
  options?: Subset<T, FirstProductOptions>,
): Promise<
  ListResponse<GetFindResult<ProductModel, T["expand"]>, Entity.Product>
> {
  const searchParameters = composeSearchParameters({
    pagination: { limit: 1 },
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchProductsResponse<T["expand"]>(client, searchParameters)
}


const ms = new ApiClient({
  auth: {
    token: "90d9343a0c6906c40bb44521f11bedd6fb20f60c",
  },
})

allProducts(ms, {
  expand: {
    agent: true,
  },
}).then(console.log)