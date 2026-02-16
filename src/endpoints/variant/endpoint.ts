import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { BatchGetResult, Entity, GetFindResult, ListResponse, Subset } from "../../types"
import type { AllVariantsOptions, FirstVariantOptions, ListVariantsOptions, VariantModel } from "./types"

/**
 * Variant endpoint class for fetching variants from API.
 */
export class VariantEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.variant,
  ) { }

  /**
   * Fetches variants from API and parses JSON response.
   */
  private async fetchVariantsResponse<T>(
    searchParameters?: URLSearchParams,
  ): Promise<ListResponse<GetFindResult<VariantModel, T>, Entity.Variant>> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters: searchParameters ?? undefined,
    })

    return response.json() as Promise<ListResponse<GetFindResult<VariantModel, T>, Entity.Variant>>
  }

  /**
   * Gets list of variants.
   *
   * @param options - List options including filters, pagination, expand, order, search
   */
  async list<T extends ListVariantsOptions = ListVariantsOptions>(
    options?: Subset<T, ListVariantsOptions>,
  ): Promise<ListResponse<GetFindResult<VariantModel, T["expand"]>, Entity.Variant>> {
    const searchParameters = composeSearchParameters({
      pagination: options?.pagination,
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchVariantsResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets all variants.
   *
   * @param options - Options including filters, expand, order, search
   */
  async all<T extends AllVariantsOptions = AllVariantsOptions>(
    options?: Subset<T, AllVariantsOptions>,
  ): Promise<BatchGetResult<GetFindResult<VariantModel, T["expand"]>, Entity.Variant>> {
    return this.client.batchGet(
      async (limit, offset) => {
        const searchParameters = composeSearchParameters({
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        })

        return this.fetchVariantsResponse<T["expand"]>(searchParameters)
      },
      Boolean(options?.expand && Object.keys(options.expand).length > 0),
    )
  }

  /**
   * Gets the first variant from the list.
   *
   * @param options - Options including filters, expand, order, search
   */
  async first<T extends FirstVariantOptions = FirstVariantOptions>(
    options?: Subset<T, FirstVariantOptions>,
  ): Promise<ListResponse<GetFindResult<VariantModel, T["expand"]>, Entity.Variant>> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchVariantsResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets a variant by ID.
   *
   * @param id - Variant ID
   * @returns Promise with variant model
   */
  async byId(id: string): Promise<VariantModel> {
    const response = await this.client.get(`${this.endpointPath}/${id}`)

    return response.json() as Promise<VariantModel>
  }
}
