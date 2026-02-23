import { ApiClient } from "../api-client"
import { composeSearchParameters } from "../utils/compose-search-parameters"

import type {
  ArchivedFilter,
  BooleanFilter,
  DateTime,
  DateTimeFilter,
  EmptyObject,
  EqualityFilter,
  IdFilter,
  ListResponse,
  Model,
  NumberFilter,
  StringFilter,
} from "../types"
import type { Barcodes, Idable, Meta, PaginationOptions } from "../types/common"
import type { EmployeeModel } from "./employee/types"
import type { GroupModel } from "./group/types"

/**
 * Отчёты
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/reports/
 */
export class ReportEndpoint {
  private endpointPath = "report"

  constructor(private client: ApiClient) {}

  /**
   * Gets stock report (Остатки).
   *
   * @param options - Report options including filters and pagination
   * @returns Promise with list response containing stock report data
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/reports/#otchety-ostatki
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.report.stock({
   *   filter: { store: "store-id" },
   *   pagination: { limit: 50, offset: 0 }
   * });
   * ```
   */
  async stock<T extends StockReportOptions>(
    options?: T,
  ): Promise<ListResponse<GetStockReportResult<T["groupBy"]>, "stock">> {
    const searchParams: Record<string, unknown> = {
      pagination: options?.pagination,
      filter: options?.filter,
      expand: options?.expand,
      fields: options?.fields,
    }

    if (options?.groupBy) {
      searchParams.groupBy = options.groupBy
    }

    const searchParameters = composeSearchParameters(searchParams)

    return this.client.get(`${this.endpointPath}/stock/all`, { searchParameters }).then((res) => res.json()) as any
  }
}

/**
 * Режим группировки в отчёте об остатках
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/reports/#otchety-ostatki
 */
export type StockGroupBy =
  /** Группировка по товарам */
  | "product"
  /** Группировка по складам */
  | "store"
  /** Группировка по организациям */
  | "organization"

/**
 * Отчёт об остатках (Stock Report)
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/reports/#otchety-ostatki
 */
export interface StockReport extends Idable {
  /** ID учетной записи */
  readonly accountId: string

  /** Метаданные товара/услуги/комплекта/модификации */
  assortment: Meta<"product" | "service" | "bundle" | "variant">

  /** Штрихкоды */
  barcodes?: Barcodes

  /** Код товара */
  code?: string

  /** Название товара */
  name: string

  /** Метаданные организации */
  organization?: Meta<"organization">

  /** Метаданные отдела */
  group?: Meta<"group">

  /** Метаданные склада */
  store?: Meta<"store">

  /** Остаток */
  stock: number

  /** Резерв */
  reserve: number

  /** В транзите */
  inTransit: number

  /** Доступно */
  quantity: number

  /** Закупочная цена */
  buyPrice?: {
    value: number
    currency: Meta<"currency">
  }

  /** Себестоимость */
  cost?: number

  /** Цена продажи */
  salePrice?: {
    value: number
    currency: Meta<"currency">
    priceType: Meta<"pricetype">
  }

  /** Артикул */
  article?: string

  /** Метаданные владельца (сотрудника) */
  owner?: Meta<"employee">

  /** Внешний код */
  externalCode?: string

  /** Единицы измерения */
  uom?: Meta<"uom">

  /** Момент последнего обновления */
  readonly updated: DateTime

  /** Добавлена ли сущность в архив */
  archived: boolean

  /** Общий доступ */
  shared: boolean

  /** Метаданные группы товаров */
  productFolder?: Meta<"productfolder">

  /** Наименование группы товаров */
  pathName?: string
}

/**
 * Отчёт об остатках с группировкой по товарам
 */
export interface StockReportByProduct extends StockReport {
  /** При группировке по товарам - данные о складе */
  store?: Meta<"store">
  /** При группировке по товарам - данные об организации */
  organization?: Meta<"organization">
}

/**
 * Отчёт об остатках с группировкой по складам
 */
export interface StockReportByStore extends StockReport {
  /** При группировке по складам - данные о товаре */
  assortment: Meta<"product" | "service" | "bundle" | "variant">
}

/**
 * Отчёт об остатках с группировкой по организациям
 */
export interface StockReportByOrganization extends StockReport {
  /** При группировке по организациям - данные о товаре */
  assortment: Meta<"product" | "service" | "bundle" | "variant">
  /** При группировке по организациям - данные о складе */
  store?: Meta<"store">
}

/**
 * Тип результата отчёта об остатках в зависимости от группировки
 */
export type GetStockReportResult<T extends StockGroupBy | undefined> = T extends "product"
  ? StockReportByProduct
  : T extends "store"
    ? StockReportByStore
    : T extends "organization"
      ? StockReportByOrganization
      : StockReport

interface StockReportOptions {
  /**
   * Группировка отчёта
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/reports/#otchety-ostatki-parametry-zaprosa
   */
  groupBy?: StockGroupBy

  expand?: Record<string, boolean>
  fields?: string[]

  /**
   * Опции пагинации
   */
  pagination?: PaginationOptions

  /**
   * Фильтры
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/reports/#otchety-ostatki-fil-try
   */
  filter?: {
    /** Фильтрация по идентификаторам товаров */
    id?: IdFilter

    /** Фильтрация по наименованиям товаров */
    name?: StringFilter

    /** Фильтрация по артикулам товаров */
    article?: StringFilter

    /** Фильтрация по кодам товаров */
    code?: StringFilter

    /** Фильтрация по внешним кодам товаров */
    externalCode?: StringFilter

    /** Фильтрация по штрихкодам */
    barcode?: EqualityFilter<string> | string | string[]

    /** Фильтрация по признаку архивности */
    archived?: ArchivedFilter

    /** Фильтрация по складам */
    store?: EqualityFilter<string> | string | string[]

    /** Фильтрация по организациям */
    organization?: EqualityFilter<string> | string | string[]

    /** Фильтрация по контрагентам */
    counterparty?: EqualityFilter<string> | string | string[]

    /** Фильтрация по отделам */
    group?: EqualityFilter<string> | string | string[]

    /** Фильтрация по группам товаров */
    productFolder?: EqualityFilter<string> | string | string[]

    /** Фильтрация по владельцам (сотрудникам) */
    owner?: EqualityFilter<string> | string | string[]

    /** Фильтрация по типу цены */
    priceType?: EqualityFilter<string> | string | string[]

    /** Фильтрация по типу номенклатуры */
    type?:
      | EqualityFilter<"product" | "service" | "bundle" | "variant">
      | ("product" | "service" | "bundle" | "variant")
      | ("product" | "service" | "bundle" | "variant")[]

    /** Фильтрация по остатку */
    stock?: NumberFilter

    /** Фильтрация по резерву */
    reserve?: NumberFilter

    /** Фильтрация по доступному количеству */
    quantity?: NumberFilter

    /** Фильтрация по себестоимости */
    cost?: NumberFilter

    /** Фильтрация по времени последнего обновления */
    updated?: DateTimeFilter

    /** Фильтрация по общему доступу */
    shared?: BooleanFilter

    /** Фильтрация по типу системы налогообложения */
    taxSystem?: EqualityFilter<
      | "GENERAL_TAX_SYSTEM"
      | "SIMPLIFIED_TAX_SYSTEM_INCOME"
      | "SIMPLIFIED_TAX_SYSTEM_INCOME_OUTCOME"
      | "UNIFIED_AGRICULTURAL_TAX"
      | "PRESUMPTIVE_TAX_SYSTEM"
      | "PATENT_BASED"
    >

    /** Параметр учета вложенных подгрупп */
    withSubFolders?: boolean
  }
}

/**
 * Модель отчёта об остатках для типизации фильтров
 */
export interface StockReportModel extends Model {
  object: StockReport
  expandable: {
    assortment: ProductModel
    store: StoreModel
    organization: OrganizationModel
    group: GroupModel
    owner: EmployeeModel
    productFolder: ProductFolderModel
  }
  filters: {
    id: IdFilter
    name: StringFilter
    article: StringFilter
    code: StringFilter
    externalCode: StringFilter
    barcode: StringFilter
    archived: ArchivedFilter
    store: IdFilter
    organization: IdFilter
    counterparty: IdFilter
    group: IdFilter
    productFolder: IdFilter
    owner: IdFilter
    priceType: IdFilter
    type: StringFilter
    stock: NumberFilter
    reserve: NumberFilter
    quantity: NumberFilter
    cost: NumberFilter
    updated: DateTimeFilter
    shared: BooleanFilter
    taxSystem: StringFilter
  }
}

/**
 * Модель товара для расширения (упрощённая версия для отчётов)
 */
interface ProductModel extends Model {
  object: {
    id: string
    name: string
    code?: string
    article?: string
    externalCode: string
    archived: boolean
    shared: boolean
    group: Meta<"group">
    owner?: Meta<"employee">
    productFolder?: Meta<"productfolder">
    pathName?: string
    barcodes?: Barcodes
    updated: DateTime
  }
  expandable: {
    group: GroupModel
    owner: EmployeeModel
    productFolder: ProductFolderModel
  }
  filters: EmptyObject
}

/**
 * Модель склада для расширения
 */
interface StoreModel extends Model {
  object: {
    id: string
    name: string
    code?: string
    externalCode: string
    archived: boolean
  }
  expandable: EmptyObject
  filters: EmptyObject
}

/**
 * Модель организации для расширения
 */
interface OrganizationModel extends Model {
  object: {
    id: string
    name: string
    code?: string
    externalCode: string
    archived: boolean
    inn?: string
    kpp?: string
  }
  expandable: EmptyObject
  filters: EmptyObject
}

/**
 * Модель группы товаров для расширения
 */
interface ProductFolderModel extends Model {
  object: {
    id: string
    name: string
    archived: boolean
  }
  expandable: EmptyObject
  filters: EmptyObject
}
