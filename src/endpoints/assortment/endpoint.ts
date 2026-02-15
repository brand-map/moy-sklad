import { ApiClient, composeSearchParameters } from "../../api-client"
import type { Subset, BatchGetResult, ListMeta } from "../../types"
import type { AssortmentEntity, AssortmentModel, Entity } from "../../types/entity"
import type { ListResponse } from "../../types/response"
import { buildSearchParams } from "../../utils/search-params-handlers"

import type {
  AllAssortmentOptions,
  AssortmentEndpointInterface,
  FirstAssortmentOptions,
  ListAssortmentOptions,
} from "./types"

export class AssortmentEndpoint implements AssortmentEndpointInterface {
  private endpointPath = "entity/assortment"

  constructor(private client: ApiClient) {}

  /**
   * Gets list of assortment items (products, services, bundles, variants, consignments).
   *
   * @param client - API client instance
   * @param options - List options including filters, pagination, and expand
   * @returns Promise with list response containing assortment items
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/assortment#3-poluchit-assortiment
   *
   * @example
   * ```ts
   * const { rows } = await listAssortment(apiClient, {
   *   filter: { name: "Product" },
   *   pagination: { limit: 50, offset: 0 }
   * });
   * ```
   */
  async list<T extends ListAssortmentOptions>(
    options?: Subset<T, ListAssortmentOptions>,
  ): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const composedSearchParameters = composeSearchParameters({
      pagination: options?.pagination,
      filter: options?.filter,
    })

    const searchParameters = buildSearchParams(composedSearchParameters, options?.groupBy)

    return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
  }

  /**
   * Gets all assortment items (products, services, bundles, variants, consignments).
   *
   * @param client - API client instance
   * @param options - Options including groupBy and filters
   * @returns Promise with batch get result containing all assortment items
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment-poluchit-assortiment
   *
   * @example
   * ```ts
   * const { rows } = await allAssortment(apiClient, {
   *   filter: { archived: false }
   * });
   * ```
   */
  all<T extends AllAssortmentOptions>(
    options?: Subset<T, AllAssortmentOptions>,
  ): Promise<BatchGetResult<AssortmentModel["object"], Entity.Assortment>> {
    return this.client.batchGet(
      async (limit, offset) => {
        const composedSearchParameters = composeSearchParameters({
          pagination: {
            limit,
            offset,
          },
          filter: options?.filter,
        })
        const searchParameters = buildSearchParams(composedSearchParameters, options?.groupBy)

        return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
      },
      options?.filter ? Object.keys(options.filter).length > 0 : false,
    )
  }

  /**
   * Gets the first assortment item.
   *
   * @param client - API client instance
   * @param options - Options including groupBy and filters
   * @returns Promise with list response containing first assortment item
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment-poluchit-assortiment
   *
   * @example
   * ```ts
   * const { rows } = await firstAssortment(apiClient, {
   *   filter: { name: "Product A" }
   * });
   * ```
   */
  first<T extends FirstAssortmentOptions>(
    options?: Subset<T, FirstAssortmentOptions>,
  ): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const composedSearchParameters = composeSearchParameters({
      pagination: {
        limit: 1,
      },
      filter: options?.filter,
    })

    const searchParameters = buildSearchParams(composedSearchParameters, options?.groupBy)

    return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
  }

  size(options?: AllAssortmentOptions): Promise<ListMeta<AssortmentEntity>> {
    throw new Error("Method not implemented.")
  }
}
