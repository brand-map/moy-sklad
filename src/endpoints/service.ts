import { ApiClient } from "../api-client"
import { composeSearchParameters } from "../api-client/compose-search-parameters"
import { endpointPaths } from "../endpoint-paths"
import type {
  ArchivedFilter,
  Attribute,
  BatchGetResult,
  BooleanFilter,
  DateTime,
  DateTimeFilter,
  GetFindResult,
  IdFilter,
  ListResponse,
  Meta,
  Model,
  StringFilter,
  Subset,
  TaxSystem,
} from "../types"
import type { Barcodes, Idable, PaginationOptions, PriceType } from "../types/common"
import type { EmployeeModel } from "./employee"
import type { GroupModel } from "./group"

/**
 * Признак предмета расчёта услуги.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-usluga-uslugi-atributy-suschnosti-priznak-predmeta-rascheta
 */
type ServicePaymentItemType =
  /** Услуга */
  | "SERVICE"
  /** Работа */
  | "WORK"
  /** Предоставление РИД */
  | "PROVIDING_RID"
  /** Составной предмет расчета */
  | "COMPOUND_PAYMENT_ITEM"
  /** Иной предмет расчета */
  | "ANOTHER_PAYMENT_ITEM"

/**
 * Услуга
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-usluga-uslugi
 */
interface Service extends Idable, Meta<"service"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Добавлена ли Услуга в архив */
  archived: boolean

  /** Коллекция доп. полей */
  attributes?: Attribute[]

  /**
   * Штрихкоды Услуги
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-usluga-uslugi-metadannye-uslug-shtrihkody
   * */
  barcodes?: Barcodes

  /**
   * Закупочная цена
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-usluga-uslugi-metadannye-uslug-zakupochnaq-cena
   */
  buyPrice?: {
    value: number
    currency: Meta<"currency">
  }

  /** Код Услуги */
  code?: string

  /** Описание Услуги */
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

  /** Внешний код Услуги */
  externalCode: string

  /**
   * Метаданные массива Файлов.
   *
   * Максимальное количество файлов — 100
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-fajly
   */
  files?: unknown[] // TODO add files types & expand

  /** Метаданные отдела сотрудника */
  group: Meta<"group">

  /**
   * Минимальная цена.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-usluga-uslugi-metadannye-uslug-minimal-naq-cena
   */
  minPrice?: {
    value: number
    currency: Meta<"currency">
  }

  /** Наименование Услуги */
  name: string

  /** Метаданные владельца (Сотрудника) */
  owner?: Meta<"employee">

  /**
   * Наименование группы, в которую входит Услуга
   *
   * Атрибут `pathName` сам по себе является атрибутом только для чтения, однако его можно изменить с помощью обновления атрибута `productFolder`.
   */
  readonly pathName?: string

  /** Признак предмета расчета */
  paymentItemType?: ServicePaymentItemType

  /** Метаданные группы */
  productFolder?: Meta<"productfolder"> // TODO add product folder expand

  /**
   * Цены продажи
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-usluga-uslugi-metadannye-uslug-ceny-prodazhi
   */
  salePrices?: {
    value: number
    currency: Meta<"currency">
    priceType: PriceType
  }[]

  /** Общий доступ */
  shared: boolean

  /** ID синхронизации */
  readonly syncId?: string

  /** Код системы налогообложения */
  taxSystem?: TaxSystem

  /** Единицы измерения */
  uom?: Meta<"uom"> // TODO add uom expand

  /** Момент последнего обновления сущности */
  readonly updated: DateTime

  /** Используется ли ставка НДС родительской группы */
  useParentVat: boolean

  /** НДС % */
  vat?: number

  /**
   * Включен ли НДС для услуги
   *
   * С помощью этого флага для услуги можно выставлять НДС = 0 или НДС = "без НДС":
   * - (`vat` = 0, `vatEnabled` = false) -> `vat` = "без НДС"
   * - (`vat` = 0, `vatEnabled` = true) -> `vat` = 0%
   */
  vatEnabled?: boolean
}

export interface ServiceModel extends Model {
  object: Service

  expandable: {
    group: GroupModel
    owner: EmployeeModel
  }

  requiredCreateFields: "name"

  filters: {
    id: IdFilter
    accountId: IdFilter
    archived: ArchivedFilter
    barcodes: StringFilter
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
  }
}

interface ListServicesOptions {
  pagination?: PaginationOptions
  expand?: import("../types").ExpandOptions<ServiceModel>
  order?: import("../types").OrderOptions<ServiceModel>
  search?: string
  filter?: import("../types").FilterOptions<ServiceModel>
}

// interface CreateServiceOptions {
//   expand?: import("../types").ExpandOptions<ServiceModel>
// }

// interface UpdateServiceOptions {
//   expand?: import("../types").ExpandOptions<ServiceModel>
// }

// interface GetServiceOptions {
//   expand?: import("../types").ExpandOptions<ServiceModel>
// }

type FirstServiceOptions = Omit<ListServicesOptions, "pagination">
type AllServiceOptions = Omit<ListServicesOptions, "pagination">

/**
 * Service endpoint class for fetching services from API.
 */
export class ServiceEndpoint {
  constructor(
    private readonly client: ApiClient,
    private readonly endpointPath: string = endpointPaths.entity.service,
  ) {}

  /**
   * Fetches services from API and parses JSON response.
   */
  private async fetchServicesResponse<T>(
    searchParameters?: URLSearchParams,
  ): Promise<ListResponse<GetFindResult<ServiceModel, T>, "service">> {
    const response = await this.client.get(this.endpointPath, {
      searchParameters: searchParameters ?? undefined,
    })

    return response.json() as Promise<ListResponse<GetFindResult<ServiceModel, T>, "service">>
  }

  /**
   * Gets list of services.
   *
   * @param options - List options including filters, pagination, expand, order, search
   */
  async list<T extends ListServicesOptions = ListServicesOptions>(
    options?: Subset<T, ListServicesOptions>,
  ): Promise<ListResponse<GetFindResult<ServiceModel, T["expand"]>, "service">> {
    const searchParameters = composeSearchParameters({
      pagination: options?.pagination,
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchServicesResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets all services.
   *
   * @param options - Options including filters, expand, order, search
   */
  async all<T extends AllServiceOptions = AllServiceOptions>(
    options?: Subset<T, AllServiceOptions>,
  ): Promise<BatchGetResult<GetFindResult<ServiceModel, T["expand"]>, "service">> {
    return this.client.batchGet(
      async (limit, offset) => {
        const searchParameters = composeSearchParameters({
          pagination: { limit, offset },
          expand: options?.expand,
          order: options?.order,
          search: options?.search,
          filter: options?.filter,
        })

        return this.fetchServicesResponse<T["expand"]>(searchParameters)
      },
      Boolean(options?.expand && Object.keys(options.expand).length > 0),
    )
  }

  /**
   * Gets the first service from the list.
   *
   * @param options - Options including filters, expand, order, search
   */
  async first<T extends FirstServiceOptions = FirstServiceOptions>(
    options?: Subset<T, FirstServiceOptions>,
  ): Promise<ListResponse<GetFindResult<ServiceModel, T["expand"]>, "service">> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      expand: options?.expand,
      order: options?.order,
      search: options?.search,
      filter: options?.filter,
    })

    return this.fetchServicesResponse<T["expand"]>(searchParameters)
  }

  /**
   * Gets a service by ID.
   *
   * @param id - Service ID
   * @returns Promise with service model
   */
  async byId(id: string): Promise<ServiceModel> {
    const response = await this.client.get(`${this.endpointPath}/${id}`)

    return response.json() as Promise<ServiceModel>
  }
}
