import type { Entity, Idable, Meta } from "."

export interface PriceType extends Idable, Meta<"pricetype"> {
  name: string
  externalCode: string
}
