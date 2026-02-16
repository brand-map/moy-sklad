import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { BatchGetResult, Entity, GetFindResult, ListResponse, Subset } from "../../types"
import type { AllServiceOptions, FirstServiceOptions, ListServicesOptions, ServiceModel } from "./types"

/**
 * Fetches services from API and parses JSON response.
 */
async function fetchServicesResponse<T>(
  client: ApiClient,
  searchParameters?: URLSearchParams,
): Promise<ListResponse<GetFindResult<ServiceModel, T>, "service">> {
  const response = await client.get(endpointPaths.entity.service, {
    searchParameters: searchParameters ?? undefined,
  })

  return response.json() as Promise<ListResponse<GetFindResult<ServiceModel, T>, "service">>
}

/**
 * Gets list of services.
 *
 * @param client - API client instance
 * @param options - List options including filters, pagination, expand, order, search
 */
export async function listServices<T extends ListServicesOptions = ListServicesOptions>(
  client: ApiClient,
  options?: Subset<T, ListServicesOptions>,
): Promise<ListResponse<GetFindResult<ServiceModel, T["expand"]>, "service">> {
  const searchParameters = composeSearchParameters({
    pagination: options?.pagination,
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchServicesResponse<T["expand"]>(client, searchParameters)
}

/**
 * Gets all services.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 */
export async function allServices<T extends AllServiceOptions = AllServiceOptions>(
  client: ApiClient,
  options?: Subset<T, AllServiceOptions>,
): Promise<BatchGetResult<GetFindResult<ServiceModel, T["expand"]>, "service">> {
  return client.batchGet(
    async (limit, offset) => {
      const searchParameters = composeSearchParameters({
        pagination: { limit, offset },
        expand: options?.expand,
        order: options?.order,
        search: options?.search,
        filter: options?.filter,
      })

      return fetchServicesResponse<T["expand"]>(client, searchParameters)
    },
    Boolean(options?.expand && Object.keys(options.expand).length > 0),
  )
}

/**
 * Gets the first service from the list.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 */
export async function firstService<T extends FirstServiceOptions = FirstServiceOptions>(
  client: ApiClient,
  options?: Subset<T, FirstServiceOptions>,
): Promise<ListResponse<GetFindResult<ServiceModel, T["expand"]>, "service">> {
  const searchParameters = composeSearchParameters({
    pagination: { limit: 1 },
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchServicesResponse<T["expand"]>(client, searchParameters)
}

export async function serviceById(client: ApiClient, id: string): Promise<ServiceModel> {
  const response = await client.get(`${endpointPaths.entity.service}/${id}`)

  return response.json() as Promise<ServiceModel>
}
