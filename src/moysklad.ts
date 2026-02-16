import { ApiClient } from "./api-client"
import type { ApiClientOptions } from "./api-client"

import { AssortmentEndpoint } from "./endpoints/assortment"

/**
 * High-level Moysklad API wrapper.
 * Creates an `ApiClient` instance and exposes class-based endpoint objects.
 * Use this when you prefer an object-oriented API over standalone endpoint functions.
 *
 * @param options - API client options (auth, baseUrl, etc.)
 *
 * @example
 * ```ts
 * const moysklad = new Moysklad({
 *   auth: { token: "your-token" }
 * })
 *
 * const { rows } = await moysklad.assortment.list({ pagination: { limit: 10 } });
 * ```
 */
export class Moysklad {
  /**
   * API клиент
   *
   * {@linkcode ApiClient}
   */
  public readonly client: ApiClient

  /**
   * Ассортимент
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment
   */
  readonly assortment: AssortmentEndpoint

  public constructor(options: ApiClientOptions) {
    this.client = new ApiClient(options)

    this.assortment = new AssortmentEndpoint(this.client)
  }
}

// /**
//  * Root interface for the class-based Moysklad client.
//  *
//  * Describes the public shape implemented by `Moysklad`.
//  */
// interface MoyskladInterface {
//   /**
//    * API клиент
//    *
//    * {@linkcode ApiClient}
//    */
//   client: ApiClient

//   /**
//    * Ассортимент
//    *
//    * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-assortiment
//    */
//   assortment: AssortmentEndpoint

//   // /**
//   //  * Бонусные операции
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-bonusnaq-operaciq
//   //  */
//   // bonusTransaction: BonusTransactionEndpoint

//   // /**
//   //  * Безопасность (токены)
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-autentifikaciq
//   //  */
//   // security: SecurityEndpoint

//   // /**
//   //  * Контрагенты
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-kontragent
//   //  */
//   // counterparty: CounterpartyEndpoint

//   // /**
//   //  * Юрлица
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-jurlico
//   //  */
//   // organization: OrganizationEndpoint

//   // /**
//   //  * Пользовательские справочники
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-pol-zowatel-skij-sprawochnik
//   //  */
//   // customEntity: CustomEntityEndpoint

//   // /**
//   //  * Заказы покупателей
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-zakaz-pokupatelq
//   //  */
//   // customerOrder: CustomerOrderEndpoint

//   // /**
//   //  * Отгрузки
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-otgruzka
//   //  */
//   // demand: DemandEndpoint

//   // /**
//   //  * Счета-фактуры выданные
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-schet-faktura-wydannyj
//   //  */
//   // factureOut: FactureOutEndpoint

//   // /**
//   //  * Приёмки
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-priemka-priemki
//   //  */
//   // supply: SupplyEndpoint

//   // /**
//   //  * Оприходования
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-oprihodowanie
//   //  */
//   // enter: EnterEndpoint

//   // /**
//   //  * Товары
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-towar
//   //  */
//   // product: ProductEndpoint

//   // /**
//   //  * Группы товаров
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-gruppa-towarow
//   //  */
//   // productFolder: ProductFolderEndpoint

//   // /**
//   //  * Техкарты
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-tehkarta-tehkarty
//   //  */
//   // processingPlan: ProcessingPlanEndpoint

//   // /**
//   //  * Входящие платежи
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-vhodqschij-platezh
//   //  */
//   // paymentIn: PaymentInEndpoint

//   // /**
//   //  * Исходящие платежи
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-ishodqschij-platezh-ishodqschie-platezhi
//   //  */
//   // paymentOut: PaymentOutEndpoint

//   // /**
//   //  * Счета покупателям
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-schet-pokupatelu-scheta-pokupatelqm
//   //  */
//   // invoiceOut: InvoiceOutEndpoint

//   // /**
//   //  * Автозаполнение
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-awtozapolnenie
//   //  */
//   // wizard: WizardEndpoint

//   // /**
//   //  * Отчёты
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/reports/#otchety
//   //  */
//   // report: ReportEndpoint

//   // /**
//   //  * Заказ поставщику
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-zakaz-postawschiku
//   //  */
//   // purchaseOrder: PurchaseOrderEndpoint

//   // /**
//   //  * Регионы
//   //  *
//   //  * Справочник регионов России. Данный справочник предназначен только для чтения.
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-region
//   //  */
//   // region: RegionEndpoint

//   // /**
//   //  * Производственные этапы
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-proizwodstwennoe-zadanie-proizwodstwennye-atapy
//   //  */
//   // productionStage: ProductionStageEndpoint

//   // /**
//   //  * Выполнения этапов производства
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-vypolnenie-atapa-proizwodstwa
//   //  */
//   // productionStageCompletion: ProductionStageCompletionEndpoint

//   // /**
//   //  * Инвентаризации
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-inwentarizaciq
//   //  */
//   // inventory: InventoryEndpoint

//   // /**
//   //  * Производственные задания
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-proizwodstwennoe-zadanie
//   //  */
//   // productionTask: ProductionTaskEndpoint

//   // /**
//   //  * Модификации
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-modifikaciq
//   //  */
//   // variant: VariantEndpoint

//   // /**
//   //  * Возвраты покупателей
//   //  *
//   //  * @see https://dev.moysklad.ru/doc/api/remap/1.2/documents/#dokumenty-vozwrat-pokupatelq
//   //  */
//   // salesReturn: SalesReturnEndpoint
// }
