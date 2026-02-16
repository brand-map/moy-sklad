import type {
  ArchivedFilter,
  AssortmentEntity,
  AssortmentModel,
  Attribute,
  Barcodes,
  BooleanFilter,
  DateTimeFilter,
  Entity,
  Idable,
  IdFilter,
  ListMeta,
  Meta,
  Model,
  NumberFilter,
  StringFilter,
  TaxSystem,
  TrackingType,
} from "../../types"
import type { EmployeeModel } from "../employee"
import type { GroupModel } from "../group"

/**
 * Признак предмета расчёта комплекта
 *
 * {@linkcode Bundle}
 */
export type BundlePaymentItemType =
  /** Товар */
  | "GOOD"
  /** Подакцизный товар */
  | "EXCISABLE_GOOD"
  /** Составной предмет расчета */
  | "COMPOUND_PAYMENT_ITEM"
  /** Иной предмет расчета */
  | "ANOTHER_PAYMENT_ITEM"

/**
 * Компонент комплекта
 *
 * {@linkcode Bundle}
 */
export interface BundleComponent extends Idable, Meta<"bundlecomponent"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Метаданные товара/услуги/серии, которую представляет собой компонент */
  assortment: Meta<AssortmentEntity>

  /** Количество товаров/услуг данного вида в компоненте */
  readonly quantity: number
}

/**
 * Модель компонента комплекта
 *
 * {@linkcode BundleComponent}
 */
export interface BundleComponentModel extends Model {
  object: BundleComponent

  expandable: {
    assortment: AssortmentModel
  }
}

/**
 * Комлект
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt
 */
export interface Bundle extends Idable, Meta<"bundle"> {
  /** ID учетной записи */
  readonly accountId: string

  /** Добавлен ли Комплект в архив */
  archived: boolean

  /** Артикул */
  article?: string

  /** Коллекция доп. полей */
  attributes?: Attribute[]

  /**
   * Штрихкоды Комплекта
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt-komplekty-komponenty-komplekta-shtrihkody
   */
  barcodes?: Barcodes

  /** Код Комплекта */
  code?: string

  /** Массив компонентов Комплекта */
  components: ListMeta<"bundlecomponent">

  /** Метаданные Страны */
  country?: Meta<"country"> // TODO add country expand

  /** Описание Комплекта */
  description?: string

  /** Признак запрета скидок */
  discountProhibited: boolean

  /** Реальный НДС % */
  readonly effectiveVat?: number

  /**
   * Дополнительный признак для определения разграничения реального НДС.
   *
   * - (`effectiveVat` = `0`, `effectiveVatEnabled` = `false`) -> "без НДС"
   * - (`effectiveVat` = `0`, `effectiveVatEnabled` = `true`) -> `0%`
   */
  readonly effectiveVatEnabled?: boolean

  /** Внешний код Комплекта */
  externalCode: string

  /** Метаданные массива Файлов */
  files?: unknown[] // TODO add files type & expand

  /** Метаданные отдела сотрудника */
  group: Meta<"group">

  /** Массив метаданных Изображений */
  images?: unknown[] // TODO add images type & expand

  /**
   * Минимальная цена
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt-komplekty-atributy-wlozhennyh-suschnostej-minimal-naq-cena
   */
  minPrice?: {
    value: number
    currency: Meta<"currency">
  }

  /** Наименование Комплекта */
  name: string

  /**
   * Дополнительные расходы
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-komplekt-komplekty-atributy-wlozhennyh-suschnostej-dopolnitel-nye-rashody
   */
  overhead?: {
    value: number
    currency: Meta<"currency">
  }

  /** Метаданные владельца (Сотрудника) */
  owner?: Meta<"employee">

  /** Управление состоянием частичного выбытия маркированного товара */
  partialDisposal?: boolean

  /** Наименование группы, в которую входит Комплект */
  readonly pathName?: string

  /**
   * Признак предмета расчета
   *
   * {@linkcode BundlePaymentItemType}
   */
  paymentItemType?: BundlePaymentItemType

  /** Метаданные группы Комплекта */
  productFolder?: Meta<"productfolder"> // TODO add productFolder expand

  /** Цены продажи */
  salePrices?: {
    value: number
    currency: Meta<"currency">
    priceType: Meta<"pricetype">
  }[]

  /** Общий доступ */
  shared: boolean

  /** ID синхронизации */
  readonly syncId?: string

  /**
   * Код системы налогообложения
   *
   * {@linkcode TaxSystem}
   */
  taxSystem?: TaxSystem

  /** Код ТН ВЭД */
  tnved?: string

  /**
   * Тип маркируемой продукции
   *
   * {@linkcode TrackingType}
   */
  trackingType?: TrackingType

  /** Единицы измерения */
  uom?: Meta<"uom"> // TODO add uom expand

  /** Момент последнего обновления сущности */
  readonly updated: string

  /** Используется ли ставка НДС родительской группы */
  useParentVat: boolean

  /** НДС % */
  vat?: number

  /** Включен ли НДС для товара */
  vatEnabled?: boolean

  /** Объем */
  volume?: number

  /** Вес */
  weight?: number
}

/**
 * Модель комплекта
 *
 * {@linkcode Bundle}
 */
export interface BundleModel extends Model {
  object: Bundle

  expandable: {
    group: GroupModel
    owner: EmployeeModel
    components: BundleComponentModel
  }

  filters: {
    id: IdFilter
    accountId: IdFilter
    archived: ArchivedFilter
    article: StringFilter
    code: StringFilter
    description: StringFilter
    externalCode: StringFilter
    group: IdFilter
    name: StringFilter
    owner: IdFilter
    pathName: StringFilter
    shared: BooleanFilter
    syncId: IdFilter
    updated: DateTimeFilter
    volume: NumberFilter
    weight: NumberFilter
  }
}

export interface ListBundleOptions {
  pagination?: import("../../types").PaginationOptions
  expand?: import("../../types").ExpandOptions<BundleModel>
  order?: import("../../types").OrderOptions<BundleModel>
  search?: string
  filter?: import("../../types").FilterOptions<BundleModel>
}

export interface CreateBundleOptions {
  expand?: import("../../types").ExpandOptions<BundleModel>
}

export interface UpdateBundleOptions {
  expand?: import("../../types").ExpandOptions<BundleModel>
}

export interface GetBundleOptions {
  expand?: import("../../types").ExpandOptions<BundleModel>
}

export type FirstBundleOptions = Omit<ListBundleOptions, "pagination">
export type AllBundleOptions = Omit<ListBundleOptions, "pagination">
