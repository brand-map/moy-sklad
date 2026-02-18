import { ApiClient } from "../api-client"
import type {
  BatchDeleteResult,
  BatchGetResult,
  BooleanFilter,
  Entity,
  GetFindResult,
  IdFilter,
  ListResponse,
  Meta,
  Model,
  StringFilter,
} from "../types"
import type { Idable } from "../types/common"
import { composeSearchParameters } from "../utils/compose-search-parameters"

/**
 * Webhook endpoint class for managing webhooks.
 */
export class WebhookEndpoint {
  private endpointPath = "entity/webhook"

  constructor(private client: ApiClient) {}

  /**
   * Получить список вебхуков.
   *
   * @param options - Опции: пагинация, сортировка, фильтры
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-poluchit-spisok-vebhukov
   */
  async list<T>(): Promise<ListResponse<GetFindResult<WebhookModel, undefined>, "webhook">> {
    // const searchParameters = composeSearchParameters({
    //   pagination: options?.pagination,
    //   order: options?.order,
    //   filter: options?.filter,
    // })
    return this.client.get(this.endpointPath).then((res) => res.json()) as any
  }

  /**
   * Получить все вебхуки с учётом пагинации.
   */
  async all<T>(): Promise<BatchGetResult<Webhook, "webhook">> {
    return this.client.batchGet(async (limit, offset) => {
      const searchParameters = composeSearchParameters({
        pagination: { limit, offset },
      })
      return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
    }, false)
  }

  /**
   * Получить все вебхуки как асинхронный генератор (чанк за чанком).
   *
   * @param options - Опции: сортировка, фильтры
   * @yields Batch chunk with context and rows
   *
   * @example
   * ```ts
   * for await (const chunk of webhookEndpoint.allChunks({ filter: { enabled: true } })) {
   *   console.log(chunk.rows.length)
   * }
   * ```
   */
  async *allChunks<T>(options?: T): AsyncGenerator<BatchGetResult<Webhook, "webhook">, void, void> {
    yield* this.client.getChunks(async (limit, offset) => {
      const searchParameters = composeSearchParameters({
        pagination: { limit, offset },
        // order: options?.order,
        // filter: options?.filter,
      })
      return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
    }, false)
  }

  /**
   * Получить первый вебхук из списка.
   */
  async first<T>(options?: T): Promise<ListResponse<Webhook, "webhook">> {
    const searchParameters = composeSearchParameters({
      pagination: { limit: 1 },
      // order: options?.order,
      // filter: options?.filter,
    })
    return this.client.get(this.endpointPath, { searchParameters }).then((res) => res.json()) as any
  }

  /**
   * Получить вебхук по ID.
   *
   * @param id - UUID вебхука
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-poluchit-otdelnyj-vebhuk
   */
  async byId(id: string): Promise<Webhook> {
    return this.client.get(`${this.endpointPath}/${id}`).then((res) => res.json()) as any
  }

  /**
   * Создать вебхук.
   * Сочетание entityType, action, url должно быть уникальным.
   *
   * @param data - Данные вебхука: url, action, entityType [, diffType для UPDATE]
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-sozdat-vebhuk
   */
  async create(data: CreateWebhookData): Promise<Webhook> {
    return this.client.post(this.endpointPath, { body: data }).then((res) => res.json()) as any
  }

  /**
   * Изменить вебхук.
   *
   * @param id - UUID вебхука
   * @param data - Поля для обновления: url, action, enabled, diffType
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-izmenit-vebhuk
   */
  async update(id: string, data: UpdateWebhookData): Promise<Webhook> {
    return this.client.put(`${this.endpointPath}/${id}`, { body: data }).then((res) => res.json()) as any
  }

  /**
   * Удалить вебхук.
   *
   * @param id - UUID вебхука
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-udalit-vebhuk
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`${this.endpointPath}/${id}`)
  }

  /**
   * Массовое создание и обновление вебхуков.
   * В массиве: объекты без meta — создание, с meta — обновление.
   * Для запроса требуется id в URL (при массовом создании можно передать любой валидный UUID).
   *
   * @param items - Массив данных для создания или обновления (с meta для обновления)
   * @param urlId - UUID для пути запроса (если не передан, берётся из первого элемента с meta или placeholder)
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-massovoe-sozdanie-i-obnovlenie-vebhukov
   */
  async batchCreateOrUpdate(items: WebhookCreateOrUpdateItem[], urlId?: string): Promise<Webhook[]> {
    const id = urlId ?? (items[0] && "meta" in items[0] ? items[0].meta.href.split("/").pop() : "")
    return this.client.post(`${this.endpointPath}/${id}`, { body: items }).then((res) => res.json()) as any
  }

  /**
   * Массовое удаление вебхуков.
   *
   * @param metaList - Массив метаданных вебхуков для удаления
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-massovoe-udalenie-vebhukov
   */
  async batchDelete(metaList: Meta<"webhook">[]): Promise<BatchDeleteResult[]> {
    return this.client.post(`${this.endpointPath}/delete`, { body: metaList }).then((res) => res.json()) as any
  }
}

/**
 * Действие, которое отслеживается вебхуком.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki-atributy-suschnosti-action
 */
type WebhookAction =
  /** Создание */
  | "CREATE"
  /** Обновление */
  | "UPDATE"
  /** Удаление */
  | "DELETE"
  /** Обработано (только для асинхронных задач) */
  | "PROCESSED"

/**
 * Режим отображения изменения сущности. Только для действия UPDATE.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki-atributy-suschnosti-difftype
 */
type WebhookDiffType =
  /** По умолчанию */
  | "NONE"
  /** Передавать список изменённых полей в updatedFields */
  | "FIELDS"

/**
 * HTTP метод запроса вебхука (в API всегда POST).
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki-atributy-suschnosti-method
 */
type WebhookMethod = "POST"

/**
 * Вебхук — механизм отправки уведомлений при наступлении изменений в системе.
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#webhuki
 */
interface Webhook extends Idable, Meta<"webhook"> {
  /** ID учетной записи */
  readonly accountId: string

  /**
   * Действие, которое отслеживается вебхуком.
   * PROCESSED доступно только для асинхронных задач.
   */
  action: WebhookAction

  /** Метаданные решения, создавшего вебхук (только для чтения) */
  readonly authorApplication?: {
    meta: { href: string; type: string; mediaType: string; metadataHref: string }
  }

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

interface WebhookModel extends Model {
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
interface CreateWebhookData {
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
interface UpdateWebhookData {
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
type WebhookCreateOrUpdateItem = CreateWebhookData | (UpdateWebhookData & Meta<"webhook">)

// interface ListWebhooksOptions {
//   pagination?: PaginationOptions
//   order?: import("../types").OrderOptions<WebhookModel>
//   filter?: import("../types").FilterOptions<WebhookModel>
// }

// type FirstWebhookOptions = Omit<ListWebhooksOptions, "pagination", '>
// type AllWebhooksOptions = Omit<ListWebhooksOptions, "pagination">
