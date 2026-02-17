import { ApiClient, composeSearchParameters } from "../api-client"
import type { Subset, BatchGetResult, ListMeta } from "../types"
import type { AssortmentEntity, AssortmentModel } from "../types/entity"
import type { ListResponse } from "../types/response"
import { buildSearchParams } from "../utils/search-params-handlers"
import type {
  ArchivedFilter,
  BooleanFilter,
  DateTimeFilter,
  EqualityFilter,
  IdFilter,
  NumberFilter,
  StringFilter,
} from "../types"
import type { PaginationOptions } from "../types/common"

/**
 * Ассортимент
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment
 */
export class AssortmentEndpoint {
  private endpointPath = "entity/assortment"

  constructor(private client: ApiClient) {}

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
  async list<T extends ListAssortmentOptions>(
    options?: Subset<T, ListAssortmentOptions>,
  ): Promise<ListResponse<AssortmentModel["object"], "assortment">> {
    const composedSearchParameters = composeSearchParameters({
      pagination: options?.pagination,
      filter: options?.filter,
    })

    const searchParameters = buildSearchParams(composedSearchParameters, options?.groupBy)

    return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
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
  all<T extends AllAssortmentOptions>(
    options?: Subset<T, AllAssortmentOptions>,
  ): Promise<BatchGetResult<AssortmentModel["object"], "assortment">> {
    return this.client.batchGet(
      async (limit, offset) => {
        const composedSearchParameters = composeSearchParameters({
          pagination: {
            limit,
            offset,
          },
          filter: options?.filter,
        })
        const searchParameters = buildSearchParams(composedSearchParameters, options?.groupBy)

        return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
      },
      options?.filter ? Object.keys(options.filter).length > 0 : false,
    )
  }

  /**
   * Gets all assortment items as an async generator (chunk by chunk).
   *
   * @param options - Options including groupBy and filters
   * @yields Batch chunk with context and rows
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment-poluchit-assortiment
   *
   * @example
   * ```ts
   * for await (const chunk of moysklad.assortment.allChunks({ filter: { archived: false } })) {
   *   console.log(chunk.rows.length)
   * }
   * for await(const chunk of moysklad.assortment.allChunks()){
   *   console.log(chunk)
   * }
   * ```
   */
  allChunks<T extends AllAssortmentOptions>(
    options?: Subset<T, AllAssortmentOptions>,
  ): AsyncGenerator<BatchGetResult<AssortmentModel["object"], "assortment">, void, void> {
    return this.client.getChunks(
      async (limit, offset) => {
        const composedSearchParameters = composeSearchParameters({
          pagination: {
            limit,
            offset,
          },
          filter: options?.filter,
        })
        const searchParameters = buildSearchParams(composedSearchParameters, options?.groupBy)

        return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
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
  first<T extends FirstAssortmentOptions>(
    options?: Subset<T, FirstAssortmentOptions>,
  ): Promise<ListResponse<AssortmentModel["object"], "assortment">> {
    const composedSearchParameters = composeSearchParameters({
      pagination: {
        limit: 1,
      },
      filter: options?.filter,
    })

    const searchParameters = buildSearchParams(composedSearchParameters, options?.groupBy)

    return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
  }

  size(options?: AllAssortmentOptions): Promise<ListMeta<AssortmentEntity>> {
    throw new Error("Method not implemented.")
  }
}

/**
 * Режим фильтрации по остаткам
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment-atributy-dostupnye-dlq-fil-tracii-dostupnye-znacheniq-dlq-stockmode
 */
type StockMode =
  /** Любое значение остатка */
  | "all"
  /** Положительный остаток */
  | "positiveOnly"
  /** Отрицательный остаток */
  | "negativeOnly"
  /** Нулевой остаток */
  | "empty"
  /** Ненулевой остаток */
  | "nonEmpty"
  /** Остаток ниже неснижаемого остатка */
  | "underMinimum"

/**
 * Режим фильтрации по доступности
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment-atributy-dostupnye-dlq-fil-tracii-dostupnye-znacheniq-dlq-quantitymode
 */
type QuantityMode =
  /** Любое значение остатка */
  | "all"
  /** Положительный остаток */
  | "positiveOnly"
  /** Отрицательный остаток */
  | "negativeOnly"
  /** Нулевой остаток */
  | "empty"
  /** Ненулевой остаток */
  | "nonEmpty"
  /** Остаток ниже неснижаемого остатка */
  | "underMinimum"

/**
 * Тип сущности для фильтрации ассортимента
 */
type AssortmentEntityType =
  /** Товар */
  | "product"
  /** Услуга */
  | "service"
  /** Комплект */
  | "bundle"
  /** Модификация */
  | "variant"
  /** Серия */
  | "consignment"

interface ListAssortmentOptions {
  /** Получить вместе с сериями. */
  groupBy?: "consignment"

  filter?: {
    /** Фильтрация по коду вида алкогольной продукции */
    "alcoholic.type"?: NumberFilter

    /** Фильтрация по признаку архивности товаров */
    archived?: ArchivedFilter

    /** Фильтрация по артикулам товаров и комплектов */
    article?: StringFilter

    /** Фильтрация по штрихкодам сущностей */
    barcode?: EqualityFilter<string> | string | string[]

    /** Фильтрация по кодам сущностей */
    code?: StringFilter

    /** Фильтрация по описаниям сущностей */
    description?: StringFilter

    /** Фильтрация по внешним кодам сущностей */
    externalCode?: StringFilter

    /** Фильтрация по владельцу-отделу */
    group?: EqualityFilter<string> | string | string[]

    /** Фильтрация по идентификаторам сущностей */
    id?: IdFilter

    /** Фильтрация по использованию серийных номеров */
    isSerialTrackable?: BooleanFilter

    /** Фильтрация по наименованиям сущностей */
    name?: StringFilter

    /** Фильтрация по владельцу-сотруднику */
    owner?: EqualityFilter<string> | string | string[]

    /** Фильтрация по наименованию групп товаров */
    pathname?: StringFilter

    /** Фильтрация по группам товаров */
    productFolder?: EqualityFilter<string> | string | string[]

    /** Фильтрация по значению доступно */
    quantityMode?: QuantityMode

    /** Префиксный поиск по строковым полям */
    search?: EqualityFilter<string> | string

    /** Фильтрация по признаку общего доступа */
    shared?: BooleanFilter

    /** Фильтрация по значению остатка */
    stockMode?: StockMode

    /** Момент времени, на который нужно вывести остатки */
    stockMoment?: DateTimeFilter

    /** Фильтрация по складам */
    stockStore?: EqualityFilter<string> | string | string[]

    /** Фильтрация по поставщикам */
    supplier?: EqualityFilter<string> | string | string[]

    /** Фильтрация по типу сущности */
    type?: EqualityFilter<AssortmentEntityType> | AssortmentEntityType | AssortmentEntityType[]

    /** Фильтрация по времени последнего обновления */
    updated?: DateTimeFilter

    /** Фильтрация по автору последнего обновления */
    updatedBy?: EqualityFilter<string> | string | string[]

    /** Фильтрация по признаку весового товара */
    weighed?: BooleanFilter

    /** Параметр учета вложенных подгрупп */
    withSubFolders?: boolean
  }

  pagination?: PaginationOptions
}

type AllAssortmentOptions = Omit<ListAssortmentOptions, "pagination">
type FirstAssortmentOptions = Omit<ListAssortmentOptions, "pagination">
