import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { AssortmentModel, BatchGetResult, Entity, ListResponse } from "../../types"
import { buildSearchParams } from "../../utils/search-params-handlers"
import { type AllAssortmentOptions, type FirstAssortmentOptions, type ListAssortmentOptions } from "./assortment"

/**
 * Assortment endpoint class for fetching assortment items (products, services, bundles, variants, consignments).
 */
export class AssortmentEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.assortment,
  ) { }

  /**
   * Helper function to fetch assortment from API and parse JSON response.
   */
  private async fetchAssortmentResponse(
    searchParameters: URLSearchParams,
  ): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters,
    })

    return response.json() as Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>>
  }

  /**
   * Gets list of assortment items (products, services, bundles, variants, consignments).
   *
   * @param options - List options including filters, pagination, and expand
   * @returns Promise with list response containing assortment items
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/assortment#3-poluchit-assortiment
   *
   * @example
   * ```ts
   * const { rows } = await assortmentEndpoint.list({
   *   filter: { name: "Product" },
   *   pagination: { limit: 50, offset: 0 }
   * });
   * ```
   */
  async list(options?: ListAssortmentOptions): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const searchParameters = composeSearchParameters({
      pagination: options?.pagination,
      filter: options?.filter,
    })

    const finalSearchParams = buildSearchParams(searchParameters, options?.groupBy)

    return this.fetchAssortmentResponse(finalSearchParams)
  }

  /**
   * Gets all assortment items (products, services, bundles, variants, consignments).
   *
   * @param options - Options including groupBy and filters
   * @returns Promise with batch get result containing all assortment items
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment-poluchit-assortiment
   *
   * @example
   * ```ts
   * const { rows } = await assortmentEndpoint.all({
   *   filter: { archived: false }
   * });
   * ```
   */
  async all(options?: AllAssortmentOptions): Promise<BatchGetResult<AssortmentModel["object"], Entity.Assortment>> {
    return this.client.batchGet(
      async (limit, offset) => {
        const searchParameters = composeSearchParameters({
          pagination: { limit, offset },
          filter: options?.filter,
        })

        const finalSearchParams = buildSearchParams(searchParameters, options?.groupBy)

        return this.fetchAssortmentResponse(finalSearchParams)
      },
      options?.filter ? Object.keys(options.filter).length > 0 : false,
    )
  }

  /**
   * Gets the first assortment item.
   *
   * @param options - Options including groupBy and filters
   * @returns Promise with list response containing first assortment item
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment-poluchit-assortiment
   *
   * @example
   * ```ts
   * const { rows } = await assortmentEndpoint.first({
   *   filter: { name: "Product A" }
   * });
   * ```
   */
  async first(options?: FirstAssortmentOptions): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      filter: options?.filter,
    })

    const finalSearchParams = buildSearchParams(searchParameters, options?.groupBy)

    return this.fetchAssortmentResponse(finalSearchParams)
  }
}
