import ky from "ky"
import type {
  BatchGetOptions,
  BatchGetResult,
  Entity,
  ListResponse,
} from "../types"
import { handleError } from "./handle-error"

/**
 * Rate limit information from API response headers
 */
interface RateLimitInfo {
  /** Remaining requests in current window */
  remaining: number
  /** Total limit per window */
  limit: number
  /** Unix timestamp when window resets */
  reset: number
  /** Available requests for this request */
  resetTime: Date
}

/**
 * Request weight calculation based on auth type and date
 */
type RequestWeight = 1 | 2 | 3 | 4

interface RateLimitState {
  lastReset: number
  requestsUsed: number
  concurrent: number
}

/**
 * Calculates the weight of a request based on authentication type and current date
 */
function getRequestWeight(auth: Auth): RequestWeight {
  // Check if using user credentials (login/password or user token)
  const isUserAuth = "login" in auth

  if (!isUserAuth) {
    // Solution token auth - standard weight
    return 1
  }

  // User auth - weight depends on date
  const now = new Date()

  // Dec 1, 2026 and later: weight 4
  if (now >= new Date(2026, 11, 1)) {
    return 4
  }

  // Sept 1, 2026 and later: weight 3
  if (now >= new Date(2026, 8, 1)) {
    return 3
  }

  // May 12, 2026 and later: weight 2
  if (now >= new Date(2026, 4, 12)) {
    return 2
  }

  // Before May 12, 2026: weight 1
  return 1
}

/**
 * Calculates rate limit threshold (requests per 3 seconds)
 */
function getRateLimitThreshold(weight: RequestWeight): number {
  // The base limit is 45 units per 3 seconds
  const RATE_LIMIT_UNITS = 45
  return Math.floor(RATE_LIMIT_UNITS / weight)
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
}

/**
 * Опции для авторизации по токену
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-autentifikaciq
 */
export type TokenAuth = {
  /** Токен */
  token: string
}

/**
 * Опции для авторизации
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-autentifikaciq
 */
export type Auth = BasicAuth | TokenAuth

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
  private requestWeight: RequestWeight
  private rateLimitThreshold: number
  ky: typeof ky
  private lastResponse: Response | undefined
  private rateLimitState: RateLimitState = {
    lastReset: 0,
    requestsUsed: 0,
    concurrent: 0,
  }
  private parallelRequestLimit = 5

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.moysklad.ru/api/remap/1.2"
    this.userAgent =
      options.userAgent ??
      'brand-map/moy-sklad (+https://github.com/brand-map/moy-sklad)'

    this.auth = options.auth
    this.requestWeight = getRequestWeight(options.auth)
    this.rateLimitThreshold = getRateLimitThreshold(this.requestWeight)
    this.batchGetOptions = {
      limit: 1000,
      expandLimit: 100,
      concurrencyLimit: 3,
      ...options.batchGetOptions,
    }

    // Ensure concurrency limit respects API constraints (max 5 parallel requests)
    if (this.batchGetOptions.concurrencyLimit > this.parallelRequestLimit) {
      this.batchGetOptions.concurrencyLimit = this.parallelRequestLimit
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

  /**
   * Parses rate limit information from response headers
   */
  private parseRateLimitHeaders(response: Response): RateLimitInfo | null {
    const remaining = response.headers.get("X-RateLimit-Remaining")
    const limit = response.headers.get("X-RateLimit-Limit")
    const reset = response.headers.get("X-RateLimit-Reset")

    if (!remaining || !limit || !reset) {
      return null
    }

    return {
      remaining: parseInt(remaining, 10),
      limit: parseInt(limit, 10),
      reset: parseInt(reset, 10),
      resetTime: new Date(parseInt(reset, 10) * 1000),
    }
  }

  /**
   * Updates internal rate limit state based on response headers
   */
  private updateRateLimitInfo(response: Response): void {
    const rateLimitInfo = this.parseRateLimitHeaders(response)

    if (!rateLimitInfo) {
      return
    }

    // Reset state if we've entered a new rate limit window
    const now = Math.floor(Date.now() / 1000)
    if (now >= rateLimitInfo.reset) {
      this.rateLimitState.lastReset = rateLimitInfo.reset
      this.rateLimitState.requestsUsed = 0
    }

    // Update remaining capacity
    this.rateLimitState.requestsUsed =
      rateLimitInfo.limit - rateLimitInfo.remaining
  }

  /**
   * Calculates milliseconds to wait before next request based on rate limits
   */
  private calculateBackoffDelay(): number {
    const now = Math.floor(Date.now() / 1000)

    // If we're in a new window, no delay needed
    if (now >= this.rateLimitState.lastReset) {
      return 0
    }

    // Calculate how much of the window remains
    const windowRemaining = this.rateLimitState.lastReset - now
    const requestsRemaining =
      this.rateLimitThreshold - this.rateLimitState.requestsUsed

    // If we have requests remaining, no delay needed
    if (requestsRemaining > 1) {
      return 0
    }

    // We're at or near the limit - wait until window resets
    return windowRemaining * 1000 + 100 // Add 100ms buffer
  }

  /**
   * Waits for rate limit window if necessary
   */
  private async waitForRateLimit(): Promise<void> {
    const delay = this.calculateBackoffDelay()

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
      // Reset counter after waiting
      this.rateLimitState.requestsUsed = 0
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
  async request(
    endpoint: string,
    { searchParameters, body, ...options }: RequestOptions = {},
  ): Promise<Response> {
    // Wait for parallel request slot
    await this.waitForParallelSlot()
    this.rateLimitState.concurrent++

    try {
      // Wait for rate limit if necessary
      await this.waitForRateLimit()

      const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint.slice(1)
        : endpoint

      const searchParams = new URLSearchParams(searchParameters)

      const kyOptions: Record<string, unknown> = {
        ...options,
        searchParams: searchParams.size > 0 ? searchParams : undefined,
      }

      if (body) {
        kyOptions.json = body
      }

      await this.ky(normalizedEndpoint, kyOptions)

      const response = this.lastResponse
      if (!response) {
        throw new Error("Failed to capture response from ky")
      }

      // Track successful request
      this.rateLimitState.requestsUsed += this.requestWeight

      if (!response.ok) {
        // Handle rate limit errors with exponential backoff
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After")
          const delay = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : 3100 // Default to slightly more than 3 second window

          await new Promise((resolve) => setTimeout(resolve, delay))
          // Retry the request
          return this.request(endpoint, { searchParameters, body, ...options })
        }

        await handleError(response)
      }

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
  get(
    url: string,
    options: RequestOptionsWithoutMethod = {},
  ): Promise<Response> {
    return this.request(url, { ...options, method: "GET" })
  }

  /**
   * Shorthand для POST запроса.
   *
   * {@linkcode request}
   */
  post(
    url: string,
    options: RequestOptionsWithoutMethod = {},
  ): Promise<Response> {
    return this.request(url, { ...options, method: "POST" })
  }

  /**
   * Shorthand для PUT запроса.
   *
   * {@linkcode request}
   */
  put(
    url: string,
    options: RequestOptionsWithoutMethod = {},
  ): Promise<Response> {
    return this.request(url, { ...options, method: "PUT" })
  }

  /**
   * Shorthand для DELETE запроса.
   *
   * {@linkcode request}
   */
  delete(
    url: string,
    options: RequestOptionsWithoutMethod = {},
  ): Promise<Response> {
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

    const returnUrl = shouldIncludeBaseUrl
      ? `${this.baseUrl}/${url.join("/")}`
      : url.join("/")

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
    const limit = hasExpand
      ? this.batchGetOptions.expandLimit
      : this.batchGetOptions.limit

    const data = await fetcher(limit, 0)
    const { size } = data.meta
    const { context } = data

    if (size <= limit) {
      return { context, rows: data.rows }
    }

    const allRows: T[] = [...data.rows]

    // Calculate number of remaining batches needed
    const remainingBatches = Math.ceil((size - limit) / limit)

    // Process remaining batches with concurrency limit
    for (
      let i = 0;
      i < remainingBatches;
      i += this.batchGetOptions.concurrencyLimit
    ) {
      const batchEnd = Math.min(
        i + this.batchGetOptions.concurrencyLimit,
        remainingBatches,
      )

      const batchPromises: Promise<T[]>[] = []

      for (let j = i; j < batchEnd; j++) {
        const offset = limit + j * limit
        batchPromises.push(
          fetcher(limit, offset).then((response) => response.rows),
        )
      }

      const batchResults = await Promise.all(batchPromises)

      for (const rows of batchResults) {
        allRows.push(...rows)
      }
    }

    return { context, rows: allRows }
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
