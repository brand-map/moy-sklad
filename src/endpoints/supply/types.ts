import type {
  AccountModel,
  AssortmentEntity,
  AssortmentModel,
  Attribute,
  BooleanFilter,
  DateTime,
  DateTimeFilter,
  ExpandOptions,
  FilterOptions,
  IdFilter,
  ListMeta,
  Meta,
  Model,
  NumberFilter,
  OrderOptions,
  StringFilter,
  UpdateMeta,
} from "../../types"
import type { DocumentRate, Gtd, Idable, PaginationOptions } from "../../types/common"
import type { CounterpartyModel } from "../counterparty"
import type { EmployeeModel } from "../employee"
import type { GroupModel } from "../group"
import type { OrganizationModel } from "../organization"
import type { PurchaseOrderModel } from "../purchase-order"

export type SupplyOverheadDistribution = "weight" | "volume" | "price"

export interface SupplyOverhead {
  sum: number
  distribution: SupplyOverheadDistribution
}

/**
 * Позиция приёмки
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-priemka-poziciq-priemki
 */
export interface SupplyPosition extends Idable, Meta<"supplyposition"> {
  /** ID учетной записи */
  readonly accountId: string
  /** Метаданные товара/услуги/серии/модификации/комплекта, которую представляет собой позиция */
  assortment: Meta<AssortmentEntity>
  /** Метаданные страны */
  country?: Meta<"country"> // TODO expand country,
  /**
   * Процент скидки или наценки
   *
   * Наценка указывается отрицательным числом, т.е. -10 создаст наценку в 10%
   */
  discount: number
  /** ГТД */
  gtd?: Gtd
  /**
   * Упаковка Товара.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar-towary-atributy-wlozhennyh-suschnostej-upakowki-towara
   */
  pack?: unknown // TODO add pack type;
  /** Цена товара/услуги в копейках */
  price: number
  /**
   * Количество товаров/услуг данного вида в позиции.
   *
   * Если позиция - товар, у которого включен учет по серийным номерам, то значение в этом поле всегда будет равно количеству серийных номеров для данной позиции в документе. */
  quantity: number
  /**
   * Ячейка на складе
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-sklad-yachejki-sklada
   */
  slot?: Meta<"slot"> // TODO add slot expand
  /**
   * Серийные номера
   *
   * Значение данного атрибута игнорируется, если товар позиции не находится на серийном учете. В ином случае количество товаров в позиции будет равно количеству серийных номеров, переданных в значении атрибута.
   */
  things?: string[]
  /**
   * Коды маркировки товаров и транспортных упаковок
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-priemka-priemki-kody-markirowki-towarow-i-transportnyh-upakowok
   */
  trackingCodes?: unknown // TODO add trackingCodes type;
  /**
   * Накладные расходы
   *
   * Если Позиции Приемки не заданы, то накладные расходы нельзя задать.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-priemka-priemki-nakladnye-rashody
   */
  readonly overhead: number
  /** НДС, которым облагается текущая позиция */
  vat: number
  /**
   * Включен ли НДС для позиции
   *
   * С помощью этого флага для позиции можно выставлять НДС = 0 или НДС = "без НДС". (`vat` = `0`, `vatEnabled` = `false`) -> `vat` = "без НДС", (`vat` = `0`, `vatEnabled` = `true`) -> `vat` = 0%. */
  vatEnabled: boolean
}

/**
 * Модель позиции приёмки
 *
 * {@linkcode SupplyPosition}
 */
export interface SupplyPositionModel extends Model {
  object: SupplyPosition
  expandable: {
    assortment: AssortmentModel
  }
}

/**
 * Приёмка
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-priemka-priemki
 */
export interface Supply extends Idable, Meta<"supply"> {
  /** ID учетной записи */
  readonly accountId: string
  /** Метаданные контрагента */
  agent: Meta<"counterparty">
  /** Метаданные счета контрагента */
  agentAccount?: Meta<"account">
  /** Отметка о проведении */
  applicable: boolean
  /**
   * Коллекция метаданных доп. полей.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-rabota-s-dopolnitel-nymi-polqmi
   */
  attributes?: Attribute[]
  /** Код Приемки */
  code?: string
  /** Метаданные договора */
  contract?: Meta<"contract">
  /** Дата создания */
  readonly created: DateTime
  /** Момент последнего удаления Приемки */
  readonly deleted?: DateTime
  /** Комментарий Приемки */
  description?: string
  /** Внешний код Приемки */
  externalCode: string
  /**
   * Метаданные массива Файлов
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-fajly
   */
  files: unknown[] // TODO add files
  /** Отдел сотрудника */
  group: Meta<"group">
  /** Входящая дата */
  incomingDate?: DateTime
  /** Входящий номер */
  incomingNumber?: string
  /** Дата документа */
  moment: DateTime
  /** Наименование прёмки */
  name: string
  /** Метаданные юрлица */
  organization: Meta<"organization">
  /** Метаданные счёта юрлица */
  organizationAccount?: Meta<"account">
  /**
   * Накладные расходы
   *
   * Если Позиции Приемки не заданы, то накладные расходы нельзя задать.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-priemka-priemki-nakladnye-rashody
   */
  overhead?: SupplyOverhead
  /** Владелец (сотдруник) */
  owner?: Meta<"employee">
  /** Сумма входящих платежей по приёмке */
  readonly payedSum: number
  /** Метаданные позиций */
  positions: ListMeta<"supplyposition">
  /** Напечатан ли документ */
  readonly printed: boolean
  /** Метаданные проекта */
  project?: Meta<"project">
  /** Опубликован ли документ */
  readonly published: boolean
  /**
   * Валюта.
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-obschie-swedeniq-valuta-w-dokumentah
   */
  rate: DocumentRate
  /** Общий доступ */
  shared: boolean
  /** Метаданные статуса приёмки */
  state?: Meta<"state">
  /** Метаданные склада */
  store: Meta<"store">
  /** Сумма приёмки в копейках */
  readonly sum: number
  /**
   * ID синхронизации
   *
   * После заполнения недоступен для изменения.
   * */
  syncId?: string
  /** Момент последнего обновления приёмки */
  readonly updated: DateTime
  /** Учитывается ли НДС */
  vatEnabled: boolean
  /** Включен ли НДС в цену */
  vatIncluded?: boolean
  /** Сумма НДС */
  vatSum: number
  /**
   * Ссылка на связанный заказ поставщику в формате Метаданных
   *
   * {@linkcode PurchaseOrderModel}
   */
  purchaseOrder?: Meta<"purchaseorder">
}

/**
 * Модель приёмки
 *
 * {@linkcode Supply}
 */
export interface SupplyModel extends Model {
  object: Supply
  expandable: {
    agent: CounterpartyModel
    group: GroupModel
    organization: OrganizationModel
    owner: EmployeeModel
    positions: SupplyPositionModel
    agentAccount: AccountModel
    organizationAccount: AccountModel
    purchaseOrder: PurchaseOrderModel
  }
  filters: {
    id: IdFilter
    assortment: IdFilter
    accountId: IdFilter
    agent: IdFilter
    applicable: BooleanFilter
    code: StringFilter
    contract: IdFilter
    created: DateTimeFilter
    deleted: DateTimeFilter
    description: StringFilter
    externalCode: StringFilter
    group: IdFilter
    moment: DateTimeFilter
    name: StringFilter
    organization: IdFilter
    owner: IdFilter
    printed: BooleanFilter
    project: IdFilter
    published: BooleanFilter
    shared: BooleanFilter
    state: IdFilter
    store: IdFilter
    sum: NumberFilter
    syncId: IdFilter
    updated: DateTimeFilter
  }
  orderableFields:
  | "id"
  | "syncId"
  | "updated"
  | "updatedBy"
  | "name"
  | "description"
  | "externalCode"
  | "moment"
  | "applicable"
  | "sum"
  requiredCreateFields: "agent" | "organization" | "store"
}

export interface ListSuppliesOptions {
  pagination?: PaginationOptions
  expand?: ExpandOptions<SupplyModel>
  order?: OrderOptions<SupplyModel>
  search?: string
  filter?: FilterOptions<SupplyModel>
}

export interface GetSupplyOptions {
  expand?: ExpandOptions<SupplyModel>
}

export interface UpdateSupplyOptions {
  expand?: ExpandOptions<SupplyModel>
}

export interface UpsertSuppliesOptions {
  expand?: ExpandOptions<SupplyModel>
}

export type FirstSupplyOptions = Omit<ListSuppliesOptions, "pagination">
export type AllSuppliesOptions = Omit<ListSuppliesOptions, "pagination">

export interface SupplyTemplateData {
  purchaseOrder: UpdateMeta<"purchaseorder">
}
