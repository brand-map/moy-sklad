/**
 * Local type utilities (replacements for type-fest).
 * Do not add type-fest to this project.
 */

export type Primitive = string | number | boolean | null

/** Empty object type (no keys). */
export type EmptyObject = Record<string, never>

/** True if T has no keys. */
export type IsEmptyObject<T> = keyof T extends never ? true : false

/** True if T is never. */
export type IsNever<T> = [T] extends [never] ? true : false

/** Keys of T where T[K] extends V. */
export type ConditionalKeys<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T] extends infer R
  ? R extends keyof T
    ? R
    : never
  : never

/** True if A and B are equal types. */
export type IsEqual<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2 ? true : false

/** Helper for comparing two types. */
type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

/** Keys of T that are readonly. */
export type ReadonlyKeysOf<T> = {
  [K in keyof T]: IfEquals<{ [P in K]: T[K] }, { -readonly [P in K]: T[K] }, never, K>
}[keyof T]

/** Keys of T that are optional. */
export type OptionalKeysOf<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never
}[keyof T]

/** True if T has at least one optional key. */
export type HasOptionalKeys<T> = OptionalKeysOf<T> extends never ? false : true

/** Make keys K of T optional. */
export type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** Make keys K of T required. */
export type SetRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/** Flatten type (single level). */
export type Simplify<T> = { [K in keyof T]: T[K] }

/** Recursively flatten type. */
export type SimplifyDeep<T> = T extends object ? { [K in keyof T]: SimplifyDeep<T[K]> } : T

/**
 * Exactly one of the keys in T must be present.
 * Result is a union: { a: A } | { b: B } | ... (each variant has one key required, others absent).
 */
export type RequireExactlyOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & { [P in Exclude<keyof T, K>]?: never }
}[keyof T]

export type MatchArrayType<TInput, TOutput> = TInput extends any[] ? TOutput[] : TOutput

/**
 * From `T` pick properties that exist in `U`. Simple version of Intersection.
 */
export type Subset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never
}
