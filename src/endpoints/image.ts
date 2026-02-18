import { ApiClient } from "../api-client"
import { composeSearchParameters } from "../api-client/compose-search-parameters"
import type { BatchGetResult, ListResponse, Subset } from "../types"
import type { DateTime, Meta, Model } from "../types"
import type { Idable, PaginationOptions } from "../types/common"

/**
 * Endpoint для работы с изображениями Товаров, Комплектов и Модификаций
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie
 */
export class ImageEndpoint {
  constructor(private client: ApiClient) {}

  /**
   * Построить путь к изображениям сущности
   */
  private buildImagePath(entityType: string, entityId: string): string {
    return `entity/${entityType}/${entityId}/images`
  }

  /**
   * Получить список изображений сущности.
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param options - Опции: fields, pagination
   * @returns Promise со списком изображений
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/#/dictionaries/images#3-poluchit-spisok-izobrazhenij-tovara-komplekta-i-modifikacii
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.image.list("product", productId);
   * ```
   */
  async list<T extends ListImagesOptions>(
    entityType: string,
    entityId: string,
    options?: Subset<T, ListImagesOptions>,
  ): Promise<ListResponse<Image, "image">> {
    const searchParams: Record<string, unknown> = {
      pagination: options?.pagination,
    }

    if (options?.fields && options.fields.length > 0) {
      searchParams.fields = options.fields.join(",")
    }

    const searchParameters = composeSearchParameters(searchParams)

    const path = this.buildImagePath(entityType, entityId)
    return this.client.get(path, { searchParameters }).then((res) => res.json()) as any
  }

  /**
   * Получить все изображения сущности.
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param options - Опции: fields
   * @returns Promise с массивом всех изображений
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-poluchit-spisok-izobrazhenij-tovara-komplekta-i-modifikacii
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.image.all("product", productId);
   * ```
   */
  async all<T extends AllImagesOptions>(
    entityType: string,
    entityId: string,
    options?: Subset<T, AllImagesOptions>,
  ): Promise<BatchGetResult<Image, "image">> {
    const path = this.buildImagePath(entityType, entityId)

    return this.client.batchGet(async (limit, offset) => {
      const searchParams: Record<string, unknown> = {
        pagination: { limit, offset },
      }

      if (options?.fields && options.fields.length > 0) {
        searchParams.fields = options.fields.join(",")
      }

      const searchParameters = composeSearchParameters(searchParams)
      return this.client.get(path, { searchParameters }).then((res) => res.json()) as any
    }, false)
  }

  /**
   * Получить все изображения как асинхронный генератор (чанк за чанком).
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param options - Опции: fields
   * @yields Batch chunk с context и rows
   *
   * @example
   * ```ts
   * for await (const chunk of moysklad.image.allChunks("product", productId)) {
   *   console.log(chunk.rows.length)
   * }
   * ```
   */
  async *allChunks<T extends AllImagesOptions>(
    entityType: string,
    entityId: string,
    options?: Subset<T, AllImagesOptions>,
  ): AsyncGenerator<BatchGetResult<Image, "image">, void, void> {
    const path = this.buildImagePath(entityType, entityId)

    yield* this.client.getChunks(async (limit, offset) => {
      const searchParams: Record<string, unknown> = {
        pagination: { limit, offset },
      }

      if (options?.fields && options.fields.length > 0) {
        searchParams.fields = options.fields.join(",")
      }

      const searchParameters = composeSearchParameters(searchParams)
      return this.client.get(path, { searchParameters }).then((res) => res.json()) as any
    }, false)
  }

  /**
   * Получить первое изображение из списка.
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param options - Опции: fields
   * @returns Promise со списком, содержащим первое изображение
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-poluchit-spisok-izobrazhenij-tovara-komplekta-i-modifikacii
   *
   * @example
   * ```ts
   * const { rows } = await moysklad.image.first("product", productId);
   * const firstImage = rows[0];
   * ```
   */
  async first<T extends FirstImageOptions>(
    entityType: string,
    entityId: string,
    options?: Subset<T, FirstImageOptions>,
  ): Promise<ListResponse<Image, "image">> {
    const searchParams: Record<string, unknown> = {
      pagination: { limit: 1 },
    }

    if (options?.fields && options.fields.length > 0) {
      searchParams.fields = options.fields.join(",")
    }

    const searchParameters = composeSearchParameters(searchParams)

    const path = this.buildImagePath(entityType, entityId)
    return this.client.get(path, { searchParameters }).then((res) => res.json()) as any
  }

  /**
   * Добавить изображение к сущности.
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param data - Данные изображения: filename, content (base64), title (опционально)
   * @returns Promise с обновленным списком изображений
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-dobavit-izobrazhenie-k-tovaru-komplektu-ili-modifikacii
   *
   * @example
   * ```ts
   * const images = await moysklad.image.create("product", productId, {
   *   filename: "product.png",
   *   content: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1Pe..."
   * });
   * ```
   */
  async create(entityType: string, entityId: string, data: CreateImageData): Promise<Image[]> {
    const path = this.buildImagePath(entityType, entityId)
    return this.client.post(path, { body: data }).then((res) => res.json()) as any
  }

  /**
   * Изменить список изображений у сущности.
   *
   * В массиве можно передать как ссылки на существующие изображения (meta),
   * так и новые изображения (filename + content).
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param items - Массив: meta для существующих или CreateImageData для новых
   * @returns Promise с обновленным списком изображений
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-izmenenie-spiska-izobrazhenij-u-tovara-komplekta-ili-modifikacii
   *
   * @example
   * ```ts
   * const images = await moysklad.image.update("product", productId, [
   *   { meta: existingImageMeta },
   *   { filename: "new.png", content: "base64..." }
   * ]);
   * ```
   */
  async update(entityType: string, entityId: string, items: ImageUpdateItem[]): Promise<Image[]> {
    const path = this.buildImagePath(entityType, entityId)
    return this.client.post(path, { body: items }).then((res) => res.json()) as any
  }

  /**
   * Удалить изображение у сущности.
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param imageId - ID изображения
   * @returns Void
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-udalit-izobrazhenie
   *
   * @example
   * ```ts
   * await moysklad.image.delete("product", productId, imageId);
   * ```
   */
  async delete(entityType: string, entityId: string, imageId: string): Promise<void> {
    const path = this.buildImagePath(entityType, entityId)
    await this.client.delete(`${path}/${imageId}`)
  }

  /**
   * Удалить группу изображений у сущности.
   *
   * @param entityType - Тип сущности: product, bundle, variant
   * @param entityId - ID сущности
   * @param metaList - Массив метаданных изображений для удаления
   * @returns Результат удаления
   *
   * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie-udalit-gruppu-izobrazhenij
   *
   * @example
   * ```ts
   * await moysklad.image.batchDelete("product", productId, [imageMeta1, imageMeta2]);
   * ```
   */
  async batchDelete(entityType: string, entityId: string, metaList: ImageMeta[]): Promise<{ info: string }[]> {
    const path = this.buildImagePath(entityType, entityId)
    return this.client.post(`${path}/delete`, { body: metaList }).then((res) => res.json()) as any
  }
}

/**
 * Метаданные изображения (когда images возвращает только meta)
 */
export interface ImageCollectionMeta {
  href: string
  type: "image"
  mediaType: string
  downloadHref?: string
  downloadPermanentHref?: string
}

/**
 * Метаданные коллекции изображений (когда images возвращает только meta без rows)
 */
export interface ImageCollectionMetaOnly {
  meta: {
    href: string
    type: "image"
    mediaType: string
    size?: number
    limit?: number
    offset?: number
  }
}

/**
 * Изображение с полным набором данных (когда используется fields=downloadPermanentHref)
 *
 * @see https://dev.moysklad.ru/doc/api/remap/1.2/dictionaries/#suschnosti-izobrazhenie
 */
export interface Image extends Idable {
  meta: ImageMeta
  /** Имя файла */
  filename: string

  /** Название изображения */
  title: string

  /** Размер файла в байтах */
  size: number

  /** Время загрузки файла на сервер */
  updated: DateTime

  /** Метаданные миниатюры изображения */
  miniature: ImageMeta

  /** Метаданные уменьшенного изображения */
  tiny: ImageMeta
}

export interface ImageMeta {
  href: string
  type: "image"
  mediaType: string
  downloadHref?: string
  downloadPermanentHref?: string
}

/**
 * Данные для создания изображения
 */
export interface CreateImageData {
  /** Имя файла с расширением */
  filename: string
  /** Изображение, закодированное в Base64 */
  content: string
  /** Название изображения (опционально) */
  title?: string
}

/**
 * Элемент для обновления списка изображений: либо ссылка на существующее, либо новые данные
 */
export type ImageUpdateItem = { meta: Meta<"image"> } | CreateImageData

/**
 * Модель изображения
 *
 * {@linkcode Image}
 */
export interface ImageModel extends Model {
  object: Image
  expandable: Record<string, never>
  filters: Record<string, never>
}

/**
 * Тип сущности, к которой можно прикрепить изображения
 */
export type ImageableEntity = "product" | "bundle" | "variant"

/**
 * Опции для получения списка изображений
 */
export interface ListImagesOptions {
  /** Получить постоянную ссылку на скачивание */
  fields?: "downloadPermanentHref"[]
  pagination?: {
    limit?: number
    offset?: number
  }
}

export type FirstImageOptions = Omit<ListImagesOptions, "pagination">
export type AllImagesOptions = Omit<ListImagesOptions, "pagination">
