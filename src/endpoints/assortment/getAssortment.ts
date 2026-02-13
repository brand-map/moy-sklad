import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import type {
    AssortmentModel,
    BatchGetResult,
    Entity,
    ListResponse
} from "../../types"
import { buildSearchParams } from "../../utils/search-params-handlers"
import {
    type AllAssortmentOptions,
    type FirstAssortmentOptions,
    type ListAssortmentOptions
} from "./assortment"


/**
 * Helper function to fetch assortment from API and parse JSON response.
 */
async function fetchAssortmentResponse(
    client: ApiClient,
    searchParameters: URLSearchParams,
): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const response = await client.get("entity/assortment", {
        searchParameters,
    })

    return response.json() as Promise<
        ListResponse<AssortmentModel["object"], Entity.Assortment>
    >
}


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
export async function listAssortment(
    client: ApiClient,
    options?: ListAssortmentOptions,
): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const searchParameters = composeSearchParameters({
        pagination: options?.pagination,
        filter: options?.filter,
    })

    const finalSearchParams = buildSearchParams(searchParameters, options?.groupBy)

    return fetchAssortmentResponse(client, finalSearchParams)
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
export async function allAssortment(
    client: ApiClient,
    options?: AllAssortmentOptions,
): Promise<BatchGetResult<AssortmentModel["object"], Entity.Assortment>> {
    return client.batchGet(
        async (limit, offset) => {
            const searchParameters = composeSearchParameters({
                pagination: { limit, offset },
                filter: options?.filter,
            })

            const finalSearchParams = buildSearchParams(
                searchParameters,
                options?.groupBy,
            )

            return fetchAssortmentResponse(client, finalSearchParams)
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
export async function firstAssortment(
    client: ApiClient,
    options?: FirstAssortmentOptions,
): Promise<ListResponse<AssortmentModel["object"], Entity.Assortment>> {
    const searchParameters = composeSearchParameters({
        pagination: { limit: 1 },
        filter: options?.filter,
    })

    const finalSearchParams = buildSearchParams(searchParameters, options?.groupBy)

    return fetchAssortmentResponse(client, finalSearchParams)
}
