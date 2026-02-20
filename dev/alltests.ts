/**
 * Comprehensive endpoint tests for Moysklad API
 * Tests all methods for all available endpoints with result overview
 */

import type { Image, ImageCollectionMetaOnly, ImageMeta } from "../src/endpoints/image"
import type { Product } from "../src/endpoints/product"
import { Moysklad } from "../src/moysklad"

// Configuration
const AUTH_TOKEN = "TOKEN"
const PAUSE_MS = 100 // Pause between endpoint tests to respect rate limits

// Test result tracking
interface TestResult {
  endpoint: string
  method: string
  status: "success" | "error" | "skipped"
  result?: unknown
  error?: string
  duration: number
}

interface EndpointSummary {
  endpoint: string
  total: number
  success: number
  errors: number
  skipped: number
}

// Utility functions
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function truncateResult(value: unknown, maxLength = 550): string {
  const str = JSON.stringify(value)
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + `... (${str.length} bytes total)`
}

// Test runner
class EndpointTestRunner {
  private moysklad: Moysklad
  private results: TestResult[] = []

  constructor() {
    this.moysklad = new Moysklad({
      auth: {
        token: AUTH_TOKEN,
      },
    })
  }

  private async trackResult(
    endpoint: string,
    method: string,
    fn: () => Promise<unknown>,
  ): Promise<TestResult> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      return { endpoint, method, status: "success", result, duration }
    } catch (error) {
      const duration = Date.now() - start
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { endpoint, method, status: "error", error: errorMessage, duration }
    }
  }

  private logResult(result: TestResult) {
    const icon = result.status === "success" ? "✅" : result.status === "error" ? "❌" : "⏭️"
    const duration = formatDuration(result.duration)
    console.log(`  ${icon} ${result.method}: ${duration}`)

    if (result.status === "success" && result.result !== undefined) {
      if (Array.isArray(result.result) && result.result.length > 0) {
        console.log(`     → ${result.result.length} items`)
      } else if (typeof result.result === "object" && result.result !== null) {
        const keys = Object.keys(result.result)
        console.log(`     → ${truncateResult(result.result)}`)
      }
    }

    if (result.status === "error") {
      console.log(`     → Error: ${result.error}`)
    }
  }

  async runAllTests(): Promise<void> {
    console.log("=".repeat(60))
    console.log("Moysklad API - Comprehensive Endpoint Tests")
    console.log("=".repeat(60))
    console.log()

    // Test each endpoint
    await this.testAssortmentEndpoint()
    await this.testProductEndpoint()
    await this.testServiceEndpoint()
    await this.testBundleEndpoint()
    await this.testVariantEndpoint()
    await this.testWebhookEndpoint()
    await this.testImageEndpoint()
    await this.testDownloadPermanentHrefEndpoint()

    // Print summary
    this.printSummary()
  }

  async testAssortmentEndpoint(): Promise<void> {
    console.log("\n📦 Assortment Endpoint")
    console.log("-".repeat(40))

    const { assortment } = this.moysklad

    // Test list
    let result = await this.trackResult("assortment", "list", () =>
      assortment.list({ pagination: { limit: 5 } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test first
    result = await this.trackResult("assortment", "first", () =>
      assortment.first({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test all (limited)
    result = await this.trackResult("assortment", "all", () =>
      assortment.all({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test allChunks
    result = await this.trackResult("assortment", "allChunks", async () => {
      const chunks: unknown[] = []
      for await (const chunk of assortment.allChunks({ filter: { archived: false } })) {
        chunks.push(chunk)
        if (chunks.length >= 2) break // Limit to 2 chunks
      }
      return { chunksCount: chunks.length }
    })
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    console.log()
  }

  async testProductEndpoint(): Promise<void> {
    console.log("\n🛍️ Product Endpoint")
    console.log("-".repeat(40))

    const { product } = this.moysklad

    // Test list
    let result = await this.trackResult("product", "list", () =>
      product.list({ pagination: { limit: 5 } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test first
    result = await this.trackResult("product", "first", () =>
      product.first({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test all (limited)
    result = await this.trackResult("product", "all", () =>
      product.all({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test allChunks
    result = await this.trackResult("product", "allChunks", async () => {
      const chunks: unknown[] = []
      for await (const chunk of product.allChunks({ filter: { archived: false } })) {
        chunks.push(chunk)
        if (chunks.length >= 2) break
      }
      return { chunksCount: chunks.length }
    })
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test byId (get first product id from list)
    const listResult = await product.list({ pagination: { limit: 1 } })
    if (listResult.rows.length > 0) {
      const productId = listResult.rows[0]?.id
      result = await this.trackResult("product", "byId", () => product.byId(productId!))
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)
    } else {
      this.results.push({
        endpoint: "product",
        method: "byId",
        status: "skipped",
        duration: 0,
      })
      console.log("  ⏭️ byId: skipped (no products found)")
    }

    console.log()
  }

  async testServiceEndpoint(): Promise<void> {
    console.log("\n🔧 Service Endpoint")
    console.log("-".repeat(40))

    const { service } = this.moysklad

    // Test list
    let result = await this.trackResult("service", "list", () =>
      service.list({ pagination: { limit: 5 } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test first
    result = await this.trackResult("service", "first", () =>
      service.first({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test all
    result = await this.trackResult("service", "all", () =>
      service.all({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test allChunks
    result = await this.trackResult("service", "allChunks", async () => {
      const chunks: unknown[] = []
      for await (const chunk of service.allChunks({ filter: { archived: false } })) {
        chunks.push(chunk)
        if (chunks.length >= 2) break
      }
      return { chunksCount: chunks.length }
    })
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test byId
    const listResult = await service.list({ pagination: { limit: 1 } })
    if (listResult.rows.length > 0) {
      const serviceId = listResult.rows[0]?.id
      result = await this.trackResult("service", "byId", () => service.byId(serviceId!))
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)
    } else {
      this.results.push({
        endpoint: "service",
        method: "byId",
        status: "skipped",
        duration: 0,
      })
      console.log("  ⏭️ byId: skipped (no services found)")
    }

    console.log()
  }

  async testBundleEndpoint(): Promise<void> {
    console.log("\n📦 Bundle Endpoint")
    console.log("-".repeat(40))

    const { bundle } = this.moysklad

    // Test list
    let result = await this.trackResult("bundle", "list", () =>
      bundle.list({ pagination: { limit: 5 } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test first
    result = await this.trackResult("bundle", "first", () =>
      bundle.first({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test all
    result = await this.trackResult("bundle", "all", () =>
      bundle.all({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test allChunks
    result = await this.trackResult("bundle", "allChunks", async () => {
      const chunks: unknown[] = []
      for await (const chunk of bundle.allChunks({ filter: { archived: false } })) {
        chunks.push(chunk)
        if (chunks.length >= 2) break
      }
      return { chunksCount: chunks.length }
    })
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test byId
    const listResult = await bundle.list({ pagination: { limit: 1 } })
    if (listResult.rows.length > 0) {
      const bundleId = listResult.rows[0]?.id
      result = await this.trackResult("bundle", "byId", () => bundle.byId(bundleId!))
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)
    } else {
      this.results.push({
        endpoint: "bundle",
        method: "byId",
        status: "skipped",
        duration: 0,
      })
      console.log("  ⏭️ byId: skipped (no bundles found)")
    }

    console.log()
  }

  async testVariantEndpoint(): Promise<void> {
    console.log("\n🏷️ Variant Endpoint")
    console.log("-".repeat(40))

    const { variant } = this.moysklad

    // Test list
    let result = await this.trackResult("variant", "list", () =>
      variant.list({ pagination: { limit: 5 } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test first
    result = await this.trackResult("variant", "first", () =>
      variant.first({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test all
    result = await this.trackResult("variant", "all", () =>
      variant.all({ filter: { archived: false } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test allChunks
    result = await this.trackResult("variant", "allChunks", async () => {
      const chunks: unknown[] = []
      for await (const chunk of variant.allChunks({ filter: { archived: false } })) {
        chunks.push(chunk)
        if (chunks.length >= 2) break
      }
      return { chunksCount: chunks.length }
    })
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test byId
    const listResult = await variant.list({ pagination: { limit: 1 } })
    if (listResult.rows.length > 0) {
      const variantId = listResult.rows[0]?.id
      result = await this.trackResult("variant", "byId", () => variant.byId(variantId!))
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)
    } else {
      this.results.push({
        endpoint: "variant",
        method: "byId",
        status: "skipped",
        duration: 0,
      })
      console.log("  ⏭️ byId: skipped (no variants found)")
    }

    console.log()
  }

  async testWebhookEndpoint(): Promise<void> {
    console.log("\n🔗 Webhook Endpoint")
    console.log("-".repeat(40))

    const { webhook } = this.moysklad

    // Test list
    let result = await this.trackResult("webhook", "list", () =>
      webhook.list(),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test first
    result = await this.trackResult("webhook", "first", () =>
      webhook.first({ pagination: { limit: 1 } }),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test all
    result = await this.trackResult("webhook", "all", () => webhook.all())
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test allChunks
    result = await this.trackResult("webhook", "allChunks", async () => {
      const chunks: unknown[] = []
      for await (const chunk of webhook.allChunks()) {
        chunks.push(chunk)
        if (chunks.length >= 2) break
      }
      return { chunksCount: chunks.length }
    })
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test byId
    const listResult = await webhook.list()
    if (listResult.rows.length > 0) {
      const webhookId = listResult.rows[0]?.id
      result = await this.trackResult("webhook", "byId", () => webhook.byId(webhookId!))
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)
    } else {
      this.results.push({
        endpoint: "webhook",
        method: "byId",
        status: "skipped",
        duration: 0,
      })
      console.log("  ⏭️ byId: skipped (no webhooks found)")
    }

    // Test create (create a test webhook)
    const testWebhookUrl = `https://example.com/webhook-test-${Date.now()}`
    result = await this.trackResult("webhook", "create", () =>
      webhook.create({
        url: testWebhookUrl,
        action: "CREATE",
        entityType: "product",
      }),
    )
    this.results.push(result)
    this.logResult(result)

    if (result.status === "success" && result.result) {
      const createdWebhook = result.result as { id: string }
      await sleep(PAUSE_MS)

      // Test update
      result = await this.trackResult("webhook", "update", () =>
        webhook.update(createdWebhook.id, { enabled: false }),
      )
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)

      // Test delete
      result = await this.trackResult("webhook", "delete", () =>
        webhook.delete(createdWebhook.id),
      )
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)
    }

    console.log()
  }


  async testImageEndpoint(): Promise<void> {
    console.log("\n🖼️ Image Endpoint")
    console.log("-".repeat(40))

    const { image, product } = this.moysklad

    // Get a product with images to test against
    const productSingle = await product.byId('8f19776a-02b5-11f1-0a80-1af600003a6d')
    let productId: string | undefined
    if (productSingle.id) {
      productId = productSingle.id
    }

    if (!productId) {
      console.log("  ⏭️ All tests skipped (no products found)")
      this.results.push(
        { endpoint: "image", method: "list", status: "skipped", duration: 0 },
        { endpoint: "image", method: "first", status: "skipped", duration: 0 },
        { endpoint: "image", method: "all", status: "skipped", duration: 0 },
        { endpoint: "image", method: "allChunks", status: "skipped", duration: 0 },
        { endpoint: "image", method: "create", status: "skipped", duration: 0 },
        { endpoint: "image", method: "update", status: "skipped", duration: 0 },
        { endpoint: "image", method: "delete", status: "skipped", duration: 0 },
        { endpoint: "image", method: "batchDelete", status: "skipped", duration: 0 },
      )
      console.log()
      return
    }

    // Test list
    let result = await this.trackResult("image", "list", () =>
      image.list("product", productId!),
    )
    this.results.push(result)
    this.logResult(result)

    let existingImageIds: string[] = []
    if (result.status === "success" && result.result) {
      const imagesResult = result.result as { rows?: Array<{ id: string }> }
      existingImageIds = imagesResult.rows?.map((img) => img.id) || []
    }
    await sleep(PAUSE_MS)

    // Test first
    result = await this.trackResult("image", "first", () =>
      image.first("product", productId!),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test all
    result = await this.trackResult("image", "all", () =>
      image.all("product", productId!),
    )
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test allChunks
    result = await this.trackResult("image", "allChunks", async () => {
      const chunks: unknown[] = []
      for await (const chunk of image.allChunks("product", productId!)) {
        chunks.push(chunk)
        if (chunks.length >= 2) break
      }
      return { chunksCount: chunks.length }
    })
    this.results.push(result)
    this.logResult(result)
    await sleep(PAUSE_MS)

    // Test create (add a small test image)
    const testImageContent = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAA3NCSVQICAjb4U/gAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    result = await this.trackResult("image", "create", () =>
      image.create("product", productId!, {
        filename: `test-image-${Date.now()}.png`,
        content: testImageContent,
        title: "Test Image",
      }),
    )
    this.results.push(result)
    this.logResult(result)

    let createdImageId: string | undefined
    if (result.status === "success" && result.result) {
      const images = result.result as Array<{ id: string; meta: ImageMeta }>
      // Find the newly created image (last one in the returned array)
      const lastImage = images[images.length - 1]
      createdImageId = lastImage?.id
      console.log(`     → Created image ID: ${createdImageId}`)
    }
    await sleep(PAUSE_MS)

    // Test update (skip for now - requires specific image state)
    this.results.push({ endpoint: "image", method: "update", status: "skipped", duration: 0 })
    console.log("  ⏭️ update: skipped (requires specific image state)")

    // Test delete (delete the created image if we have one)
    if (createdImageId) {
      result = await this.trackResult("image", "delete", () =>
        image.delete("product", productId!, createdImageId!),
      )
      this.results.push(result)
      this.logResult(result)
      await sleep(PAUSE_MS)
    } else {
      this.results.push({ endpoint: "image", method: "delete", status: "skipped", duration: 0 })
      console.log("  ⏭️ delete: skipped (no created image to delete)")
    }

    // Test batchDelete (skip for now - requires specific image state)
    this.results.push({ endpoint: "image", method: "batchDelete", status: "skipped", duration: 0 })
    console.log("  ⏭️ batchDelete: skipped (requires specific image state)")

    console.log()
  }

  async testDownloadPermanentHrefEndpoint(): Promise<void> {
    console.log("\n🖼️ Download Permanent Href Tests (fields parameter)")
    console.log("-".repeat(40))

    const { product, bundle, variant } = this.moysklad

    // Test Product with fields=downloadPermanentHref and expand=images
    let result = await this.trackResult("downloadPermanentHref", "product.list with fields", async () => {
      const productList = await product.first({
        filter: { name: { eq: "Второй тестовый товар" } },
        expand: { images: true },
        fields: ["downloadPermanentHref"],
      })
      return productList
    })
    this.results.push(result)
    // this.logResult(result)

    if (result.status === "success" && result.result) {
      const productListResult = result.result as { rows: Product[] }
      const productWithImages = productListResult.rows?.[0]
      const images = productWithImages?.images
      // Check if images is an array (expanded with fields) or just meta object
      const hasPermanentHref = images && 'rows' in images && images?.rows?.some(
        (img) => img?.meta?.downloadPermanentHref !== undefined
      )
      if (hasPermanentHref) {
        console.log("     ✅ Product images have downloadPermanentHref")
      } else {
        console.log("     ⚠️  Product images: no downloadPermanentHref (may not have images or not expanded with fields)")
      }
    }
    await sleep(PAUSE_MS)

    // Test Bundle with fields=downloadPermanentHref and expand=images
    result = await this.trackResult("downloadPermanentHref", "bundle.list with fields", async () => {
      const bundleList = await bundle.list({
        pagination: { limit: 1 },
        expand: { images: true },
        fields: ["downloadPermanentHref"],
      })
      return bundleList
    })
    this.results.push(result)
    this.logResult(result)

    if (result.status === "success" && result.result) {
      const bundleListResult = result.result as { rows?: Array<{ images?: Image[] | ImageCollectionMetaOnly }> }
      const bundleWithImages = bundleListResult.rows?.[0]
      const images = bundleWithImages?.images
      const hasPermanentHref = Array.isArray(images) && images.some(
        (img) => img?.meta?.downloadPermanentHref !== undefined
      )
      if (hasPermanentHref) {
        console.log("     ✅ Bundle images have downloadPermanentHref")
      } else {
        console.log("     ⚠️  Bundle images: no downloadPermanentHref (may not have images or not expanded with fields)")
      }
    }
    await sleep(PAUSE_MS)

    // Test Variant with fields=downloadPermanentHref and expand=images
    result = await this.trackResult("downloadPermanentHref", "variant.list with fields", async () => {
      const variantList = await variant.list({
        pagination: { limit: 1 },
        expand: { images: true },
        fields: ["downloadPermanentHref"],
      })
      return variantList
    })
    this.results.push(result)
    this.logResult(result)

    if (result.status === "success" && result.result) {
      const variantListResult = result.result as { rows?: Array<{ images?: Image[] | ImageCollectionMetaOnly }> }
      const variantWithImages = variantListResult.rows?.[0]
      const images = variantWithImages?.images
      const hasPermanentHref = Array.isArray(images) && images.some(
        (img) => img?.meta?.downloadPermanentHref !== undefined
      )
      if (hasPermanentHref) {
        console.log("     ✅ Variant images have downloadPermanentHref")
      } else {
        console.log("     ⚠️  Variant images: no downloadPermanentHref (may not have images or not expanded with fields)")
      }
    }
    await sleep(PAUSE_MS)

    // Test without fields parameter (should NOT have downloadPermanentHref)
    result = await this.trackResult("downloadPermanentHref", "product.list without fields", async () => {
      const productList = await product.list({
        pagination: { limit: 1 },
        expand: { images: true },
      })
      return productList
    })
    this.results.push(result)
    this.logResult(result)

    if (result.status === "success" && result.result) {
      const productListResult = result.result as { rows?: Array<{ images?: Image[] | ImageCollectionMetaOnly }> }
      const productWithImages = productListResult.rows?.[0]
      const images = productWithImages?.images
      // Without fields param, images should be just { meta: {...} }, not an array
      const hasPermanentHref = Array.isArray(images) && images.some(
        (img) => img?.meta?.downloadPermanentHref !== undefined
      )
      if (!hasPermanentHref) {
        console.log("     ✅ Without fields param: no downloadPermanentHref (as expected)")
      } else {
        console.log("     ⚠️  Without fields param: has downloadPermanentHref (unexpected)")
      }
    }
    await sleep(PAUSE_MS)

    console.log()
  }

  private printSummary(): void {
    console.log("=".repeat(60))
    console.log("TEST SUMMARY")
    console.log("=".repeat(60))

    const summaries: EndpointSummary[] = []

    for (const endpoint of [
      "assortment",
      "product",
      "service",
      "bundle",
      "variant",
      "webhook",
      "image",
      "downloadPermanentHref",
    ]) {
      const endpointResults = this.results.filter((r) => r.endpoint === endpoint)
      summaries.push({
        endpoint,
        total: endpointResults.length,
        success: endpointResults.filter((r) => r.status === "success").length,
        errors: endpointResults.filter((r) => r.status === "error").length,
        skipped: endpointResults.filter((r) => r.status === "skipped").length,
      })
    }

    console.log()
    console.log("Endpoint Summary:")
    console.log("-".repeat(40))
    console.log(
      "Endpoint       | Total | ✅ Success | ❌ Errors | ⏭️ Skipped",
    )
    console.log("-".repeat(60))

    for (const summary of summaries) {
      console.log(
        `${summary.endpoint.padEnd(15)} | ${String(summary.total).padEnd(5)} | ${String(summary.success).padEnd(10)} | ${String(summary.errors).padEnd(9)} | ${String(summary.skipped).padEnd(9)}`,
      )
    }

    console.log("-".repeat(60))

    const totalTests = this.results.length
    const totalSuccess = this.results.filter((r) => r.status === "success").length
    const totalErrors = this.results.filter((r) => r.status === "error").length
    const totalSkipped = this.results.filter((r) => r.status === "skipped").length
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    console.log(
      `TOTAL: ${totalTests} tests | ${totalSuccess} success | ${totalErrors} errors | ${totalSkipped} skipped`,
    )
    console.log(`Total time: ${formatDuration(totalDuration)}`)
    console.log()

    // Show errors if any
    const errorResults = this.results.filter((r) => r.status === "error")
    if (errorResults.length > 0) {
      console.log("Errors:")
      console.log("-".repeat(40))
      for (const result of errorResults) {
        console.log(`  ❌ ${result.endpoint}.${result.method}: ${result.error}`)
      }
    }

    console.log()
    console.log("=".repeat(60))
  }
}

// Run all tests
const runner = new EndpointTestRunner()
// await runner.runAllTests()

await runner.testDownloadPermanentHrefEndpoint()
