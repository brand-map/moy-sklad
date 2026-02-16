import type { EmptyObject } from "../../types"
import type { Entity, Idable, Meta, Model } from "../../types"

export interface Group extends Idable, Meta<"group"> {
  readonly accountId: string
  index?: number
  name: string
}

export interface GroupModel extends Model {
  object: Group
  expandable: EmptyObject
}
