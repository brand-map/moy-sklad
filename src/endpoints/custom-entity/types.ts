import type { DateTime, Entity, Idable, Meta, Model } from "../../types"

export interface CustomEntity extends Idable, Meta<"customentity"> {
  readonly accountId: string
  readonly updated: DateTime
  name: string
  externalCode: string
  owner?: Meta<"employee">
  shared: boolean
  group: Meta<"group">
}

export interface CustomEntityModel extends Model {
  object: CustomEntity
}
