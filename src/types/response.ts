import type { ListMeta } from "."
import type { Context } from "./common"
import type { Entity } from "./entity"

export interface ListResponse<T, E extends Entity> extends ListMeta<E> {
  context: Context
  rows: T[]
}
