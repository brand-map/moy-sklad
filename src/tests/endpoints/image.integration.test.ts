import { describe, expect, test } from "bun:test"

import { ImageEndpoint } from "../../endpoints/image"
import { ProductEndpoint } from "../../endpoints/product"
import { createIntegrationClient, isIntegrationEnabled } from "../helpers/integration"

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip

describeIntegration("image endpoint integration", () => {
  test("list returns image rows for an existing product", async () => {
    const client = createIntegrationClient()
    const imageEndpoint = new ImageEndpoint(client)
    const productEndpoint = new ProductEndpoint(client)

    const { rows } = await productEndpoint.list({ pagination: { limit: 1, offset: 0 } })
    const productId = (rows[0] as any)?.id

    if (!productId) {
      return
    }

    const result = await imageEndpoint.list("product", productId, { pagination: { limit: 5, offset: 0 } })

    expect(Array.isArray(result.rows)).toBe(true)
    expect(result.meta.type).toBe("image")
  })
})
