import type { Meta } from "./metadata"
import type { DateTime, Idable } from "./common"
import type { Model } from "./model"

/** Счёт юрлциа / контрагента */
export interface Account extends Idable, Meta<"account"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Номер счета */
  accountNumber: string

  /** Адрес банка */
  bankLocation?: string

  /** Наименование банка */
  bankName?: string

  /** БИК */
  bic?: string

  /** Корреспондентский счет */
  correspondentAccount?: string

  /** Является ли счет основным */
  isDefault: boolean

  /** Момент последнего обновления */
  readonly updated: DateTime
}

export interface AccountModel extends Model {
  object: Account
  requiredCreateFields: "accountNumber"
}
