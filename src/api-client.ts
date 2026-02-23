import ky, { type KyInstance } from "ky"
import type { BatchGetOptions, BatchGetResult, Entity, ListResponse } from "./types"
import { handleError } from "./utils/handle-error"

interface RateLimitState {
  lastReset: number
  requestsUsed: number
  concurrent: number
}

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

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: object
  searchParameters?: URLSearchParams
}
type RequestOptionsWithoutMethod = Omit<RequestOptions, "method">

/** API клиент */
export class ApiClient {
  private baseUrl: string
  private userAgent: string
  private auth: Auth
  private batchGetOptions: Required<BatchGetOptions>
  ky: KyInstance
  private lastResponse: Response | undefined
  private rateLimitState: RateLimitState = {
    lastReset: 0,
    requestsUsed: 0,
    concurrent: 0,
  }
  private parallelRequestLimit = 3

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.moysklad.ru/api/remap/1.2"
    this.userAgent = options.userAgent ?? "brand-map/moy-sklad (+https://github.com/brand-map/moy-sklad)"

    this.auth = options.auth

    this.batchGetOptions = {
      limit: 1000,
      expandLimit: 100,
      concurrencyLimit: 3,
      ...options.batchGetOptions,
    }

    // Initialize ky instance with default headers and configuration
    this.ky = ky.create({
      prefixUrl: this.baseUrl,
      headers: {
        Authorization:
          "token" in this.auth
            ? `Bearer ${this.auth.token}`
            : `Basic ${btoa(`${this.auth.login}:${this.auth.password}`)}`,
        "User-Agent": this.userAgent,
        "Content-Type": "application/json",
        Accept: "application/json;charset=utf-8",
        "Accept-Encoding": "gzip",
      },
      throwHttpErrors: false,
      hooks: {
        afterResponse: [
          (_request, _options, response) => {
            // Store the response for access in the request method
            this.lastResponse = response as unknown as Response
            // Update rate limit info from response headers
            this.updateRateLimitInfo(response as unknown as Response)
            return response
          },
        ],
      },
    })
  }

  private getRateLimitInfo(headers: Headers | Record<string, string>) {
    const headersObj = headers instanceof Headers ? Object.fromEntries(headers) : headers

    return {
      limit: parseInt(headersObj["x-ratelimit-limit"] || "0"),
      remaining: parseInt(headersObj["x-ratelimit-remaining"] || "0"),
      reset: parseInt(headersObj["x-lognex-reset"] || "0"),
      retryAfter: parseInt(headersObj["x-lognex-retry-after"] || "0"),
      retryTimeInterval: parseInt(headersObj["x-lognex-retry-timeinterval"] || "1000"),
    }
  }

  private async checkAndHandleRateLimit(
    rateLimit: ReturnType<typeof this.getRateLimitInfo>,
    thresholdPercentage: number = 30,
  ): Promise<void> {
    const thresholdValue = Math.ceil((rateLimit.limit * thresholdPercentage) / 100)

    if (rateLimit.remaining <= thresholdValue) {
      console.log("rate limit works", rateLimit.remaining)

      const waitTime = rateLimit.retryTimeInterval || 3000
      console.warn(
        `[{filename}]: approaching rate limit (${rateLimit.remaining}/${rateLimit.limit}), waiting ${waitTime}ms`,
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Updates internal rate limit state based on response headers
   */
  private updateRateLimitInfo(response: Response): void {
    console.log(new Date().toISOString(), response.status)

    const rateLimitInfo = this.getRateLimitInfo(response.headers)
    if (rateLimitInfo) {
      this.checkAndHandleRateLimit(rateLimitInfo)
      console.log(rateLimitInfo)
    }
  }

  /**
   * Waits for parallel request slot if at limit
   */
  private async waitForParallelSlot(): Promise<void> {
    while (this.rateLimitState.concurrent >= this.parallelRequestLimit) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  /**
   * Сделать запрос к API МойСклад.
   *
   * @param endpoint - относительный путь до ресурса
   * @param options - опции запроса
   *
   * @example
   * ```ts
   * const response = await apiClient.request("/entity/counterparty", { method: "POST", body: { name: "ООО Ромашка" } });
   * ```
   */
  async request(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    await this.waitForParallelSlot()
    this.rateLimitState.concurrent++

    try {
      // 1. Consume tokens (this may wait)
      // await this.bucket.consume(this.requestWeight);

      // 2. Perform the actual HTTP call
      const normalizedEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
      const searchParams = new URLSearchParams(options.searchParameters)
      const kyOptions: Record<string, unknown> = {
        ...options,
        searchParams: searchParams.size > 0 ? searchParams : undefined,
      }
      if (options.body) kyOptions.json = options.body

      await this.ky(normalizedEndpoint, kyOptions)
      const response = this.lastResponse
      if (!response) throw new Error("No response captured")

      // 3. Sync bucket with response headers
      // const rateLimitInfo = this.parseRateLimitHeaders(response);
      // if (rateLimitInfo) {
      // this.bucket.sync(rateLimitInfo.remaining, rateLimitInfo.reset);
      // }

      // 4. Handle 429 (should be rare now)
      if (response.status === 429) {
        // const retryAfter = response.headers.get('Retry-After');
        const delay = 3100
        await new Promise((r) => setTimeout(r, delay))
        // Retry – bucket will handle capacity again
        return this.request(endpoint, options)
      }

      if (!response.ok) await handleError(response)
      return response
    } finally {
      this.rateLimitState.concurrent--
    }
  }

  /**
   * Shorthand для GET запроса.
   *
   * {@linkcode request}
   * */
  get(url: string, options: RequestOptionsWithoutMethod = {}): Promise<Response> {
    return this.request(url, { ...options, method: "GET" })
  }

  /**
   * Shorthand для POST запроса.
   *
   * {@linkcode request}
   */
  post(url: string, options: RequestOptionsWithoutMethod = {}): Promise<Response> {
    return this.request(url, { ...options, method: "POST" })
  }

  /**
   * Shorthand для PUT запроса.
   *
   * {@linkcode request}
   */
  put(url: string, options: RequestOptionsWithoutMethod = {}): Promise<Response> {
    return this.request(url, { ...options, method: "PUT" })
  }

  /**
   * Shorthand для DELETE запроса.
   *
   * {@linkcode request}
   */
  delete(url: string, options: RequestOptionsWithoutMethod = {}): Promise<Response> {
    return this.request(url, { ...options, method: "DELETE" })
  }

  /**
   * Нормализует URL, удаляя лишние слеши.
   *
   * @param url - URL
   *
   * @returns Нормализованный URL
   */
  private normalizeUrl(url: string): string {
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

    const returnUrl = shouldIncludeBaseUrl ? `${this.baseUrl}/${url}` : url

    return new URL(this.normalizeUrl(returnUrl))
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

    const returnUrl = shouldIncludeBaseUrl ? `${this.baseUrl}/${url.join("/")}` : url.join("/")

    return new URL(this.normalizeUrl(returnUrl))
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
  buildUrl(url: string | string[]): URL {
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
  async batchGet<T, E extends Entity>(
    fetcher: (limit: number, offset: number) => Promise<ListResponse<T, E>>,
    hasExpand?: boolean,
  ): Promise<BatchGetResult<T, E>> {
    let context: BatchGetResult<T, E>["context"] | undefined
    const allRows: T[] = []

    for await (const chunk of this.getChunks(fetcher, hasExpand)) {
      context = chunk.context
      allRows.push(...chunk.rows)
    }

    if (context == null) {
      throw new Error("getChunks returned no chunks")
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
  async *getChunks<T, E extends Entity>(
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

  /**
   * Perform a request and directly return parsed JSON.
   *
   * This helper reduces boilerplate for callers that need the response body as a typed object.
   */
  async requestJson<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.request(endpoint, options)
    return (await response.json()) as T
  }
}
