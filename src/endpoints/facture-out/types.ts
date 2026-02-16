import type {
  BooleanFilter,
  DateTime,
  DateTimeFilter,
  DocumentRate,
  Entity,
  ExpandOptions,
  FilterOptions,
  Idable,
  IdFilter,
  Meta,
  Model,
  NumberFilter,
  OrderOptions,
  PaginationOptions,
  PositionFields,
  StateModel,
  StringFilter,
  UpdateMeta,
} from "../../types"
import type { CounterpartyModel } from "../counterparty"
import type { EmployeeModel } from "../employee"
import type { GroupModel } from "../group"
import type { OrganizationModel } from "../organization"

/**
 * Счет-фактура выданный
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-schet-faktura-wydannyj
 */
export interface FactureOut extends Idable, Meta<"factureout"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Метаданные контрагента */
  agent: Meta<"counterparty">

  /** Отметка о проведении */
  applicable: boolean

  /** Коллекция метаданных доп. полей */
  attributes?: unknown[] // TODO add attributes types & filters

  /** Код выданного Счета-фактуры */
  code?: string

  /** Метаданные договора */
  contract?: Meta<"contract"> // TODO expand contract

  /** Дата создания */
  readonly created: DateTime

  /** Момент последнего удаления выданного Счета-фактуры */
  readonly deleted?: DateTime

  /** Комментарий выданного Счета-фактуры */
  description?: string

  /** Внешний код выданного Счета-фактуры */
  externalCode: string

  /** Метаданные массива Файлов (Максимальное количество файлов - 100) */
  files: unknown[] // TODO add files types & expand

  /** Отдел сотрудника */
  group: Meta<"group">

  /** Дата документа */
  moment: DateTime

  /** Наименование выданного Счета-фактуры */
  name: string

  /** Метаданные юрлица */
  organization: Meta<"organization">

  /** Владелец (Сотрудник) */
  owner?: Meta<"employee">

  /** Напечатан ли документ */
  readonly printed: boolean

  /** Опубликован ли документ */
  readonly published: boolean

  /** Валюта */
  rate: DocumentRate

  /** Общий доступ */
  shared: boolean

  /** Метаданные статуса выданного Счета-фактуры */
  state?: Meta<"state">

  /** Идентификатор государственного контракта, договора (соглашения) */
  stateContractId?: string

  /** Сумма выданного Счета-фактуры в копейках */
  readonly sum: number

  /** ID синхронизации. После заполнения недоступен для изменения */
  syncId?: string

  /** Момент последнего обновления выданного Счета-фактуры */
  readonly updated: DateTime

  // Связи с другими документами
  /** Массив ссылок на связанные отгрузки */
  demands?: Meta<"demand">[]

  /** Массив ссылок на связанные входящие платежи */
  payments?: Meta<"paymentin">[]

  /** Массив ссылок на связанные возвраты поставщикам */
  // returns?: Meta<"purchasereturn">[]; // TODO add PurchaseReturn entity when available

  // Другие поля
  /** Метаданные грузополучателя (контрагент или юрлицо) */
  consignee?: Meta<"counterparty"> | Meta<"organization">

  /** Название платежного документа */
  paymentNumber?: string

  /** Дата платежного документа */
  paymentDate?: DateTime
}

/**
 * Модель счета-фактуры выданного
 */
export interface FactureOutModel extends Model {
  object: FactureOut
  expandable: {
    agent: CounterpartyModel
    group: GroupModel
    organization: OrganizationModel
    owner: EmployeeModel
    state: StateModel
  }
  filters: {
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
    published: BooleanFilter
    shared: BooleanFilter
    state: IdFilter
    sum: NumberFilter
    syncId: IdFilter
    updated: DateTimeFilter
    isDeleted: BooleanFilter
  }
  orderableFields:
    | "id"
    | "syncId"
    | "updated"
    | "name"
    | "description"
    | "externalCode"
    | "moment"
    | "applicable"
    | "sum"
    | "created"
  requiredCreateFields: "organization"
}

/**
 * Опции для получения списка счетов-фактур выданных
 */
export interface ListFactureOutsOptions {
  pagination?: PaginationOptions
  fields?: PositionFields
  expand?: ExpandOptions<FactureOutModel>
  order?: OrderOptions<FactureOutModel>
  search?: string
  filter?: FilterOptions<FactureOutModel>
}

/**
 * Опции для получения счета-фактуры выданного
 */
export interface GetFactureOutOptions {
  expand?: ExpandOptions<FactureOutModel>
  fields?: PositionFields
}

/**
 * Опции для создания или обновления счета-фактуры выданного
 */
export interface UpsertFactureOutsOptions {
  expand?: ExpandOptions<FactureOutModel>
}

/**
 * Опции для получения первого счета-фактуры выданного
 */
export type FirstFactureOutOptions = Omit<ListFactureOutsOptions, "pagination">

/**
 * Опции для получения всех счетов-фактур выданных
 */
export type AllFactureOutsOptions = Omit<ListFactureOutsOptions, "pagination">

/**
 * Данные для создания шаблона счета-фактуры выданного
 */
export interface FactureOutTemplateData {
  /** Массив ссылок на связанные отгрузки */
  demands?: UpdateMeta<"demand">[]
  /** Массив ссылок на связанные входящие платежи */
  payments?: UpdateMeta<"paymentin">[]
  /** Массив ссылок на связанные возвраты поставщикам */
  // returns?: UpdateMeta<"purchasereturn">[]; // TODO add PurchaseReturn entity when available
}
