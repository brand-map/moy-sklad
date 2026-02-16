import type { Meta } from "./metadata"
import type { Idable } from "./common"
import type { Model } from "./model"

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
