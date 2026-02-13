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
  AllVariantsOptions,
  FirstVariantOptions,
  ListVariantsOptions,
  VariantModel,
} from "./types"

/**
 * Fetches variants from API and parses JSON response.
 */
async function fetchVariantsResponse<T>(
  client: ApiClient,
  searchParameters?: URLSearchParams,
): Promise<ListResponse<GetFindResult<VariantModel, T>, Entity.Variant>> {
  const response = await client.get("entity/variant", {
    searchParameters: searchParameters ?? undefined,
  })

  return response.json() as Promise<
    ListResponse<GetFindResult<VariantModel, T>, Entity.Variant>
  >
}

/**
 * Gets list of variants.
 *
 * @param client - API client instance
 * @param options - List options including filters, pagination, expand, order, search
 */
export async function listVariants<
  T extends ListVariantsOptions = ListVariantsOptions,
>(
  client: ApiClient,
  options?: Subset<T, ListVariantsOptions>,
): Promise<
  ListResponse<GetFindResult<VariantModel, T["expand"]>, Entity.Variant>
> {
  const searchParameters = composeSearchParameters({
    pagination: options?.pagination,
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchVariantsResponse<T["expand"]>(client, searchParameters)
}

/**
 * Gets all variants.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 */
export async function allVariants<
  T extends AllVariantsOptions = AllVariantsOptions,
>(
  client: ApiClient,
  options?: Subset<T, AllVariantsOptions>,
): Promise<
  BatchGetResult<GetFindResult<VariantModel, T["expand"]>, Entity.Variant>
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

      return fetchVariantsResponse<T["expand"]>(client, searchParameters)
    },
    Boolean(options?.expand && Object.keys(options.expand).length > 0),
  )
}

/**
 * Gets the first variant from the list.
 *
 * @param client - API client instance
 * @param options - Options including filters, expand, order, search
 */
export async function firstVariant<
  T extends FirstVariantOptions = FirstVariantOptions,
>(
  client: ApiClient,
  options?: Subset<T, FirstVariantOptions>,
): Promise<
  ListResponse<GetFindResult<VariantModel, T["expand"]>, Entity.Variant>
> {
  const searchParameters = composeSearchParameters({
    pagination: { limit: 1 },
    expand: options?.expand,
    order: options?.order,
    search: options?.search,
    filter: options?.filter,
  })

  return fetchVariantsResponse<T["expand"]>(client, searchParameters)
}

export async function variantById(
  client: ApiClient,
  id: string,
): Promise<VariantModel> {
  const response = await client.get(`entity/variant/${id}`)

  return response.json() as Promise<VariantModel>
}