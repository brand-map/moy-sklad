import type { Entity } from "./entity"
import type { Meta } from "./metadata"

export interface DocumentRate {
  currency: Meta<"currency"> // TODO expand currency
  value?: number
}
