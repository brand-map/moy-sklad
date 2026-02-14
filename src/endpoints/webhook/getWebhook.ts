import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type {
  BatchDeleteResult,
  BatchGetResult,
  Entity,
  GetFindResult,
  ListResponse,
  Meta,
  Subset,
} from "../../types"
import type {
  AllWebhooksOptions,
  CreateWebhookData,
  FirstWebhookOptions,
  ListWebhooksOptions,
  UpdateWebhookData,
  Webhook,
  WebhookCreateOrUpdateItem,
  WebhookModel,
} from "./types"

const webhookPath = endpointPaths.entity.webhook

async function fetchWebhooksResponse(
  client: ApiClient,
  searchParameters?: URLSearchParams,
): Promise<ListResponse<Webhook, Entity.Webhook>> {
  const response = await client.get(webhookPath, {
    searchParameters: searchParameters ?? undefined,
  })
  return response.json() as Promise<ListResponse<Webhook, Entity.Webhook>>
}

/**
 * Получить список вебхуков.
 *
 * @param client - API клиент
 * @param options - Опции: пагинация, сортировка, фильтры
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-poluchit-spisok-vebhukov
 */
export async function listWebhooks<
  T extends ListWebhooksOptions,
>(
  client: ApiClient,
  options?: Subset<T, ListWebhooksOptions>,
): Promise<ListResponse<GetFindResult<WebhookModel, undefined>, Entity.Webhook>> {
  const searchParameters = composeSearchParameters({
    pagination: options?.pagination,
    order: options?.order,
    filter: options?.filter,
  })
  return fetchWebhooksResponse(client, searchParameters)
}

/**
 * Получить все вебхуки с учётом пагинации.
 */
export async function allWebhooks<
  T extends AllWebhooksOptions,
>(
  client: ApiClient,
  options?: Subset<T, AllWebhooksOptions>,
): Promise<BatchGetResult<Webhook, Entity.Webhook>> {
  return client.batchGet(async (limit, offset) => {
    const searchParameters = composeSearchParameters({
      pagination: { limit, offset },
      order: options?.order,
      filter: options?.filter,
    })
    return fetchWebhooksResponse(client, searchParameters)
  }, false)
}

/**
 * Получить первый вебхук из списка.
 */
export async function firstWebhook<
  T extends FirstWebhookOptions,
>(
  client: ApiClient,
  options?: Subset<T, FirstWebhookOptions>,
): Promise<ListResponse<Webhook, Entity.Webhook>> {
  const searchParameters = composeSearchParameters({
    pagination: { limit: 1 },
    order: options?.order,
    filter: options?.filter,
  })
  return fetchWebhooksResponse(client, searchParameters)
}

/**
 * Получить вебхук по ID.
 *
 * @param client - API клиент
 * @param id - UUID вебхука
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-poluchit-otdelnyj-vebhuk
 */
export async function getWebhook(
  client: ApiClient,
  id: string,
): Promise<Webhook> {
  const response = await client.get(`${webhookPath}/${id}`)
  return response.json() as Promise<Webhook>
}

/**
 * Создать вебхук.
 * Сочетание entityType, action, url должно быть уникальным.
 *
 * @param client - API клиент
 * @param data - Данные вебхука: url, action, entityType [, diffType для UPDATE]
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-sozdat-vebhuk
 */
export async function createWebhook(
  client: ApiClient,
  data: CreateWebhookData,
): Promise<Webhook> {
  const response = await client.post(webhookPath, { body: data })
  return response.json() as Promise<Webhook>
}

/**
 * Изменить вебхук.
 *
 * @param client - API клиент
 * @param id - UUID вебхука
 * @param data - Поля для обновления: url, action, enabled, diffType
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-izmenit-vebhuk
 */
export async function updateWebhook(
  client: ApiClient,
  id: string,
  data: UpdateWebhookData,
): Promise<Webhook> {
  const response = await client.put(`${webhookPath}/${id}`, { body: data })
  return response.json() as Promise<Webhook>
}

/**
 * Удалить вебхук.
 *
 * @param client - API клиент
 * @param id - UUID вебхука
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-udalit-vebhuk
 */
export async function deleteWebhook(
  client: ApiClient,
  id: string,
): Promise<void> {
  await client.delete(`${webhookPath}/${id}`)
}

/**
 * Массовое создание и обновление вебхуков.
 * В массиве: объекты без meta — создание, с meta — обновление.
 * Для запроса требуется id в URL (при массовом создании можно передать любой валидный UUID).
 *
 * @param client - API клиент
 * @param items - Массив данных для создания или обновления (с meta для обновления)
 * @param urlId - UUID для пути запроса (если не передан, берётся из первого элемента с meta или placeholder)
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-massovoe-sozdanie-i-obnovlenie-vebhukov
 */
export async function batchCreateOrUpdateWebhooks(
  client: ApiClient,
  items: WebhookCreateOrUpdateItem[],
  urlId?: string,
): Promise<Webhook[]> {
  const id =
    urlId ??
    (items[0] && "meta" in items[0]
      ? items[0].meta.meta.href.split("/").pop()
      : "00000000-0000-0000-0000-000000000000") // TODO: проверить будет ли работать с ""
  const response = await client.post(`${webhookPath}/${id}`, {
    body: items,
  })
  return response.json() as Promise<Webhook[]>
}

/**
 * Массовое удаление вебхуков.
 *
 * @param client - API клиент
 * @param metaList - Массив метаданных вебхуков для удаления
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-massovoe-udalenie-vebhukov
 */
export async function batchDeleteWebhooks(
  client: ApiClient,
  metaList: Meta<Entity.Webhook>[],
): Promise<BatchDeleteResult[]> {
  const response = await client.post(`${webhookPath}/delete`, {
    body: metaList,
  })
  return response.json() as Promise<BatchDeleteResult[]>
}
