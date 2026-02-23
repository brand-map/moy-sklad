import { describe, expect, test } from "bun:test"

import { ProductEndpoint } from "../../endpoints/product"
import { createIntegrationClient, isIntegrationEnabled } from "../helpers/integration"

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip

describeIntegration("product endpoint integration", () => {
  test("list returns product rows", async () => {
    const endpoint = new ProductEndpoint(createIntegrationClient())

    const result = await endpoint.list({ pagination: { limit: 5, offset: 0 } })

    expect(Array.isArray(result.rows)).toBe(true)
    expect(result.meta.type).toBe("product")
  })

  test("byId returns entity when at least one row exists", async () => {
    const endpoint = new ProductEndpoint(createIntegrationClient())

    const { rows } = await endpoint.list({ pagination: { limit: 1, offset: 0 } })
    const id = (rows[0] as any)?.id

    if (!id) {
      return
    }

    const result = await endpoint.byId(id)

    expect((result as any).id).toBe(id)
  })
})
