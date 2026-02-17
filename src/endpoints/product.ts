import { ApiClient } from "../api-client"
import { composeSearchParameters } from "../api-client/compose-search-parameters"
import { endpointPaths } from "../endpoint-paths"
import type {
  ArchivedFilter,
  Attribute,
  AuditEvent,
  BatchDeleteResult,
  BatchGetResult,
  BooleanFilter,
  DateTime,
  DateTimeFilter,
  ExpandOptions,
  FilterOptions,
  GetAuditByEntityOptions,
  GetFindResult,
  GetModelUpdatableFields,
  IdFilter,
  ListMeta,
  ListResponse,
  MatchArrayType,
  Meta,
  Model,
  ModelCreateOrUpdateData,
  NumberFilter,
  OrderOptions,
  StringFilter,
  Subset,
  TaxSystem,
} from "../types"
import type { Barcodes, Idable, PaginationOptions, PriceType, TrackingType } from "../types/common"
import type { CounterpartyModel } from "./counterparty"
import type { GroupModel } from "./group"

/**
 * Товары
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar
 */
interface ProductEndpointInteface {
  /**
   * Получить список товаров.
   *
   * @param options - Опции для получения списка
   * @returns Объект с списком товаров
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   */
  list<T extends ListProductsOptions = Record<string, unknown>>(
    options?: Subset<T, ListProductsOptions>,
  ): Promise<ListResponse<GetFindResult<ProductModel, T["expand"]>, "product">>

  /**
   * Получить все товары.
   *
   * @param options - Опции для получения списка
   * @returns Массив товаров
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   */
  all<T extends AllProductsOptions = Record<string, unknown>>(
    options?: Subset<T, AllProductsOptions>,
  ): Promise<BatchGetResult<GetFindResult<ProductModel, T["expand"]>, "product">>

  /**
   * Получить первый товар из списка.
   *
   * @param options - Опции для получения списка
   * @returns Объект с списком товаров (с ограничением в 1 элемент)
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   */
  first<T extends FirstProductOptions = Record<string, unknown>>(
    options?: Subset<T, FirstProductOptions>,
  ): Promise<ListResponse<GetFindResult<ProductModel, T["expand"]>, "product">>

  /**
   * Получить товар по ID.
   *
   * @param id - ID товара
   * @param options - Опции для получения товара
   * @returns Товар
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-towar
   */
  get<T extends GetProductOptions = Record<string, unknown>>(
    id: string,
    options?: Subset<T, GetProductOptions>,
  ): Promise<GetFindResult<ProductModel, T["expand"]>>

  /**
   * Получить размер списка товаров.
   *
   * @returns Количество товаров
   */
  size(options?: AllProductsOptions): Promise<ListMeta<"product">>

  /**
   * Удалить товар.
   *
   * @param id - ID товара
   * @returns Void
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-udalit-towar
   */
  delete(id: string): Promise<void>

  /**
   * Обновить товар.
   *
   * @param id - ID товара
   * @param data - Данные для обновления
   * @param options - Опции для обновления
   * @returns Обновленный товар
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-izmenit-towar
   */
  update<T extends UpdateProductOptions = Record<string, unknown>>(
    id: string,
    data: GetModelUpdatableFields<ProductModel>,
    options?: Subset<T, UpdateProductOptions>,
  ): Promise<GetFindResult<ProductModel, T["expand"]>>

  /**
   * Создать или обновить товар.
   *
   * @param data - Данные для создания или обновления
   * @param options - Опции для создания или обновления
   * @returns Созданный или обновленный товар
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-sozdat-towar
   */
  upsert<
    TData extends ModelCreateOrUpdateData<ProductModel>,
    TOptions extends UpsertProductsOptions = Record<string, unknown>,
  >(
    data: TData,
    options?: Subset<TOptions, UpsertProductsOptions>,
  ): Promise<MatchArrayType<TData, GetFindResult<ProductModel, TOptions["expand"]>>>

  /**
   * Массовое удаление товаров.
   *
   * @param ids - Массив ID товаров
   * @returns Результат удаления
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-massowoe-udalenie-towarow
   */
  batchDelete(ids: string[]): Promise<BatchDeleteResult[]>

  /**
   * Переместить товар в корзину.
   *
   * @param id - ID товара
   * @returns Void
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-towar-w-korzinu
   */
  trash(id: string): Promise<void>

  /**
   * Получить события аудита для товара.
   *
   * {@linkcode AuditEvent}
   *
   * @param id - ID товара
   * @param options - Опции для получения событий аудита
   * @returns Список событий аудита
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-poluchit-sobytiq-po-suschnosti
   */
  audit(id: string, options?: GetAuditByEntityOptions): Promise<ListResponse<AuditEvent, "auditevent">>
}

type ProductPaymentItemType = "GOOD" | "EXCISABLE_GOOD" | "COMPOUND_PAYMENT_ITEM" | "ANOTHER_PAYMENT_ITEM"

type PpeType =
  | "2400001225408"
  | "2400001225606"
  | "2400001226108"
  | "2400001226306"
  | "2400001226405"
  | "2400001323807"
  | "2400001368105"
  | "2400001393107"
  | "2400001393503"
  | "2400001393602"
  | "2400001565306"
  | "2400001807703"
  | "2400001818303"
  | "2400001857005"
  | "2400001857203"
  | "2400001858309"
  | "2400001858507"
  | "2400002015909"
  | "2400002016005"
  | "2400002016104"
  | "2400002052805"
  | "2400002052904"
  | "2400002186203"
  | "2400002886707"
  | "2400002886806"
  | "2400002984502"
  | "2400003117107"
  | "2400003117206"
  | "2400003161209"
  | "2400003207907"
  | "2400003215308"
  | "2400003227806"
  | "2400003237409"
  | "2400003263408"
  | "2400003297700"
  | "2400003356704"
  | "2400003356803"
  | "2400003356902"
  | "2400003433108"
  | "2400003492303"
  | "2400003495700"
  | "2400003495809"
  | "2400003495908"
  | "2400003496004"
  | "2400003496103"
  | "2400003675805"

interface Product extends Idable, Meta<"product"> {
  readonly accountId: string
  alcoholic?: {
    excise?: number
    type?: number
    strength?: number
    volume?: number
  }
  archived: boolean
  article?: string
  attributes?: Attribute[] // TODO add attributes filters
  barcodes?: Barcodes
  buyPrice?: {
    value: number
    currency: Meta<"currency">
  }
  code?: string
  country?: Meta<"country">
  description?: string
  discountProhibited: boolean
  readonly effectiveVat?: number
  readonly effectiveVatEnabled?: boolean
  externalCode: string
  files?: unknown[] // TODO add files types & expand
  group: Meta<"group">
  images?: unknown[] // TODO add files types & expand
  isSerialTrackable?: boolean
  minimumBalance?: number
  name: string
  owner?: Meta<"employee">
  packs?: {
    barcodes?: Barcodes
    readonly id: string
    quantity: number
    uom: Meta<"uom">
  }[]
  partialDisposal?: boolean
  readonly pathName: string
  paymentItemType?: ProductPaymentItemType
  ppeType?: PpeType
  productFolder?: Meta<"productfolder">
  salePrices?: {
    value: number
    currency: Meta<"currency">
    priceType: PriceType
  }[]
  shared: boolean
  supplier?: Meta<"counterparty">
  readonly syncId?: string
  taxSystem?: TaxSystem
  things?: string[]
  tnved?: string
  trackingType?: TrackingType
  uom?: Meta<"uom">
  readonly updated: DateTime
  useParentVat: boolean
  readonly variantsCount: number
  vat?: number
  vatEnabled?: boolean
  volume?: number
  weight?: number
}

export interface ProductModel extends Model {
  object: Product
  expandable: {
    agent: CounterpartyModel
    group: GroupModel
    owner: CounterpartyModel
  }
  filters: {
    id: IdFilter
    accountId: IdFilter
    archived: ArchivedFilter
    article: StringFilter
    barcodes: StringFilter
    code: StringFilter
    description: StringFilter
    externalCode: StringFilter
    group: IdFilter
    isSerialTrackable: BooleanFilter
    minimumBalance: NumberFilter
    name: StringFilter
    owner: IdFilter
    pathName: StringFilter
    shared: BooleanFilter
    supplier: IdFilter
    syncId: IdFilter
    updated: DateTimeFilter
    volume: NumberFilter
    weight: NumberFilter
  }
  orderableFields:
    | "id"
    | "updated"
    | "name"
    | "code"
    | "externalCode"
    | "archived"
    | "pathName"
    | "isSerialTrackable"
    | "weighed"
    | "weight"
    | "volume"
    | "syncId"
  requiredCreateFields: "name"
}

interface ListProductsOptions {
  pagination?: PaginationOptions
  expand?: ExpandOptions<ProductModel>
  order?: OrderOptions<ProductModel>
  search?: string
  filter?: FilterOptions<ProductModel>
}

interface UpsertProductsOptions {
  expand?: ExpandOptions<ProductModel>
}

interface UpdateProductOptions {
  expand?: ExpandOptions<ProductModel>
}

interface GetProductOptions {
  expand?: ExpandOptions<ProductModel>
}

type FirstProductOptions = Omit<ListProductsOptions, "pagination">
type AllProductsOptions = Omit<ListProductsOptions, "pagination">

/**
 * Product endpoint class for fetching products from API.
 */
export class ProductEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.product,
  ) {}

  /**
   * Fetches products from API and parses JSON response.
   */
  private async fetchProductsResponse<T>(
    searchParameters: URLSearchParams | undefined,
  ): Promise<ListResponse<GetFindResult<ProductModel, T>, "product">> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters: searchParameters ?? undefined,
    })

    return response.json() as Promise<ListResponse<GetFindResult<ProductModel, T>, "product">>
  }

  /**
   * Gets list of products.
   *
   * @param options - List options including filters, pagination, expand, order, search
   * @returns Promise with list response containing products
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   *
   * @example
   * ```ts
   * const { rows } = await productEndpoint.list({
   *   filter: { name: "Product" },
   *   pagination: { limit: 50, offset: 0 }
   * });
   * ```
   */
  async list<T extends ListProductsOptions>(
    options?: ListProductsOptions,
  ): Promise<ListResponse<GetFindResult<ProductModel, T["expand"]>, "product">> {
    const searchParameters = composeSearchParameters({
      pagination: options?.pagination,
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchProductsResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets all products.
   *
   * @param options - Options including filters, expand, order, search
   * @returns Promise with batch get result containing all products
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   *
   * @example
   * ```ts
   * const { rows } = await productEndpoint.all({
   *   filter: { archived: false }
   * });
   * ```
   */
  async all<T extends AllProductsOptions>(
    options?: AllProductsOptions,
  ): Promise<BatchGetResult<GetFindResult<ProductModel, T["expand"]>, "product">> {
    return this.client.batchGet(
      async (limit, offset) => {
        const searchParameters = composeSearchParameters({
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        })

        return this.fetchProductsResponse<T["expand"]>(searchParameters)
      },
      Boolean(options?.expand && Object.keys(options.expand).length > 0),
    )
  }

  /**
   * Gets the first product from the list.
   *
   * @param options - Options including filters, expand, order, search
   * @returns Promise with list response containing first product
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-poluchit-spisok-towarow
   *
   * @example
   * ```ts
   * const { rows } = await productEndpoint.first({
   *   filter: { name: "Product A" }
   * });
   * ```
   */
  async first<T extends FirstProductOptions>(
    options?: FirstProductOptions,
  ): Promise<ListResponse<GetFindResult<ProductModel, T["expand"]>, "product">> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchProductsResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets a product by ID.
   *
   * @param id - Product ID
   * @returns Promise with product model
   *
   * @example
   * ```ts
   * const product = await productEndpoint.byId("product-id");
   * ```
   */
  async byId(id: string): Promise<ProductModel> {
    const response = await this.client.get(`${this.endpointPath}/${id}`)

    return response.json() as Promise<ProductModel>
  }
}
