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
import { composeSearchParameters } from "../utils/compose-search-parameters"

import type { Image, ImageCollectionMetaOnly } from "../endpoints/image"
import type { EmptyObject } from "../types"
import type { Barcodes, Idable, PaginationOptions, PriceType } from "../types/common"
import type { ProductModel } from "./product"

// Simple model for images expand option (images can be expanded with or without fields)
interface ImageExpandModel extends Model {
  object: Image | ImageCollectionMetaOnly
  expandable: EmptyObject
  filters: EmptyObject
}

/**
 * Variant endpoint class for fetching variants from API.
 */
export class VariantEndpoint {
  private endpointPath = "entity/variant"

  constructor(private client: ApiClient) {}

  /**
   * Gets list of variants.
   *
   * @param options - List options including filters, pagination, expand, order, search
   */
  async list<T extends ListVariantsOptions = ListVariantsOptions>(
    options?: Subset<T, ListVariantsOptions>,
  ): Promise<ListResponse<GetFindResult<VariantModel, T["expand"]>, "variant">> {
    const searchParams: Record<string, unknown> = {
      pagination: options?.pagination,
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    }

    if (options?.fields && options.fields.length > 0) {
      searchParams.fields = options.fields.join(",")
    }

    const searchParameters = composeSearchParameters(searchParams)

    return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
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
        const searchParams: Record<string, unknown> = {
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        }

        if (options?.fields && options.fields.length > 0) {
          searchParams.fields = options.fields.join(",")
        }

        const searchParameters = composeSearchParameters(searchParams)

        return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
      },
      Boolean(options?.expand && Object.keys(options.expand).length > 0),
    )
  }

  /**
   * Gets all variants as an async generator (chunk by chunk).
   *
   * @param options - Options including filters, expand, order, search
   * @yields Batch chunk with context and rows
   *
   * @example
   * ```ts
   * for await (const chunk of variantEndpoint.allChunks({ filter: { archived: false } })) {
   *   console.log(chunk.rows.length)
   * }
   * ```
   */
  async *allChunks<T extends AllVariantsOptions = AllVariantsOptions>(
    options?: Subset<T, AllVariantsOptions>,
  ): AsyncGenerator<BatchGetResult<GetFindResult<VariantModel, T["expand"]>, "variant">, void, void> {
    yield* this.client.getChunks(
      async (limit, offset) => {
        const searchParams: Record<string, unknown> = {
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        }

        if (options?.fields && options.fields.length > 0) {
          searchParams.fields = options.fields.join(",")
        }

        const searchParameters = composeSearchParameters(searchParams)

        return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
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
    const searchParams: Record<string, unknown> = {
      pagination: { limit: 1 },
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    }

    if (options?.fields && options.fields.length > 0) {
      searchParams.fields = options.fields.join(",")
    }

    const searchParameters = composeSearchParameters(searchParams)

    return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
  }

  /**
   * Gets a variant by ID.
   *
   * @param id - Variant ID
   * @param options - Optional query parameters (expand, fields)
   * @returns Promise with variant model
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-modifikaciq
   *
   * @example
   * ```ts
   * const variant = await variantEndpoint.byId("variant-id");
   * const variantWithImages = await variantEndpoint.byId("variant-id", {
   *   expand: { images: true },
   *   fields: ["downloadPermanentHref"]
   * });
   * ```
   */
  async byId(
    id: string,
    options?: { expand?: ExpandOptions<VariantModel>; fields?: "downloadPermanentHref"[] },
  ): Promise<Variant> {
    const searchParams: Record<string, unknown> = {}

    if (options?.expand) {
      searchParams.expand = options.expand
    }

    if (options?.fields && options.fields.length > 0) {
      searchParams.fields = options.fields.join(",")
    }

    const searchParameters = composeSearchParameters(searchParams)

    return this.client.get(`${this.endpointPath}/${id}`, { searchParameters }).then((res) => res.json()) as any
  }
}

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
  /**
   * Изображения.
   * При expand=images без fields: возвращает { meta: {...} }
   * При expand=images&fields=downloadPermanentHref: возвращает Image[]
   */
  images?: Image[] | ImageCollectionMetaOnly
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
    images: ImageExpandModel
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
  /**
   * Дополнительные поля для получения.
   * Используйте `["downloadPermanentHref"]` вместе с `expand: { images: true }` для получения постоянных ссылок на изображения.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-poluchit-postoyannuyu-ssylku-na-izobrazhenie-tovara-komplekta-ili-modifikacii
   */
  fields?: "downloadPermanentHref"[]
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
