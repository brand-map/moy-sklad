import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { BatchGetResult, Entity, GetFindResult, ListResponse, Subset } from "../../types"
import type { AllServiceOptions, FirstServiceOptions, ListServicesOptions, ServiceModel } from "./types"

/**
 * Service endpoint class for fetching services from API.
 */
export class ServiceEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.service,
  ) { }

  /**
   * Fetches services from API and parses JSON response.
   */
  private async fetchServicesResponse<T>(
    searchParameters?: URLSearchParams,
  ): Promise<ListResponse<GetFindResult<ServiceModel, T>, Entity.Service>> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters: searchParameters ?? undefined,
    })

    return response.json() as Promise<ListResponse<GetFindResult<ServiceModel, T>, Entity.Service>>
  }

  /**
   * Gets list of services.
   *
   * @param options - List options including filters, pagination, expand, order, search
   */
  async list<T extends ListServicesOptions = ListServicesOptions>(
    options?: Subset<T, ListServicesOptions>,
  ): Promise<ListResponse<GetFindResult<ServiceModel, T["expand"]>, Entity.Service>> {
    const searchParameters = composeSearchParameters({
      pagination: options?.pagination,
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchServicesResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets all services.
   *
   * @param options - Options including filters, expand, order, search
   */
  async all<T extends AllServiceOptions = AllServiceOptions>(
    options?: Subset<T, AllServiceOptions>,
  ): Promise<BatchGetResult<GetFindResult<ServiceModel, T["expand"]>, Entity.Service>> {
    return this.client.batchGet(
      async (limit, offset) => {
        const searchParameters = composeSearchParameters({
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        })

        return this.fetchServicesResponse<T["expand"]>(searchParameters)
      },
      Boolean(options?.expand && Object.keys(options.expand).length > 0),
    )
  }

  /**
   * Gets the first service from the list.
   *
   * @param options - Options including filters, expand, order, search
   */
  async first<T extends FirstServiceOptions = FirstServiceOptions>(
    options?: Subset<T, FirstServiceOptions>,
  ): Promise<ListResponse<GetFindResult<ServiceModel, T["expand"]>, Entity.Service>> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchServicesResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets a service by ID.
   *
   * @param id - Service ID
   * @returns Promise with service model
   */
  async byId(id: string): Promise<ServiceModel> {
    const response = await this.client.get(`${this.endpointPath}/${id}`)

    return response.json() as Promise<ServiceModel>
  }
}
