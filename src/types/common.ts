import type { Meta } from "./metadata"
import type { Model } from "./model"

export type DateTime = string

export interface Idable {
  readonly id: string
}

/**
 * Опции пагинации
 */
export interface PaginationOptions {
  /**
   * Максимальное количество элементов, которое вернется в одной странице. Мин 1, макс 1000.
   * @default 1000
   */
  limit?: number

  /**
   * Количество элементов, которые нужно пропустить перед началом сбора результирующего набора.
   * @default 0
   */
  offset?: number
}

export type MediaType = "application/json"

export interface PriceType extends Idable, Meta<"pricetype"> {
  name: string
  externalCode: string
}
export interface Context {
  employee: Meta<"employee">
}
export interface DocumentRate {
  currency: Meta<"currency"> // TODO expand currency
  value?: number
}

/**
 * Грузовая таможенная декларация (ГТД)
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-gruzowaq-tamozhennaq-deklaraciq-gtd
 */
export interface Gtd {
  /** Номер ГТД */
  name: string
}
/** Тип маркируемой продукции */
export type TrackingType =
  /** Пиво и слабоалкогольная продукция */
  | "BEER_ALCOHOL"
  /** Фотокамеры и лампы-вспышки */
  | "ELECTRONICS"
  /** Биологически активные добавки к пище */
  | "FOOD_SUPPLEMENT"
  /** Тип маркировки "Одежда" */
  | "LP_CLOTHES"
  /** Тип маркировки "Постельное белье" */
  | "LP_LINENS"
  /** Медизделия и кресла-коляски */
  | "MEDICAL_DEVICES"
  /** Молочная продукция */
  | "MILK"
  /** Никотиносодержащая продукция */
  | "NCP"
  /** Без маркировки */
  | "NOT_TRACKED"
  /** Альтернативная табачная продукция */
  | "OTP"
  /** Духи и туалетная вода */
  | "PERFUMERY"
  /** Антисептики */
  | "SANITIZER"
  /** Тип маркировки "Обувь" */
  | "SHOES"
  /** Безалкогольные напитки */
  | "SOFT_DRINKS"
  /** Шины и покрышки */
  | "TIRES"
  /** Тип маркировки "Табак" */
  | "TOBACCO"
  /** Упакованная вода */
  | "WATER"

export type TaxSystem =
  | "GENERAL_TAX_SYSTEM"
  | "SIMPLIFIED_TAX_SYSTEM_INCOME"
  | "SIMPLIFIED_TAX_SYSTEM_INCOME_OUTCOME"
  | "UNIFIED_AGRICULTURAL_TAX"
  | "PRESUMPTIVE_TAX_SYSTEM"
  | "PATENT_BASED"

export type Barcodes = {
  ean13?: string
  ean8?: string
  code128?: string
  gtin?: string
}[]

export type PositionFields = "stock"[]

/**
 * Остатки и себестоимость в позициях документов
 *
 * Для получения остатков и себестоимости в позициях документа в запросе нужно передать дополнительный параметр `fields=stock`.
 *
 * Остатки и себестоимость для документов Отгрузка, Розничная продажа, Приемка, Возврат поставщику, Возврат покупателя, Розничный возврат расчитываются на момент поля `moment` в данных документах. Для Заказа покупателя, Счета покупателя, Заказа поставщика, Счета поставщика рассчитываются на текущий момент времени.
 *
 * При составлении запроса на получение списка операций нужно дополнительно передать параметр `limit` со значением, не превышающем 100.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-ostatki-i-sebestoimost-w-poziciqh-dokumentow
 */
export interface PositionStockData {
  /** Сумма себестоимости. Для возврата покупателя без основания и розничного возврата без основания будет отсутствовать. */
  cost?: number
  /** Количество */
  quantity: number
  /** Зарезервировано */
  reserve: number
  /** В транзите */
  intransit: number
  /** Доступно */
  available: number
}

import type { ListMeta } from "."
import type { Entity } from "./entity"

export interface ListResponse<T, E extends Entity> extends ListMeta<E> {
  context: Context
  rows: T[]
}

/**
 * Статус
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-statusy-dokumentow
 */
export interface State extends Idable, Meta<"state"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Название статуса */
  name: string

  /** Цвет статуса */
  color: number

  /** Тип статуса */
  stateType: "Regular" | "Successful" | "Unsuccessful"

  /** Тип сущности */
  entityType: string
}

/**
 * Модель статуса
 *
 * {@linkcode State}
 */
export interface StateModel extends Model {
  object: State
}
