import { describe, expect, test } from "bun:test"

import { ReportEndpoint } from "../../endpoints/report"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("ReportEndpoint (unit)", () => {
  test("stock composes request with groupBy and filters", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ReportEndpoint(client)

    await endpoint.stock({
      groupBy: "store",
      pagination: { limit: 50, offset: 100 },
      filter: { name: "Milk", archived: false },
      expand: { assortment: true },
      fields: ["name", "stock"],
    })


    expect(calls).toHaveLength(1)
    expect(calls[0]?.input).toBe("report/stock/all")
    expect(calls[0]?.options?.method).toBe("GET")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "50",
      offset: "100",
      expand: "assortment",
      filter: "name=Milk;archived=false",
      fields: "name,stock",
      groupBy: "store",
    })
  })

  test("stock omits groupBy when not passed", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ReportEndpoint(client)

    await endpoint.stock({
      pagination: { limit: 10, offset: 0 },
    })

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "10",
      offset: "0",
    })
  })

  test("stock with no options emits no query params", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ReportEndpoint(client)

    await endpoint.stock()

    expect(calls[0]?.input).toBe("report/stock/all")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })
})
