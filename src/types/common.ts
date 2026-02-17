import type { Meta } from "./metadata"

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

export type Barcodes = {
  ean13?: string
  ean8?: string
  code128?: string
  gtin?: string
}[]
