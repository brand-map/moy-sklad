import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { BatchGetResult, Entity, GetFindResult, ListResponse, Subset } from "../../types"
import type { AllBundleOptions, BundleModel, FirstBundleOptions, ListBundleOptions } from "./types"

/**
 * Bundle endpoint class for fetching bundles from API.
 */
export class BundleEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.bundle,
  ) { }

  /**
   * Fetches bundles from API and parses JSON response.
   */
  private async fetchBundlesResponse<T>(
    searchParameters?: URLSearchParams,
  ): Promise<ListResponse<GetFindResult<BundleModel, T>, Entity.Bundle>> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters: searchParameters ?? undefined,
    })

    return response.json() as Promise<ListResponse<GetFindResult<BundleModel, T>, Entity.Bundle>>
  }

  /**
   * Gets list of bundles.
   *
   * @param options - List options including filters, pagination, expand, order, search
   */
  async list<T extends ListBundleOptions = ListBundleOptions>(
    options?: Subset<T, ListBundleOptions>,
  ): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, Entity.Bundle>> {
    const searchParameters = composeSearchParameters({
      pagination: options?.pagination,
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchBundlesResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets all bundles.
   *
   * @param options - Options including filters, expand, order, search
   */
  async all<T extends AllBundleOptions = AllBundleOptions>(
    options?: Subset<T, AllBundleOptions>,
  ): Promise<BatchGetResult<GetFindResult<BundleModel, T["expand"]>, Entity.Bundle>> {
    return this.client.batchGet(
      async (limit, offset) => {
        const searchParameters = composeSearchParameters({
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        })

        return this.fetchBundlesResponse<T["expand"]>(searchParameters)
      },
      Boolean(options?.expand && Object.keys(options.expand).length > 0),
    )
  }

  /**
   * Gets the first bundle from the list.
   *
   * @param options - Options including filters, expand, order, search
   */
  async first<T extends FirstBundleOptions = FirstBundleOptions>(
    options?: Subset<T, FirstBundleOptions>,
  ): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, Entity.Bundle>> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchBundlesResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets a bundle by ID.
   *
   * @param id - Bundle ID
   * @returns Promise with bundle model
   */
  async byId(id: string): Promise<BundleModel> {
    const response = await this.client.get(`${this.endpointPath}/${id}`)

    return response.json() as Promise<BundleModel>
  }
}
