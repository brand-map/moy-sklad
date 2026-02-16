import type { Entity } from "./entity"
import type { Meta, Metadata } from "./metadata"
import type { Idable } from "./mixins"

export type AttributeType =
  | "time"
  | "link"
  | "string"
  | "text"
  | "file"
  | "boolean"
  | "double"
  | "long"
  | "contract"
  | "counterparty"
  | "project"
  | "store"
  | "employee"
  | "product"
  | "customentity"

interface BaseAttribute extends Idable, Meta<"attributemetadata"> {
  name: string
  type: AttributeType
  value:
    | boolean
    | string
    | number
    | (Meta<Entity> & {
        name: string
      })
}

export interface TimeAttribute extends BaseAttribute {
  type: AttributeType.Time
  value: string
}

export interface LinkAttribute extends BaseAttribute {
  type: AttributeType.Link
  value: string
}

export interface StringAttribute extends BaseAttribute {
  type: AttributeType.String
  value: string
}

export interface TextAttribute extends BaseAttribute {
  type: AttributeType.Text
  value: string
}

export interface FileAttribute extends BaseAttribute {
  type: AttributeType.File
  value: string
}

export interface BooleanAttribute extends BaseAttribute {
  type: AttributeType.Boolean
  value: boolean
}

export interface DoubleAttribute extends BaseAttribute {
  type: AttributeType.Double
  value: number
}

export interface LongAttribute extends BaseAttribute {
  type: AttributeType.Long
  value: number
}

export interface ContractAttribute extends BaseAttribute {
  type: AttributeType.Contract
  value: Meta<"contract"> & { name: string }
}

export interface CounterpartyAttribute extends BaseAttribute {
  type: AttributeType.Counterparty
  value: Meta<"counterparty"> & { name: string }
}

export interface ProjectAttribute extends BaseAttribute {
  type: AttributeType.Project
  value: Meta<"project"> & { name: string }
}

export interface StoreAttribute extends BaseAttribute {
  type: AttributeType.Store
  value: Meta<"store"> & { name: string }
}

export interface EmployeeAttribute extends BaseAttribute {
  type: AttributeType.Employee
  value: Meta<"employee"> & { name: string }
}

export interface ProductAttribute extends BaseAttribute {
  type: AttributeType.Product
  value: Meta<"product"> & { name: string }
}

export interface CustomEntityAttribute extends BaseAttribute {
  description?: string
  type: AttributeType.CustomEntity
  customEntityMeta: Metadata<"customentitymetadata">
  value: Meta<"customentitymetadata"> & { name: string }
}

export type Attribute =
  | TimeAttribute
  | LinkAttribute
  | StringAttribute
  | TextAttribute
  | FileAttribute
  | BooleanAttribute
  | DoubleAttribute
  | LongAttribute
  | ContractAttribute
  | CounterpartyAttribute
  | ProjectAttribute
  | StoreAttribute
  | EmployeeAttribute
  | ProductAttribute
  | CustomEntityAttribute
