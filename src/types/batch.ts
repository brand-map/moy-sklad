import type { ListResponse } from "./common"
import type { Entity } from "./entity"

export type BatchGetResult<T, E extends Entity> = Pick<ListResponse<T, E>, "rows" | "context">

/**
 * Опции для получения всех сущностей из API (метод `.all()`).
 */
export interface BatchGetOptions {
  /** URL параметр `limit` для каждого запроса */
  limit?: number
  /** URL параметр `limit` для каждого запроса с `expand` */
  expandLimit?: number
  /** Ограничение количества одновременных запросов */
  concurrencyLimit?: number
}

export interface BatchDeleteResult {
  info: string
}
