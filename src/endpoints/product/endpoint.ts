import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { BatchGetResult, Entity, GetFindResult, ListResponse, } from "../../types"
import type { AllProductsOptions, FirstProductOptions, ListProductsOptions, ProductModel } from "./types"

/**
 * Product endpoint class for fetching products from API.
 */
export class ProductEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.product,
  ) { }

  /**
   * Fetches products from API and parses JSON response.
   */
  private async fetchProductsResponse<T>(
    searchParameters: URLSearchParams | undefined,
  ): Promise<ListResponse<GetFindResult<ProductModel, T>, 'product'>> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters: searchParameters ?? undefined,
    })

    return response.json() as Promise<ListResponse<GetFindResult<ProductModel, T>, 'product'>>
  }

  /**
   * Gets list of products.
   *
   * @param options - List options including filters, pagination, expand, order, search
   * @returns Promise with list response containing products
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   *
   * @example
   * ```ts
   * const { rows } = await productEndpoint.list({
   *   filter: { name: "Product" },
   *   pagination: { limit: 50, offset: 0 }
   * });
   * ```
   */
  async list<T extends ListProductsOptions>(
    options?: ListProductsOptions,
  ): Promise<ListResponse<GetFindResult<ProductModel, T["expand"]>, 'product'>> {
    const searchParameters = composeSearchParameters({
      pagination: options?.pagination,
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchProductsResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets all products.
   *
   * @param options - Options including filters, expand, order, search
   * @returns Promise with batch get result containing all products
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   *
   * @example
   * ```ts
   * const { rows } = await productEndpoint.all({
   *   filter: { archived: false }
   * });
   * ```
   */
  async all<T extends AllProductsOptions>(
    options?: AllProductsOptions,
  ): Promise<BatchGetResult<GetFindResult<ProductModel, T["expand"]>, 'product'>> {
    return this.client.batchGet(
      async (limit, offset) => {
        const searchParameters = composeSearchParameters({
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        })

        return this.fetchProductsResponse<T["expand"]>(searchParameters)
      },
      Boolean(options?.expand && Object.keys(options.expand).length > 0),
    )
  }

  /**
   * Gets the first product from the list.
   *
   * @param options - Options including filters, expand, order, search
   * @returns Promise with list response containing first product
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   *
   * @example
   * ```ts
   * const { rows } = await productEndpoint.first({
   *   filter: { name: "Product A" }
   * });
   * ```
   */
  async first<T extends FirstProductOptions>(
    options?: FirstProductOptions,
  ): Promise<ListResponse<GetFindResult<ProductModel, T["expand"]>, 'product'>> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchProductsResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets a product by ID.
   *
   * @param id - Product ID
   * @returns Promise with product model
   *
   * @example
   * ```ts
   * const product = await productEndpoint.byId("product-id");
   * ```
   */
  async byId(id: string): Promise<ProductModel> {
    const response = await this.client.get(`${this.endpointPath}/${id}`)

    return response.json() as Promise<ProductModel>
  }
}
