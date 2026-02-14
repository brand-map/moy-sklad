import type {
  BooleanFilter,
  Entity,
  Idable,
  IdFilter,
  Meta,
  Model,
  StringFilter,
} from "../../types"

/**
 * Действие, которое отслеживается вебхуком.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki-atributy-suschnosti-action
 */
export enum WebhookAction {
  /** Создание */
  Create = "CREATE",
  /** Обновление */
  Update = "UPDATE",
  /** Удаление */
  Delete = "DELETE",
  /** Обработано (только для асинхронных задач) */
  Processed = "PROCESSED",
}

/**
 * Режим отображения изменения сущности. Только для действия UPDATE.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki-atributy-suschnosti-difftype
 */
export enum WebhookDiffType {
  /** По умолчанию */
  None = "NONE",
  /** Передавать список изменённых полей в updatedFields */
  Fields = "FIELDS",
}

/**
 * HTTP метод запроса вебхука (в API всегда POST).
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki-atributy-suschnosti-method
 */
export enum WebhookMethod {
  Post = "POST",
}

/**
 * Вебхук — механизм отправки уведомлений при наступлении изменений в системе.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki
 */
export interface Webhook extends Idable, Meta<Entity.Webhook> {
  /** ID учетной записи */
  readonly accountId: string

  /**
   * Действие, которое отслеживается вебхуком.
   * PROCESSED доступно только для асинхронных задач.
   */
  action: WebhookAction

  /** Метаданные решения, создавшего вебхук (только для чтения) */
  readonly authorApplication?: { meta: { href: string; type: string; mediaType: string; metadataHref: string } }

  /**
   * Режим отображения изменения сущности. Только для action=UPDATE.
   * FIELDS — в уведомлении будут передаваться изменённые поля в updatedFields.
   */
  diffType?: WebhookDiffType

  /** Вебхук включен или отключен */
  enabled: boolean

  /** Тип сущности, к которой привязан вебхук */
  entityType: Entity

  /** HTTP метод запроса (в API всегда POST) */
  readonly method: WebhookMethod

  /** URL, по которому выполняется запрос. До 255 символов */
  url: string
}

export interface WebhookModel extends Model {
  object: Webhook
  expandable: Record<string, never>
  requiredCreateFields: "url" | "action" | "entityType"
  orderableFields: "id" | "entityType" | "url" | "action" | "enabled"
  filters: {
    id: IdFilter
    accountId: IdFilter
    entityType: StringFilter
    action: StringFilter
    url: StringFilter
    enabled: BooleanFilter
  }
}

/** Данные для создания вебхука */
export interface CreateWebhookData {
  /** URL, по которому будет выполняться запрос (до 255 символов) */
  url: string
  /** Действие: CREATE, UPDATE, DELETE, PROCESSED */
  action: WebhookAction
  /** Тип сущности (например: demand, supply, product) */
  entityType: string
  /**
   * Режим отображения изменения. Только для action=UPDATE.
   * FIELDS — в уведомлении будут передаваться изменённые поля.
   */
  diffType?: WebhookDiffType
}

/** Данные для обновления вебхука */
export interface UpdateWebhookData {
  /** Новый URL (до 255 символов) */
  url?: string
  /** Новое действие */
  action?: WebhookAction
  /** Включить или отключить вебхук */
  enabled?: boolean
  /** Режим отображения изменения (только для action=UPDATE) */
  diffType?: WebhookDiffType
}

/** Элемент массива для массового создания/обновления: новый вебхук или обновление по meta */
export type WebhookCreateOrUpdateItem =
  | CreateWebhookData
  | (UpdateWebhookData & { meta: Meta<Entity.Webhook> })

export interface ListWebhooksOptions {
  pagination?: import("../../types").PaginationOptions
  order?: import("../../types").OrderOptions<WebhookModel>
  filter?: import("../../types").FilterOptions<WebhookModel>
}

export type FirstWebhookOptions = Omit<ListWebhooksOptions, "pagination">
export type AllWebhooksOptions = Omit<ListWebhooksOptions, "pagination">
