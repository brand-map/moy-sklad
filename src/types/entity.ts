import type { BundleModel, ConsignmentModel, ProductModel, ServiceModel, VariantModel } from "../endpoints"

export type Entity =
  | "assortment"
  | "auditevent"
  | "account"
  | "demand"
  | "demandposition"
  | "contract"
  | "project"
  | "saleschannel"
  | "country"
  | "region"
  | "factureout"
  | "paymentout"
  | "paymentin"
  | "invoiceout"
  | "counterparty"
  | "customerorder"
  | "customerorderstate"
  | "customerorderposition"
  | "purchasereturn"
  | "commissionreportin"
  | "retailshift"
  | "product"
  | "service"
  | "bundle"
  | "bundlecomponent"
  | "variant"
  | "consignment"
  | "processingplan"
  | "processingplanresult"
  | "processingplanmaterial"
  | "processingplanfolder"
  | "processingorder"
  | "processingorderposition"
  | "namedfilter"
  | "files"
  | "productfolder"
  | "attributemetadata"
  | "customentitymetadata"
  | "customentity"
  | "store"
  | "organization"
  | "purchaseorder"
  | "purchaseorderposition"
  | "supply"
  | "processing"
  | "processingpositionresult"
  | "processingpositionmaterial"
  | "productiontaskmaterial"
  | "processingprocess"
  | "processingstage"
  | "processingprocessposition"
  | "processingplanstages"
  | "productiontask"
  | "productionrow"
  | "productiontaskresult"
  | "productionstagecompletion"
  | "productionstage"
  | "productionstagecompletionmaterial"
  | "productionstagecompletionresult"
  | "state"
  | "pricetype"
  | "uom"
  | "currency"
  | "bonustransaction"
  | "bonusprogram"
  | "employee"
  | "group"
  | "image"
  | "stock"
  | "enter"
  | "salesreturn"
  | "retailsalesreturn"
  | "salesbyvariant"
  | "slot"
  | "expenseitem"
  | "invoiceposition"
  | "enterposition"
  | "supplyposition"
  | "inventory"
  | "inventoryposition"
  | "loss"
  | "moneyplotseries"
  | "moneyreport"
  | "turnover"
  | "turnoverbystore"
  | "turnoverbyoperation"
  | "stockbystore"
  | "webhook"

export type AssortmentEntity = "product" | "service" | "bundle" | "variant" | "consignment"

type AssortmentFields = {
  /** Остаток */
  readonly stock: number
  /** Резерв */
  readonly reserve: number
  /** Ожидание */
  readonly inTransit: number
  /** Доступно */
  readonly quantity: number
}

export type ProductAssortmentModel = ProductModel & {
  object: AssortmentFields
}
export type VariantAssortmentModel = VariantModel & {
  object: AssortmentFields
}
export type BundleAssortmentModel = BundleModel & { object: AssortmentFields }
export type ConsignmentAssortmentModel = ConsignmentModel & {
  object: AssortmentFields
}
export type ServiceAssortmentModel = ServiceModel & {
  object: AssortmentFields
}

/**
 * Ассортимент
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment
 */
export type AssortmentModel =
  | ProductAssortmentModel
  | VariantAssortmentModel
  | BundleAssortmentModel
  | ConsignmentAssortmentModel
  | ServiceAssortmentModel
