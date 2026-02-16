import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { BatchGetResult, Entity, GetFindResult, ListResponse, Subset } from "../../types"
import type { AllBundleOptions, BundleModel, FirstBundleOptions, ListBundleOptions } from "./types"

/**
 * Fetches bundles from API and parses JSON response.
 */
async function fetchBundlesResponse<T>(
  client: ApiClient,
  searchParameters?: URLSearchParams,
): Promise<ListResponse<GetFindResult<BundleModel, T>, "bundle">> {
  const response = await client.get(endpointPaths.entity.bundle, {
    searchParameters: searchParameters ?? undefined,
  })

  return response.json() as Promise<ListResponse<GetFindResult<BundleModel, T>, "bundle">>
}

/**
 * Gets list of bundles.
 *
 * @param client - API client instance
 * @param options - List options including filters, pagination, expand, order, search
 */
export async function listBundles<T extends ListBundleOptions = ListBundleOptions>(
  client: ApiClient,
  options?: Subset<T, ListBundleOptions>,
): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
  const searchParameters = composeSearchParameters({
    pagination: options?.pagination,
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchBundlesResponse<T["expand"]>(client, searchParameters)
}

/**
 * Gets all bundles.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 */
export async function allBundles<T extends AllBundleOptions = AllBundleOptions>(
  client: ApiClient,
  options?: Subset<T, AllBundleOptions>,
): Promise<BatchGetResult<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
  return client.batchGet(
    async (limit, offset) => {
      const searchParameters = composeSearchParameters({
        pagination: { limit, offset },
        expand: options?.expand,
        order: options?.order,
        search: options?.search,
        filter: options?.filter,
      })

      return fetchBundlesResponse<T["expand"]>(client, searchParameters)
    },
    Boolean(options?.expand && Object.keys(options.expand).length > 0),
  )
}

/**
 * Gets the first bundle from the list.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 */
export async function firstBundle<T extends FirstBundleOptions = FirstBundleOptions>(
  client: ApiClient,
  options?: Subset<T, FirstBundleOptions>,
): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
  const searchParameters = composeSearchParameters({
    pagination: { limit: 1 },
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchBundlesResponse<T["expand"]>(client, searchParameters)
}

export async function bundleById(client: ApiClient, id: string): Promise<BundleModel> {
  const response = await client.get(`${endpointPaths.entity.bundle}/${id}`)

  return response.json() as Promise<BundleModel>
}
