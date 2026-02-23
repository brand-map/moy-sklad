import ky, { type KyInstance, type KyRequest, type Options } from "ky"
import type { BatchGetOptions, BatchGetResult, Entity, ListResponse } from "./types"
import { handleError } from "./utils/handle-error"

/**
 * Опции для Basic авторизации
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-autentifikaciq
 */
export type BasicAuth = {
  /** Логин */
  login: string
  /** Пароль */
  password: string
  token?: never
}

/**
 * Опции для авторизации по токену
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-autentifikaciq
 */
export type TokenAuth = {
  /** Токен */
  token: string
  login?: never
  password?: never
}

/**
 * Опции для авторизации
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-autentifikaciq
 */
type Auth = BasicAuth | TokenAuth

/**
 * Опции для инициализации API клиента
 *
 * @see ApiClientOptions
 */
export type ApiClientOptions = {
  /**
   * Базовый URL
   *
   * @default https://api.moysklad.ru/api/remap/1.2
   */
  baseUrl?: string

  /**
   * User-Agent header
   * @default 'brand-map/moy-sklad (+https://github.com/brand-map/moy-sklad)'
   */
  userAgent?: string
  /**
   * Опции авторизации
   *
   * {@linkcode Auth}
   */
  auth: Auth
  /**
   * Опции для получения всех сущностей из API (метод `.all()`).
   *
   * Устанавливает ограничения на размер запросов с expand и без него, а также ограничение на количество одновременных запросов.
   *
   * @default { limit: 1000, expandLimit: 100, concurrencyLimit: 3 }
   */
  batchGetOptions?: BatchGetOptions
}

type RequestOptions = Omit<Options, "body"> & {
  body?: Options["body"] | Record<string, any>
  searchParameters?: URLSearchParams
}

export function createApiClientFetcher(auth: Auth, options?: { userAgent?: string; baseUrl?: string }) {
  const baseUrl = options?.baseUrl ?? "https://api.moysklad.ru/api/remap/1.2"
  const userAgent = options?.userAgent ?? "brand-map/moy-sklad (+https://github.com/brand-map/moy-sklad)"

  return ky.create({
    prefixUrl: baseUrl,
    headers: {
      Authorization: "token" in auth ? `Bearer ${auth.token}` : `Basic ${btoa(`${auth.login}:${auth.password}`)}`,
      "User-Agent": userAgent,
      "Content-Type": "application/json",
      Accept: "application/json;charset=utf-8",
      "Accept-Encoding": "gzip",
    },
    throwHttpErrors: false,
  })
}

/** API клиент */
export class ApiClient {
  public static baseUrl = "https://api.moysklad.ru/api/remap/1.2"
  private batchGetOptions: Required<BatchGetOptions>
  #ky: KyInstance

  constructor(fether: KyInstance, options?: Pick<ApiClientOptions, "batchGetOptions">) {
    this.batchGetOptions = {
      limit: 1000,
      expandLimit: 100,
      concurrencyLimit: 3,
      ...options?.batchGetOptions,
    }

    this.#ky = fether
  }

  /**
   * Сделать запрос к API МойСклад.
   *
   * @param endpoint - относительный путь до ресурса
   * @param options - опции запроса
   *
   * @example
   * ```ts
   * const response = await apiClient. #request("/entity/counterparty", { method: "POST", body: { name: "ООО Ромашка" } });
   * ```
   */
  async #request(
    endpoint: string,
    { body, searchParameters, ...requestOptions }: RequestOptions = {},
  ): Promise<Response> {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
    const searchParams = searchParameters ? new URLSearchParams(searchParameters) : undefined

    const kyOptions = {
      ...requestOptions,
      searchParams: searchParams?.size ? searchParams : undefined,
      body: body && typeof body === "object" ? JSON.stringify(body) : body,
    }

    const response = await this.#ky(normalizedEndpoint, kyOptions)

    if (!response.ok) {
      await handleError(response)
    }

    return response as Response
  }

  /**
   * Shorthand для GET запроса.
   *
   * {@linkcode request}
   * */
  public get(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.#request(url, { ...options, method: "GET" })
  }

  /**
   * Shorthand для POST запроса.
   *
   * {@linkcode request}
   */
  public post(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.#request(url, { ...options, method: "POST" })
  }

  /**
   * Shorthand для PUT запроса.
   *
   * {@linkcode request}
   */
  public put(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.#request(url, { ...options, method: "PUT" })
  }

  /**
   * Shorthand для DELETE запроса.
   *
   * {@linkcode request}
   */
  public delete(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.#request(url, { ...options, method: "DELETE" })
  }

  /**
   * Нормализует URL, удаляя лишние слеши.
   *
   * @param url - URL
   *
   * @returns Нормализованный URL
   */
  public static normalizeUrl(url: string): string {
    return url.replaceAll(/\/{2,}/g, "/")
  }

  /**
   * Строит объект типа `URL` из строки.
   *
   * @param url - URL
   *
   * @returns Объект типа `URL`
   */
  private buildStringUrl(url: string): URL {
    const shouldIncludeBaseUrl = !url.startsWith("http")

    const returnUrl = shouldIncludeBaseUrl ? `${ApiClient.baseUrl}/${url}` : url

    return new URL(ApiClient.normalizeUrl(returnUrl))
  }

  /**
   * Cтроит объект типа `URL` из массива строк.
   *
   * @param url - массив строк URL
   *
   * @returns Объект типа `URL`
   */
  private buildArrayUrl(url: string[]): URL {
    const shouldIncludeBaseUrl = !url[0]?.startsWith("http")

    const returnUrl = shouldIncludeBaseUrl ? `${ApiClient.baseUrl}/${url.join("/")}` : url.join("/")

    return new URL(ApiClient.normalizeUrl(returnUrl))
  }

  /**
   * Строит URL из строки или массива строк.
   *
   * @param url - строка или массив строк URL
   *
   * @returns Объект типа `URL` с нормализованным URL и базовым адресом, указанным в опциях инциализации
   *
   * @example С массивом строк
   * ```ts
   * buildUrl(["entity", "counterparty", "5427bc76-b95f-11eb-0a80-04bb000cd583"])
   * // "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/5427bc76-b95f-11eb-0a80-04bb000cd583"
   * ```
   *
   * @example Со строкой
   * ```ts
   * buildUrl("entity/counterparty/5427bc76-b95f-11eb-0a80-04bb000cd583")
   * // "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/5427bc76-b95f-11eb-0a80-04bb000cd583"
   * ```
   */
  public buildUrl(url: string | string[]): URL {
    if (typeof url === "string") {
      return this.buildStringUrl(url)
    }

    return this.buildArrayUrl(url)
  }

  /**
   * Получить все сущности из API. Но лучше используйте метод `.all()` в эндпоинтах (например, `moysklad.counterparty.all()`).
   *
   * @param fetcher - функция, которая делает запрос к API и возвращает список сущностей
   * @param hasExpand - флаг, указывающий на наличие expand в запросе
   *
   * @returns Объект с массивом сущностей и контекстом
   */
  public async getAll<T, E extends Entity>(
    fetcher: (limit: number, offset: number) => Promise<ListResponse<T, E>>,
    hasExpand?: boolean,
  ): Promise<BatchGetResult<T, E>> {
    let context: BatchGetResult<T, E>["context"] | undefined
    const allRows: T[] = []

    for await (const chunk of this.getAllByChunks(fetcher, hasExpand)) {
      context = chunk.context
      allRows.push(...chunk.rows)
    }

    if (context == null) {
      throw new Error("getAllByChunks returned no chunks")
    }

    return { context, rows: allRows }
  }

  /**
   * Получать сущности из API чанками через async generator.
   * Полезно, когда нужно обрабатывать длинный список постепенно, без накопления всех строк в памяти.
   *
   * @param fetcher - функция, которая делает запрос к API и возвращает список сущностей
   * @param hasExpand - флаг, указывающий на наличие expand в запросе
   *
   * @yields Объект чанка с `rows` и `context`
   */
  public async *getAllByChunks<T, E extends Entity>(
    fetcher: (limit: number, offset: number) => Promise<ListResponse<T, E>>,
    hasExpand?: boolean,
  ): AsyncGenerator<BatchGetResult<T, E>, void, void> {
    const limit = hasExpand ? this.batchGetOptions.expandLimit : this.batchGetOptions.limit

    const data = await fetcher(limit, 0)
    const { size } = data.meta
    const { context } = data

    yield { context, rows: data.rows }

    if (size <= limit) {
      return
    }

    // Calculate number of remaining batches needed
    const remainingBatches = Math.ceil((size - limit) / limit)

    // Process remaining batches with concurrency limit
    for (let i = 0; i < remainingBatches; i += this.batchGetOptions.concurrencyLimit) {
      const batchMax = Math.min(i + this.batchGetOptions.concurrencyLimit, remainingBatches)

      const lazyBatchPromises = []

      for (let j = i; j < batchMax; j++) {
        const offset = limit + j * limit
        lazyBatchPromises.push(() => fetcher(limit, offset).then((response) => response.rows))
      }

      const results = await Promise.all(lazyBatchPromises.map((promise) => promise()))

      yield { context, rows: results.flat() }
    }
  }

  // /**
  //  * Perform a request and directly return parsed JSON.
  //  *
  //  * This helper reduces boilerplate for callers that need the response body as a typed object.
  //  */
  // private async requestJson<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  //   const response = await this. #request(endpoint, options)
  //   return (await response.json()) as T
  // }
}
