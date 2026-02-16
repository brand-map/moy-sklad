import type { Attribute } from "./attribute"
import type { DateTime } from "./datetime"
import type { BooleanFilter, DateTimeFilter, IdFilter, StringFilter } from "./filters"
import type { Meta } from "./metadata"
import type { Idable } from "./common"
import type { Model } from "./model"

/**
 * Склад
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-sklad
 */
export interface Store extends Idable, Meta<"store"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Адрес склада */
  address?: string

  /** Адрес склада с детализацией по отдельным полям */
  addressFull?: {
    /** Другое */
    addInfo?: string
    /** Квартира */
    apartment?: string
    /** Город */
    city?: string
    /** Комментарий */
    comment?: string
    /** Метаданные страны */
    country?: Meta<"country">
    /** Дом */
    house?: string
    /** Почтовый индекс */
    postalCode?: string
    /** Метаданные региона */
    region?: Meta<"region">
    /** Улица */
    street?: string
  }

  /** Добавлен ли склад в архив */
  archived: boolean

  /** Массив метаданных дополнительных полей склада */
  attributes?: Attribute[]

  /** Код склада */
  code?: string

  /** Комментарий к складу */
  description?: string

  /** Внешний код склада */
  externalCode: string

  /** Метаданные отдела сотрудника */
  group: Meta<"group">

  /** Наименование склада */
  name: string

  /** Метаданные владельца (Сотрудника) */
  owner?: Meta<"employee">

  /** Метаданные родительского склада (Группы) */
  parent?: Meta<"store">

  /** Группа склада */
  pathName: string

  /** Общий доступ */
  shared: boolean

  /** Момент последнего обновления склада */
  readonly updated: DateTime
}

/**
 * Модель склада
 *
 * {@linkcode Store}
 */
export interface StoreModel extends Model {
  object: Store
  filters: {
    id: IdFilter
    accountId: IdFilter
    address: StringFilter
    archived: BooleanFilter
    code: StringFilter
    description: StringFilter
    externalCode: StringFilter
    group: IdFilter
    name: StringFilter
    owner: IdFilter
    parent: IdFilter
    pathName: StringFilter
    shared: BooleanFilter
    updated: DateTimeFilter
  }
}
