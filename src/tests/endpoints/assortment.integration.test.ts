import { describe, expect, test } from "bun:test"

import { AssortmentEndpoint } from "../../endpoints/assortment"
import { createIntegrationClient, isIntegrationEnabled } from "../helpers/integration"

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip

describeIntegration("assortment endpoint integration", () => {
  test("list returns assortment rows", async () => {
    const endpoint = new AssortmentEndpoint(createIntegrationClient())

    const result = await endpoint.list({ pagination: { limit: 5, offset: 0 } })

    expect(Array.isArray(result.rows)).toBe(true)
    expect(result.meta.type).toBe("assortment")
  })

  test("allChunks yields chunk structure", async () => {
    const endpoint = new AssortmentEndpoint(createIntegrationClient())

    let gotChunk = false

    for await (const chunk of endpoint.allChunks()) {
      expect(Array.isArray(chunk.rows)).toBe(true)
      gotChunk = true
      break
    }

    expect(gotChunk).toBe(true)
  })
})
