import type {
  BooleanFilter,
  DateTime,
  DateTimeFilter,
  ExpandOptions,
  FilterOptions,
  IdFilter,
  Meta,
  Model,
  NumberFilter,
  OrderOptions,
  StringFilter,
} from "../../types"
import type { Idable, PaginationOptions } from "../../types/common"
import type { BonusProgramModel } from "../bonus-program"
import type { CounterpartyModel } from "../counterparty"
import type { EmployeeModel } from "../employee"
import type { GroupModel } from "../group"
import type { OrganizationModel } from "../organization"

/** Категория бонусной операции */
export type BonusTransactionCategoryType = "REGULAR" | "WELCOME"

/** Статус бонусной операции */
export type BonusTransactionStatus = "WAIT_PROCESSING" | "COMPLETED" | "CANCELED"

/** Тип бонусной операции */
export type BonusTransactionType = "EARNING" | "SPENDING"

/**
 * Бонусная операция
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-bonusnaq-operaciq-bonusnye-operacii
 */
export interface BonusTransaction extends Idable, Meta<"bonustransaction"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Метаданные Контрагента, связанного с бонусной операцией */
  agent: Meta<"counterparty">

  /** Отметка о проведении */
  applicable: boolean

  /** Метаданные бонусной программы */
  bonusProgram?: Meta<"bonusprogram">

  /** Количество бонусных баллов */
  bonusValue?: number

  /**
   * Категория бонусной операции.
   *
   * {@linkcode BonusTransactionCategoryType}
   */
  readonly categoryType?: BonusTransactionCategoryType

  /** Код Бонусной операции */
  code?: string

  /** Момент создания Бонусной операции */
  created: DateTime

  /**
   * Дата обработки операции.
   *
   * При создании или редактировании бонусной операции начисления данный атрибут позволяет указать дату обработки операции. Если атрибут не указан, то операция будет обработана сразу, без задержки.
   * Для возможности указания даты обработки в будущем должна быть включена тарифная опция "Расширенная бонусная программа".
   */
  executionDate?: DateTime

  /** Внешний код Бонусной операции */
  externalCode: string

  /** Отдел сотрудника */
  group: Meta<"group">
  /** Время проведения бонусной операции */
  moment?: DateTime

  /** Наименование Бонусной операции */
  name?: string

  /** Метаданные юрлица */
  organization?: Meta<"organization">

  /** Владелец (Сотрудник) */
  owner?: Meta<"employee">

  /** Метаданные связанного документа бонусной операции */
  parentDocument?: Meta<never>

  /** Общий доступ */
  shared: boolean

  /**
   * Статус бонусной операции
   *
   * {@linkcode BonusTransactionStatus}
   */
  readonly transactionStatus?: BonusTransactionStatus
  /**
   * Тип бонусной операции
   *
   * {@linkcode BonusTransactionType}
   */
  transactionType: BonusTransactionType

  /** Момент последнего обновления Бонусной операции */
  updated: DateTime
}

export interface BonusTransactionModel extends Model {
  /** Основная сущность бонусной операции {@linkcode BonusTransaction} */
  object: BonusTransaction

  expandable: {
    agent: CounterpartyModel
    owner: EmployeeModel
    group: GroupModel
    bonusProgram: BonusProgramModel
    organization: OrganizationModel
  }

  orderableFields:
    | "id"
    | "applicable"
    | "bonusValue"
    | "code"
    | "created"
    | "executionDate"
    | "externalCode"
    | "moment"
    | "name"
    | "shared"
    | "updated"

  requiredCreateFields: "agent" | "transactionType"

  filters: {
    accountId: IdFilter
    agent: IdFilter
    applicable: BooleanFilter
    bonusProgram: IdFilter
    bonusValue: NumberFilter
    code: StringFilter
    created: DateTimeFilter
    externalCode: StringFilter
    group: IdFilter
    id: IdFilter
    moment: DateTimeFilter
    name: StringFilter
    organization: IdFilter
    owner: IdFilter
    shared: BooleanFilter
    updated: DateTimeFilter
    updatedBy: IdFilter
  }
}

export interface ListBonusTransactionsOptions {
  /**
   * Опции пагинации
   *
   * {@linkcode PaginationOptions}
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.bonusTransaction.list({
   *  pagination: { limit: 10, offset: 0 },
   * })
   * ```
   */
  pagination?: PaginationOptions

  /**
   * Замена ссылок объектами с помощью expand
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.bonusTransaction.list({
   *   expand: {
   *     owner: {
   *       group: true
   *     },
   *     organization: true,
   *   }
   * });
   * ```
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-zamena-ssylok-ob-ektami-s-pomosch-u-expand
   */
  expand?: ExpandOptions<BonusTransactionModel>

  /**
   * Опции сортировки
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/workbook/#workbook-fil-traciq-listanie-poisk-i-sortirowka-sortirowka
   *
   * @example Одно поле
   * ```ts
   * const { rows } = await moysklad.bonusTransaction.list({
   *   order: { field: "moment", direction: "asc" },
   * })
   * ```
   *
   * @example Несколько полей
   * ```ts
   * const { rows } = await moysklad.bonusTransaction.list({
   *   order: [
   *     { field: "moment", direction: "asc" },
   *     { field: "created", direction: "desc" },
   *   ],
   * })
   * ```
   */
  order?: OrderOptions<BonusTransactionModel>

  /**
   * Контекстный поиск
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-kontextnyj-poisk
   */
  search?: string

  /**
   * Фильтры
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-fil-traciq-wyborki-s-pomosch-u-parametra-filter
   *
   * @example
   * ```ts
   * await moysklad.bonusTransaction.list({
   *   filter: {
   *     name: {
   *       sw: "test",
   *     }
   *   }
   * });
   * ```
   */
  filter?: FilterOptions<BonusTransactionModel>
}

export type AllBonusTransactionsOptions = Omit<ListBonusTransactionsOptions, "pagination">

export type FirstBonusTransactionOptions = Omit<ListBonusTransactionsOptions, "pagination">

export interface GetBonusTransactionOptions {
  /**
   * Замена ссылок объектами с помощью expand
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.bonusTransaction.get("123", {
   *   expand: {
   *     owner: {
   *       group: true
   *     },
   *     organization: true,
   *   }
   * });
   * ```
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-zamena-ssylok-ob-ektami-s-pomosch-u-expand
   */
  expand?: ExpandOptions<BonusTransactionModel>
}

export interface UpdateBonusTransactionOptions {
  /**
   * Замена ссылок объектами с помощью expand
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.bonusTransaction.update("123", {...}, {
   *   expand: {
   *     owner: {
   *       group: true
   *     },
   *     organization: true,
   *   }
   * });
   * ```
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-zamena-ssylok-ob-ektami-s-pomosch-u-expand
   */
  expand?: ExpandOptions<BonusTransactionModel>
}

export interface CreateBonusTransactionOptions {
  /**
   * Замена ссылок объектами с помощью expand
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.bonusTransaction.create({...}, {
   *   expand: {
   *     owner: {
   *       group: true
   *     },
   *     organization: true,
   *   }
   * });
   * ```
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-zamena-ssylok-ob-ektami-s-pomosch-u-expand
   */
  expand?: ExpandOptions<BonusTransactionModel>
}

export interface UpsertBonusTransactionOptions {
  expand?: ExpandOptions<BonusTransactionModel>
}
