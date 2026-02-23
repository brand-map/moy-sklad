import { describe, expect, test } from "bun:test"

import { WebhookEndpoint } from "../../endpoints/webhook"
import { createIntegrationClient, isIntegrationEnabled, isWriteIntegrationEnabled } from "../helpers/integration"

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip
const describeWriteIntegration = isWriteIntegrationEnabled() ? describe : describe.skip

describeIntegration("webhook endpoint integration", () => {
  test("list returns webhook rows", async () => {
    const endpoint = new WebhookEndpoint(createIntegrationClient())

    const result = await endpoint.list()

    expect(Array.isArray(result.rows)).toBe(true)
    expect(result.meta.type).toBe("webhook")
  })

  test("byId returns entity when at least one row exists", async () => {
    const endpoint = new WebhookEndpoint(createIntegrationClient())

    const { rows } = await endpoint.list()
    const id = (rows[0] as any)?.id

    if (!id) {
      return
    }

    const result = await endpoint.byId(id)

    expect((result as any).id).toBe(id)
  })
})

describeWriteIntegration("webhook endpoint integration (write)", () => {
  test("create/update/delete lifecycle", async () => {
    const endpoint = new WebhookEndpoint(createIntegrationClient())
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const created = await endpoint.create({
      url: `https://example.com/moysklad/${uniqueSuffix}`,
      action: "CREATE",
      entityType: "product",
    } as any)

    expect((created as any).id).toBeDefined()

    const updated = await endpoint.update((created as any).id, {
      enabled: false,
    } as any)

    expect((updated as any).id).toBe((created as any).id)

    await endpoint.delete((created as any).id)
  })
})
