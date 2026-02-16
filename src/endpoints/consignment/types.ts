import type {
  AssortmentEntity,
  AssortmentModel,
  Attribute,
  DateTime,
  DateTimeFilter,
  IdFilter,
  Meta,
  Model,
  StringFilter,
} from "../../types"
import type { Barcodes, Idable } from "../../types/common"

/**
 * Серия
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-seriq
 */
export interface Consignment extends Idable, Meta<"consignment"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Доп. поля */
  attributes?: Attribute[]

  /** Ассортимент */
  assortment: Meta<AssortmentEntity>

  /** Штрихкоды */
  barcodes?: Barcodes

  /** Код */
  code?: string

  /** Описание */
  description?: string

  /** Внешний код серии */
  externalCode?: string

  /* Изображение товара, к которому относится данная серия */
  image?: Meta<"image">

  /** Метка Серии */
  label: string

  /**
   * Наименование Серии.
   *
   * "Собирается" и отображается как "Наименование товара / Метка Серии"
   */
  readonly name: string

  /** Момент последнего изменения */
  readonly updated: DateTime
}

/**
 * Модель Серии
 *
 * {@linkcode Consignment}
 */
export interface ConsignmentModel extends Model {
  object: Consignment

  expandable: {
    assortment: AssortmentModel
  }

  requiredFields: "label" | "assortment"

  filters: {
    id: IdFilter
    accountId: IdFilter
    barcodes: StringFilter
    code: StringFilter
    description: StringFilter
    externalCode: StringFilter
    name: StringFilter
    updated: DateTimeFilter
  }
}
