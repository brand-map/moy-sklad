import type { RequireExactlyOne } from "../../types"
import type {
  AccountModel,
  AssortmentEntity,
  AssortmentModel,
  BooleanFilter,
  DateTime,
  DateTimeFilter,
  DocumentRate,
  Entity,
  ExpandOptions,
  FilterOptions,
  Idable,
  IdFilter,
  ListMeta,
  Meta,
  Model,
  NumberFilter,
  OrderOptions,
  PaginationOptions,
  PositionFields,
  ProjectModel,
  StateModel,
  StoreModel,
  StringFilter,
  UpdateMeta,
} from "../../types"
import type { CounterpartyModel } from "../counterparty"
import type { EmployeeModel } from "../employee"
import type { GroupModel } from "../group"
import type { OrganizationModel } from "../organization"

export type DemandOverheadDistribution = "weight" | "volume" | "price"

export interface DemandOverhead {
  sum: number
  distribution: DemandOverheadDistribution
}

export interface DemandPosition extends Idable, Meta<"demandposition"> {
  /** ID учетной записи */
  readonly accountId: string
  /** Метаданные товара/услуги/серии/модификации/комплекта, которую представляет собой позиция */
  assortment: Meta<AssortmentEntity>
  /** Себестоимость (только для услуг) */
  cost?: number
  /** Процент скидки или наценки. Наценка указывается отрицательным числом, т.е. -10 создаст наценку в 10% */
  discount?: number
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
  /** Ячейка на складе. */
  slot?: Meta<"slot">
  /** Серийные номера. Значение данного атрибута игнорируется, если товар позиции не находится на серийном учете. В ином случае количество товаров в позиции будет равно количеству серийных номеров, переданных в значении атрибута. */
  things?: string[]
  /** Коды маркировки товаров и транспортных упаковок. */
  trackingCodes?: unknown // TODO add trackingCodes type;
  /** Коды маркировки товаров в формате тега 1162. */
  trackingCodes_1162?: unknown // TODO add trackingCodes_1162 type;
  /** Накладные расходы. Если Позиции Отгрузки не заданы, то накладные расходы нельзя задать. */
  readonly overhead: number
  /** НДС, которым облагается текущая позиция */
  vat: number
  /** Включен ли НДС для позиции. С помощью этого флага для позиции можно выставлять НДС = 0 или НДС = "без НДС". (`vat` = `0`, `vatEnabled` = `false`) -> `vat` = "без НДС", (`vat` = `0`, `vatEnabled` = `true`) -> `vat` = 0%. */
  vatEnabled: boolean

  /** Данные по себестоимости и остаткам. */
  stock?: undefined
}

export interface DemandPositionModel extends Model {
  object: DemandPosition

  expandable: {
    assortment: AssortmentModel
  }
}

export interface Demand extends Idable, Meta<"demand"> {
  readonly accountId: string
  agent: Meta<"counterparty">
  agentAccount?: Meta<"account">
  applicable: boolean
  attributes: unknown // TODO add attributes types & filters
  code?: string
  contract?: Meta<"contract"> // TODO expand contract
  readonly created: DateTime
  readonly deleted?: DateTime
  description?: string
  externalCode: string
  files: unknown[] // TODO add files types & expand
  group: Meta<"group">
  moment: DateTime
  name: string
  organization: Meta<"organization">
  organizationAccount?: Meta<"account">
  overhead?: DemandOverhead
  owner: Meta<"employee">
  readonly payedSum: number
  positions: ListMeta<"demandposition"> // TODO add positions types & expand
  readonly printed: boolean
  project?: Meta<"project">
  readonly published: boolean
  rate: DocumentRate // TODO expand rate's currency
  salesChannel?: Meta<"saleschannel"> // TODO expand salesChannel
  shared: boolean
  shipmentAddress?: string
  shipmentAddressFull?: {
    addInfo?: string
    apartment?: string
    city?: string
    comment?: string
    country?: Meta<"country">
    house?: string
    postalCode?: string
    region?: Meta<"region">
    street?: string
  }
  state?: Meta<"state">
  store: Meta<"store">
  readonly sum: number
  syncId?: string
  readonly updated: DateTime
  vatEnabled: boolean
  vatIncluded?: boolean
  vatSum?: number

  customerOrder?: Meta<"customerorder"> // TODO expand customerOrder
  factureOut?: Meta<"factureout"> // TODO expand factureOut
  returns?: unknown[] // TODO expand returns
  payments?: Meta<"paymentin" | "paymentout">[] // TODO expand payments
  invoicesOut?: Meta<"invoiceout">[] // TODO expand invoicesOut

  cargoName?: string
  carrier?: Meta<"counterparty"> | Meta<"organization"> // TODO expand carrier
  consignee?: Meta<"counterparty"> | Meta<"organization"> // TODO expand consignee
  goodPackQuantity?: number
  shippingInstructions?: string
  stateContractId?: string
  transportFacility?: string
  transportFacilityNumber?: string
}

export interface DemandModel extends Model {
  object: Demand
  expandable: {
    agent: CounterpartyModel
    group: GroupModel
    organization: OrganizationModel
    owner: EmployeeModel
    positions: DemandPositionModel
    agentAccount: AccountModel
    organizationAccount: AccountModel
    store: StoreModel
    project: ProjectModel
    state: StateModel
  }
  filters: {
    assortment: IdFilter
    id: IdFilter
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
    salesChannel: IdFilter
    shared: BooleanFilter
    shipmentAddress: StringFilter
    state: IdFilter
    store: IdFilter
    sum: NumberFilter
    syncId: IdFilter
    updated: DateTimeFilter
    isDeleted: BooleanFilter
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
    | "created"
  requiredCreateFields: "agent" | "organization" | "store"
}

export interface ListDemandsOptions {
  pagination?: PaginationOptions
  fields?: PositionFields
  expand?: ExpandOptions<DemandModel>
  order?: OrderOptions<DemandModel>
  search?: string
  filter?: FilterOptions<DemandModel>
}

export interface GetDemandOptions {
  expand?: ExpandOptions<DemandModel>
  fields?: PositionFields
}

export interface UpsertDemandsOptions {
  expand?: ExpandOptions<DemandModel>
}

export type FirstDemandOptions = Omit<ListDemandsOptions, "pagination">
export type AllDemandsOptions = Omit<ListDemandsOptions, "pagination">

export type DemandTemplateData = RequireExactlyOne<{
  customerOrder: UpdateMeta<"customerorder">
  invoiceOut: UpdateMeta<"invoiceout">
}>
