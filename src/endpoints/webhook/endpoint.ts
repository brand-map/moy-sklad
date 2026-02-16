import { ApiClient } from "../../api-client"
import { composeSearchParameters } from "../../api-client/compose-search-parameters"
import { endpointPaths } from "../../endpoint-paths"
import type { BatchDeleteResult, BatchGetResult, Entity, GetFindResult, ListResponse, Meta, Subset } from "../../types"
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

/**
 * Webhook endpoint class for managing webhooks.
 */
export class WebhookEndpoint {
    constructor(
        private readonly client: ApiClient,
        private readonly endpointPath: string = endpointPaths.entity.webhook,
    ) { }

    /**
     * Fetches webhooks from API and parses JSON response.
     */
    private async fetchWebhooksResponse(
        searchParameters?: URLSearchParams,
    ): Promise<ListResponse<Webhook, Entity.Webhook>> {
        const response = await this.client.get(this.endpointPath, {
            searchParameters: searchParameters ?? undefined,
        })
        return response.json() as Promise<ListResponse<Webhook, Entity.Webhook>>
    }

    /**
     * Получить список вебхуков.
     *
     * @param options - Опции: пагинация, сортировка, фильтры
     * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-poluchit-spisok-vebhukov
     */
    async list<T extends ListWebhooksOptions>(
        options?: Subset<T, ListWebhooksOptions>,
    ): Promise<ListResponse<GetFindResult<WebhookModel, undefined>, Entity.Webhook>> {
        const searchParameters = composeSearchParameters({
            pagination: options?.pagination,
            order: options?.order,
            filter: options?.filter,
        })
        return this.fetchWebhooksResponse(searchParameters)
    }

    /**
     * Получить все вебхуки с учётом пагинации.
     */
    async all<T extends AllWebhooksOptions>(
        options?: Subset<T, AllWebhooksOptions>,
    ): Promise<BatchGetResult<Webhook, Entity.Webhook>> {
        return this.client.batchGet(
            async (limit, offset) => {
                const searchParameters = composeSearchParameters({
                    pagination: { limit, offset },
                    order: options?.order,
                    filter: options?.filter,
                })
                return this.fetchWebhooksResponse(searchParameters)
            },
            false,
        )
    }

    /**
     * Получить первый вебхук из списка.
     */
    async first<T extends FirstWebhookOptions>(
        options?: Subset<T, FirstWebhookOptions>,
    ): Promise<ListResponse<Webhook, Entity.Webhook>> {
        const searchParameters = composeSearchParameters({
            pagination: { limit: 1 },
            order: options?.order,
            filter: options?.filter,
        })
        return this.fetchWebhooksResponse(searchParameters)
    }

    /**
     * Получить вебхук по ID.
     *
     * @param id - UUID вебхука
     * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-poluchit-otdelnyj-vebhuk
     */
    async byId(id: string): Promise<Webhook> {
        const response = await this.client.get(`${this.endpointPath}/${id}`)
        return response.json() as Promise<Webhook>
    }

    /**
     * Создать вебхук.
     * Сочетание entityType, action, url должно быть уникальным.
     *
     * @param data - Данные вебхука: url, action, entityType [, diffType для UPDATE]
     * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-sozdat-vebhuk
     */
    async create(data: CreateWebhookData): Promise<Webhook> {
        const response = await this.client.post(this.endpointPath, { body: data })
        return response.json() as Promise<Webhook>
    }

    /**
     * Изменить вебхук.
     *
     * @param id - UUID вебхука
     * @param data - Поля для обновления: url, action, enabled, diffType
     * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-izmenit-vebhuk
     */
    async update(id: string, data: UpdateWebhookData): Promise<Webhook> {
        const response = await this.client.put(`${this.endpointPath}/${id}`, { body: data })
        return response.json() as Promise<Webhook>
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
        const id =
            urlId ??
            (items[0] && "meta" in items[0] ? items[0].meta.href.split("/").pop() : "") // TODO: проверить будет ли работать с ""
        const response = await this.client.post(`${this.endpointPath}/${id}`, {
            body: items,
        })
        return response.json() as Promise<Webhook[]>
    }

    /**
     * Массовое удаление вебхуков.
     *
     * @param metaList - Массив метаданных вебхуков для удаления
     * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/webhook#3-massovoe-udalenie-vebhukov
     */
    async batchDelete(metaList: Meta<Entity.Webhook>[]): Promise<BatchDeleteResult[]> {
        const response = await this.client.post(`${this.endpointPath}/delete`, {
            body: metaList,
        })
        return response.json() as Promise<BatchDeleteResult[]>
    }
}