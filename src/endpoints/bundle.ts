import { ApiClient } from "../api-client"

import type { Image, ImageCollectionMetaOnly } from "../endpoints/image"
import { composeSearchParameters } from "../utils/compose-search-parameters"
import type {
  ArchivedFilter,
  AssortmentEntity,
  AssortmentModel,
  Attribute,
  BatchGetResult,
  BooleanFilter,
  DateTimeFilter,
  EmptyObject,
  GetFindResult,
  IdFilter,
  ListMeta,
  ListResponse,
  Meta,
  Model,
  NumberFilter,
  StringFilter,
  Subset,
  TaxSystem,
} from "../types"
import type { Barcodes, Idable, PaginationOptions, TrackingType } from "../types/common"
import type { EmployeeModel } from "./employee"
import type { GroupModel } from "./group"

/**
 * Bundle endpoint class for fetching bundles from API.
 */
export class BundleEndpoint {
  private endpointPath = "entity/bundle"

  constructor(private client: ApiClient) {}

  /**
   * Gets list of bundles.
   *
   * @param options - List options including filters, pagination, expand, order, search
   */
  async list<T extends ListBundleOptions = ListBundleOptions>(
    options?: Subset<T, ListBundleOptions>,
  ): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
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
   * Gets all bundles.
   *
   * @param options - Options including filters, expand, order, search
   */
  async all<T extends AllBundleOptions = AllBundleOptions>(
    options?: Subset<T, AllBundleOptions>,
  ): Promise<BatchGetResult<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
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
   * Gets all bundles as an async generator (chunk by chunk).
   *
   * @param options - Options including filters, expand, order, search
   * @yields Batch chunk with context and rows
   *
   * @example
   * ```ts
   * for await (const chunk of bundleEndpoint.allChunks({ filter: { archived: false } })) {
   *   console.log(chunk.rows.length)
   * }
   * ```
   */
  async *allChunks<T extends AllBundleOptions = AllBundleOptions>(
    options?: Subset<T, AllBundleOptions>,
  ): AsyncGenerator<BatchGetResult<GetFindResult<BundleModel, T["expand"]>, "bundle">, void, void> {
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
   * Gets the first bundle from the list.
   *
   * @param options - Options including filters, expand, order, search
   */
  async first<T extends FirstBundleOptions = FirstBundleOptions>(
    options?: Subset<T, FirstBundleOptions>,
  ): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
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
   * Gets a bundle by ID.
   *
   * @param id - Bundle ID
   * @param options - Optional query parameters (expand, fields)
   * @returns Promise with bundle model
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt
   *
   * @example
   * ```ts
   * const bundle = await bundleEndpoint.byId("bundle-id");
   * const bundleWithImages = await bundleEndpoint.byId("bundle-id", {
   *   expand: { images: true },
   *   fields: ["downloadPermanentHref"]
   * });
   * ```
   */
  async byId(
    id: string,
    options?: { expand?: import("../types").ExpandOptions<BundleModel>; fields?: "downloadPermanentHref"[] },
  ): Promise<Bundle> {
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

// Simple model for images expand option (images can be expanded with or without fields)
interface ImageExpandModel extends Model {
  object: Image | ImageCollectionMetaOnly
  expandable: EmptyObject
  filters: EmptyObject
}

// /**
//  * Bundle endpoint class for fetching bundles from API.
//  */
// export class BundleEndpoint {
//   constructor(
//     private readonly client: ApiClient,
//     private readonly endpointPath: string = endpointPaths.entity.bundle,
//   ) {}

//   /**
//    * Fetches bundles from API and parses JSON response.
//    */
//   private async fetchBundlesResponse<T>(
//     searchParameters?: URLSearchParams,
//   ): Promise<ListResponse<GetFindResult<BundleModel, T>, "bundle">> {
//     const response = await this.client.get(this.endpointPath, {
//       searchParameters: searchParameters ?? undefined,
//     })

//     return response.json() as Promise<ListResponse<GetFindResult<BundleModel, T>, "bundle">>
//   }

//   /**
//    * Gets list of bundles.
//    *
//    * @param options - List options including filters, pagination, expand, order, search
//    */
//   async list<T extends ListBundleOptions = ListBundleOptions>(
//     options?: Subset<T, ListBundleOptions>,
//   ): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
//     const searchParameters = composeSearchParameters({
//       pagination: options?.pagination,
//       expand: options?.expand,
//       order: options?.order,
//       search: options?.search,
//       filter: options?.filter,
//     })

//     return this.fetchBundlesResponse<T["expand"]>(searchParameters)
//   }

//   /**
//    * Gets all bundles.
//    *
//    * @param options - Options including filters, expand, order, search
//    */
//   async all<T extends AllBundleOptions = AllBundleOptions>(
//     options?: Subset<T, AllBundleOptions>,
//   ): Promise<BatchGetResult<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
//     return this.client.batchGet(
//       async (limit, offset) => {
//         const searchParameters = composeSearchParameters({
//           pagination: { limit, offset },
//           expand: options?.expand,
//           order: options?.order,
//           search: options?.search,
//           filter: options?.filter,
//         })

//         return this.fetchBundlesResponse<T["expand"]>(searchParameters)
//       },
//       Boolean(options?.expand && Object.keys(options.expand).length > 0),
//     )
//   }

//   /**
//    * Gets the first bundle from the list.
//    *
//    * @param options - Options including filters, expand, order, search
//    */
//   async first<T extends FirstBundleOptions = FirstBundleOptions>(
//     options?: Subset<T, FirstBundleOptions>,
//   ): Promise<ListResponse<GetFindResult<BundleModel, T["expand"]>, "bundle">> {
//     const searchParameters = composeSearchParameters({
//       pagination: { limit: 1 },
//       expand: options?.expand,
//       order: options?.order,
//       search: options?.search,
//       filter: options?.filter,
//     })

//     return this.fetchBundlesResponse<T["expand"]>(searchParameters)
//   }

//   /**
//    * Gets a bundle by ID.
//    *
//    * @param id - Bundle ID
//    * @returns Promise with bundle model
//    */
//   async byId(id: string): Promise<BundleModel> {
//     const response = await this.client.get(`${this.endpointPath}/${id}`)

//     return response.json() as Promise<BundleModel>
//   }
// }

/**
 * Признак предмета расчёта комплекта
 *
 * {@linkcode Bundle}
 */
type BundlePaymentItemType =
  /** Товар */
  | "GOOD"
  /** Подакцизный товар */
  | "EXCISABLE_GOOD"
  /** Составной предмет расчета */
  | "COMPOUND_PAYMENT_ITEM"
  /** Иной предмет расчета */
  | "ANOTHER_PAYMENT_ITEM"

/**
 * Компонент комплекта
 *
 * {@linkcode Bundle}
 */
interface BundleComponent extends Idable, Meta<"bundlecomponent"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Метаданные товара/услуги/серии, которую представляет собой компонент */
  assortment: Meta<AssortmentEntity>

  /** Количество товаров/услуг данного вида в компоненте */
  readonly quantity: number
}

/**
 * Модель компонента комплекта
 *
 * {@linkcode BundleComponent}
 */
interface BundleComponentModel extends Model {
  object: BundleComponent

  expandable: {
    assortment: AssortmentModel
  }
}

/**
 * Комлект
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt
 */
interface Bundle extends Idable, Meta<"bundle"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Добавлен ли Комплект в архив */
  archived: boolean

  /** Артикул */
  article?: string

  /** Коллекция доп. полей */
  attributes?: Attribute[]

  /**
   * Штрихкоды Комплекта
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt-komplekty-komponenty-komplekta-shtrihkody
   */
  barcodes?: Barcodes

  /** Код Комплекта */
  code?: string

  /** Массив компонентов Комплекта */
  components: ListMeta<"bundlecomponent">

  /** Метаданные Страны */
  country?: Meta<"country"> // TODO add country expand

  /** Описание Комплекта */
  description?: string

  /** Признак запрета скидок */
  discountProhibited: boolean

  /** Реальный НДС % */
  readonly effectiveVat?: number

  /**
   * Дополнительный признак для определения разграничения реального НДС.
   *
   * - (`effectiveVat` = `0`, `effectiveVatEnabled` = `false`) -> "без НДС"
   * - (`effectiveVat` = `0`, `effectiveVatEnabled` = `true`) -> `0%`
   */
  readonly effectiveVatEnabled?: boolean

  /** Внешний код Комплекта */
  externalCode: string

  /** Метаданные массива Файлов */
  files?: unknown[] // TODO add files type & expand

  /** Метаданные отдела сотрудника */
  group: Meta<"group">

  /**
   * Изображения.
   * При expand=images без fields: возвращает { meta: {...} }
   * При expand=images&fields=downloadPermanentHref: возвращает Image[]
   */
  images?: Image[] | ImageCollectionMetaOnly

  /**
   * Минимальная цена
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt-komplekty-atributy-wlozhennyh-suschnostej-minimal-naq-cena
   */
  minPrice?: {
    value: number
    currency: Meta<"currency">
  }

  /** Наименование Комплекта */
  name: string

  /**
   * Дополнительные расходы
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt-komplekty-atributy-wlozhennyh-suschnostej-dopolnitel-nye-rashody
   */
  overhead?: {
    value: number
    currency: Meta<"currency">
  }

  /** Метаданные владельца (Сотрудника) */
  owner?: Meta<"employee">

  /** Управление состоянием частичного выбытия маркированного товара */
  partialDisposal?: boolean

  /** Наименование группы, в которую входит Комплект */
  readonly pathName?: string

  /**
   * Признак предмета расчета
   *
   * {@linkcode BundlePaymentItemType}
   */
  paymentItemType?: BundlePaymentItemType

  /** Метаданные группы Комплекта */
  productFolder?: Meta<"productfolder"> // TODO add productFolder expand

  /** Цены продажи */
  salePrices?: {
    value: number
    currency: Meta<"currency">
    priceType: Meta<"pricetype">
  }[]

  /** Общий доступ */
  shared: boolean

  /** ID синхронизации */
  readonly syncId?: string

  /**
   * Код системы налогообложения
   *
   * {@linkcode TaxSystem}
   */
  taxSystem?: TaxSystem

  /** Код ТН ВЭД */
  tnved?: string

  /**
   * Тип маркируемой продукции
   *
   * {@linkcode TrackingType}
   */
  trackingType?: TrackingType

  /** Единицы измерения */
  uom?: Meta<"uom"> // TODO add uom expand

  /** Момент последнего обновления сущности */
  readonly updated: string

  /** Используется ли ставка НДС родительской группы */
  useParentVat: boolean

  /** НДС % */
  vat?: number

  /** Включен ли НДС для товара */
  vatEnabled?: boolean

  /** Объем */
  volume?: number

  /** Вес */
  weight?: number
}

/**
 * Модель комплекта
 *
 * {@linkcode Bundle}
 */
export interface BundleModel extends Model {
  object: Bundle

  expandable: {
    group: GroupModel
    owner: EmployeeModel
    components: BundleComponentModel
    images: ImageExpandModel
  }

  filters: {
    id: IdFilter
    accountId: IdFilter
    archived: ArchivedFilter
    article: StringFilter
    code: StringFilter
    description: StringFilter
    externalCode: StringFilter
    group: IdFilter
    name: StringFilter
    owner: IdFilter
    pathName: StringFilter
    shared: BooleanFilter
    syncId: IdFilter
    updated: DateTimeFilter
    volume: NumberFilter
    weight: NumberFilter
  }
}

interface ListBundleOptions {
  pagination?: PaginationOptions
  expand?: import("../types").ExpandOptions<BundleModel>
  order?: import("../types").OrderOptions<BundleModel>
  search?: string
  filter?: import("../types").FilterOptions<BundleModel>
  /**
   * Дополнительные поля для получения.
   * Используйте `["downloadPermanentHref"]` вместе с `expand: { images: true }` для получения постоянных ссылок на изображения.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-poluchit-postoyannuyu-ssylku-na-izobrazhenie-tovara-komplekta-ili-modifikacii
   */
  fields?: "downloadPermanentHref"[]
}

// interface CreateBundleOptions {
//   expand?: import("../../types").ExpandOptions<BundleModel>
// }

// interface UpdateBundleOptions {
//   expand?: import("../../types").ExpandOptions<BundleModel>
// }

// interface GetBundleOptions {
//   expand?: import("../../types").ExpandOptions<BundleModel>
// }

type FirstBundleOptions = Omit<ListBundleOptions, "pagination">
type AllBundleOptions = Omit<ListBundleOptions, "pagination">
