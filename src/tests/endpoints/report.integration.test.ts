import { describe, expect, test } from "bun:test"

import { ReportEndpoint } from "../../endpoints/report"
import { createIntegrationClient, isIntegrationEnabled } from "../helpers/integration"

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip

describeIntegration("report endpoint integration", () => {
  test("stock returns report rows", async () => {
    const endpoint = new ReportEndpoint(createIntegrationClient())

    const result = await endpoint.stock({ pagination: { limit: 5, offset: 0 } })

    expect(Array.isArray(result.rows)).toBe(true)
    expect(result.meta.type).toBe("stock")
  })
})
