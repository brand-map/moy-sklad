import type {
  ArchivedFilter,
  Attribute,
  BatchGetResult,
  DateTime,
  DateTimeFilter,
  ExpandOptions,
  FilterOptions,
  GetFindResult,
  IdFilter,
  ListResponse,
  Meta,
  Model,
  OrderOptions,
  StringFilter,
  Subset,
} from "../types"

import { ApiClient } from "../api-client"
import { composeSearchParameters } from "../api-client/compose-search-parameters"
import { endpointPaths } from "../endpoint-paths"
import type { ProductModel } from "./product"
import type { Barcodes, Idable, PaginationOptions, PriceType } from "../types/common"

interface Variant extends Idable, Meta<"variant"> {
  readonly accountId: string
  archived: boolean
  barcodes?: Barcodes
  buyPrice?: {
    value: number
    currency: Meta<"currency">
  }
  characteristics: Attribute[]
  code?: string
  description?: string
  discountProhibited: boolean
  externalCode: string
  images?: unknown[] // TODO add files types & expand
  minPrice?: {
    value: number
    currency: Meta<"currency">
  }
  name: string
  packs?: {
    barcodes?: Barcodes
    readonly id: string
    quantity: number
    uom: Meta<"uom">
  }[]
  product: Meta<"product">
  salePrices?: {
    value: number
    currency: Meta<"currency">
    priceType: PriceType
  }[]
  readonly things?: string[]
  readonly updated: DateTime
}

export interface VariantModel extends Model {
  object: Variant
  expandable: {
    product: ProductModel
  }
  filters: {
    id: IdFilter
    accountId: IdFilter
    archived: ArchivedFilter
    barcodes: StringFilter
    code: StringFilter
    description: StringFilter
    externalCode: StringFilter
    name: StringFilter
    updated: DateTimeFilter
    productid: IdFilter
  }
  orderableFields:
    | "id"
    | "accountId"
    | "archived"
    | "barcodes"
    | "code"
    | "description"
    | "externalCode"
    | "name"
    | "updated"
  requiredCreateFields: "characteristics" | "product"
}

interface ListVariantsOptions {
  pagination?: PaginationOptions
  expand?: ExpandOptions<VariantModel>
  order?: OrderOptions<VariantModel>
  search?: string
  filter?: FilterOptions<VariantModel>
}

// interface CreateVariantOptions {
//   expand?: ExpandOptions<VariantModel>
// }

// interface UpdateVariantOptions {
//   expand?: ExpandOptions<VariantModel>
// }

// interface GetVariantOptions {
//   expand?: ExpandOptions<VariantModel>
// }

type FirstVariantOptions = Omit<ListVariantsOptions, "pagination">
type AllVariantsOptions = Omit<ListVariantsOptions, "pagination">

/**
 * Variant endpoint class for fetching variants from API.
 */
export class VariantEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.variant,
  ) {}

  /**
   * Fetches variants from API and parses JSON response.
   */
  private async fetchVariantsResponse<T>(
    searchParameters?: URLSearchParams,
  ): Promise<ListResponse<GetFindResult<VariantModel, T>, "variant">> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters: searchParameters ?? undefined,
    })

    return response.json() as Promise<ListResponse<GetFindResult<VariantModel, T>, "variant">>
  }

  /**
   * Gets list of variants.
   *
   * @param options - List options including filters, pagination, expand, order, search
   */
  async list<T extends ListVariantsOptions = ListVariantsOptions>(
    options?: Subset<T, ListVariantsOptions>,
  ): Promise<ListResponse<GetFindResult<VariantModel, T["expand"]>, "variant">> {
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
  ): Promise<BatchGetResult<GetFindResult<VariantModel, T["expand"]>, "variant">> {
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
  ): Promise<ListResponse<GetFindResult<VariantModel, T["expand"]>, "variant">> {
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
