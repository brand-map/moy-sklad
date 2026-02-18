import type { Attribute } from "./attribute"
import type { BooleanFilter, DateTimeFilter, IdFilter, StringFilter } from "./filters"
import type { Meta } from "./common"
import type { DateTime, Idable } from "./common"
import type { Model } from "./model"

/**
 * Проект
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-proekt
 */
export interface Project extends Idable, Meta<"project"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Добавлен ли проект в архив */
  archived: boolean

  /** Коллекция дополнительных полей */
  attributes?: Attribute[]

  /** Код проекта */
  code?: string

  /** Описание проекта */
  description?: string

  /** Внешний код проекта */
  externalCode: string

  /** Метаданные отдела сотрудника */
  group: Meta<"group">

  /** Наименование проекта */
  name: string

  /** Метаданные владельца (Сотрудника) */
  owner?: Meta<"employee">

  /** Общий доступ */
  shared: boolean

  /** Момент последнего обновления проекта */
  readonly updated: DateTime
}

/**
 * Модель проекта
 *
 * {@linkcode Project}
 */
export interface ProjectModel extends Model {
  object: Project
  filters: {
    id: IdFilter
    accountId: IdFilter
    archived: BooleanFilter
    code: StringFilter
    description: StringFilter
    externalCode: StringFilter
    group: IdFilter
    name: StringFilter
    owner: IdFilter
    shared: BooleanFilter
    updated: DateTimeFilter
  }
}
