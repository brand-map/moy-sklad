/**
 * Базовые URL-пути к эндпоинтам JSON API МойСклад.
 * Для операций с конкретной сущностью используйте путь + `/${id}` или суффикс (например, `/delete`).
 */
export const endpointPaths = {
  entity: {
    assortment: "entity/assortment",
    bundle: "entity/bundle",
    product: "entity/product",
    service: "entity/service",
    variant: "entity/variant",
    webhook: "entity/webhook",
  },
} as const

export type EndpointPaths = typeof endpointPaths
