import type { DateTime, Entity, GreaterOrEqualsFilter, IdFilter, LessOrEqualsFilter, Meta, PaginationOptions } from "."

/**
 * Действие события аудита
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-tipy-sobytij
 */
export type AuditEventType =
  /** Регистрация */
  | "registration"
  /** Массовая операция */
  | "bulkoperation"
  /** Удаление публикации */
  | "closepublication"
  /** Создание сущностей */
  | "create"
  /** Удаление сущностей */
  | "delete"
  /** Создание публикации */
  | "openpublication"
  /** Печать документа */
  | "print"
  /** Помещение в архив */
  | "puttoarchive"
  /** Помещение в корзину */
  | "puttorecyclebin"
  /** Смена токена для Точки продаж */
  | "replacetoken"
  /** Извлечение из архива */
  | "restorefromarchive"
  /** Извлечение из корзины */
  | "restorefromrecyclebin"
  /** Отправка письма */
  | "sendemailfromentity"
  /** Изменение сущностей */
  | "update"

/**
 * Тип изменения
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-atributy-suschnosti
 */
export type AuditEventSource =
  /** Регистрация аккаунта */
  | "registration"
  /** Автоматическая очистка корзины */
  | "clearrecyclebin"
  /** Объединение */
  | "combine"
  /** Массовое создание */
  | "bulkcreate"
  /** Синхронизация с ИМ */
  | "connectors"
  /** Копирование */
  | "copy"
  /** Отправка сообщения */
  | "emailsend"
  /** Синхронизация с Эвотор */
  | "evotor"
  /** Экспорт */
  | "export"
  /** Экспорт в 1С Клиент ЭДО */
  | "exportediclient1c"
  /** Импорт */
  | "import"
  /** Импорт в 1С Клиент ЭДО */
  | "importediclient1c"
  /** JSON API (remap-1.0, remap-1.1, remap-1.2) */
  | "jsonapi"
  /** Вход или выход из МоегоСклада */
  | "loginlogout"
  /** Phone API */
  | "phone-1.0"
  /** POS API */
  | "posapi"
  /** REST API */
  | "restapi"
  /** Точка продаж */
  | "retail"
  /** Работа со сценариями */
  | "scriptor"

/**
 * Тип сущностей для настроек
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-atributy-suschnosti
 */
export type AuditObjectType =
  /** Настройки сущностей */
  | "ENTITY_SETTINGS"
  /** Настройки состояний */
  | "STATE_SETTINGS"
  /** Настройки шаблонов */
  | "TEMPLATE_SETTINGS"

/**
 * Diff для события регистрации
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-format-polq-diff-sobytie-registracii
 */
export interface RegistrationAuditDiff {
  /** Название аккаунта */
  account: string
  /** Конфигурация аккаунта (страна) */
  country: string
}

/**
 * Diff для событий публикации документов
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-format-polq-diff-sobytiq-publikacii-dokumentow
 */
export interface PublicationAuditDiff {
  /** Название шаблона */
  templateName: string
  /** Ссылка на публикацию */
  publicationHref: string
}

/**
 * Diff для событий отправки писем
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-format-polq-diff-sobytiq-otprawki-pisem
 */
export interface EmailAuditDiff {
  /** Почта отправителя письма */
  senderEmail: string
  /** Почта получателя письма */
  targetEmail: string
  /** Тема письма */
  subjectEmail: string
  /** Текст письма */
  text: string
}

/**
 * Diff для событий удаления сущностей
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-format-polq-diff-sobytiq-udaleniq-suschnostej
 */
export type DeleteAuditDiff = Record<
  string,
  {
    /** Значение атрибута до удаления */
    oldValue: unknown
  }
>

/**
 * Diff для событий обновления сущностей, перемещения/восстановления из корзины, перемещение/восстановление из архива
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq-format-polq-diff-sobytiq-obnovleniq-suschnostej-peremescheniq-wosstanowleniq-iz-korziny-peremeschenie-wosstanowlenie-iz-arhiwa
 */
export type UpdateAuditDiff = Record<
  string,
  {
    /** Значение атрибута до обновления */
    oldValue: unknown
    /** Значение атрибута после обновления */
    newValue: unknown
  }
>

/**
 * Объединенный тип для всех возможных diff
 */
export type AuditDiff =
  | RegistrationAuditDiff
  | PublicationAuditDiff
  | EmailAuditDiff
  | DeleteAuditDiff
  | UpdateAuditDiff

/**
 * Базовое событие аудита
 */
interface BaseAuditEvent {
  /** Дополнительная информация о Событии */
  readonly additionalInfo?: string

  /** Метаданные контекста */
  readonly audit: Meta<Entity.AuditEvent>

  /**
   * Метаданные сущности.
   *
   * Не будет выводиться только для товаров, услуг, модификаций, комплектов удаленных до 20.08.2017
   */
  readonly entity?: Meta<Entity>

  /** Название сущности */
  readonly entityType: Entity

  /** Время создания события */
  readonly moment: DateTime

  /** Имя сущности */
  readonly name: string

  /** Количество измененных объектов */
  readonly objectCount?: number

  /**
   * Тип сущностей, с которыми связанно данное изменение.
   *
   * Поле присутствует только для `entityType` = `entitysettings` или `statesettings` или `templatesettings`
   *
   * {@linkcode AuditObjectType}
   */
  readonly objectType?: AuditObjectType

  /**
   * Тип изменения
   *
   * {@linkcode AuditEventSource}
   */
  readonly source: AuditEventSource

  /**
   * Был ли доступ произведен поддержкой от имени пользователя.
   *
   * Флаг отсутствует, если значение false
   */
  readonly supportAccess?: boolean

  /** Логин Сотрудника */
  readonly uid: string
}

/**
 * Событие аудита
 *
 * События аудита содержат подробную информацию о произошедших изменениях, например, изменение значения поля.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/audit/#audit-audit-sobytiq
 */
export type AuditEvent =
  | (BaseAuditEvent & {
      readonly eventType: AuditEventType.Registration
      readonly diff?: RegistrationAuditDiff
    })
  | (BaseAuditEvent & {
      readonly eventType: AuditEventType.OpenPublication | AuditEventType.ClosePublication
      readonly diff?: PublicationAuditDiff
    })
  | (BaseAuditEvent & {
      readonly eventType: AuditEventType.SendEmailFromEntity
      readonly diff?: EmailAuditDiff
    })
  | (BaseAuditEvent & {
      readonly eventType: AuditEventType.Delete
      readonly diff?: DeleteAuditDiff
    })
  | (BaseAuditEvent & {
      readonly eventType:
        | AuditEventType.Update
        | AuditEventType.PutToArchive
        | AuditEventType.RestoreFromArchive
        | AuditEventType.PutToRecycleBin
        | AuditEventType.RestoreFromRecycleBin
      readonly diff?: UpdateAuditDiff
    })
  | (BaseAuditEvent & {
      readonly eventType:
        | AuditEventType.BulkOperation
        | AuditEventType.Create
        | AuditEventType.Print
        | AuditEventType.ReplaceToken
      readonly diff?: AuditDiff
    })

export interface GetAuditByEntityOptions {
  filter?: {
    moment?: Partial<GreaterOrEqualsFilter<DateTime> & LessOrEqualsFilter<DateTime>>
    /**
     * В качестве значения должен быть передан href сущности сотрудника. В отфильтрованную выборку попадут все сущности аудита, автором изменений которых является данный пользователь.
     */
    employee?: IdFilter

    /**
     * В качестве значения должен быть передан тип События, по которому должны быть отфильтрованы сущности аудита.
     */
    eventType?: AuditEventType
    /**
     * В качестве значения должен быть передан тип действия, по которому должны быть отфильтрованы сущности аудита.
     * Список возможных значений параметра:
     */
    source?: AuditEventSource
  }
  pagination?: PaginationOptions
}
