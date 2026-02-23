import { describe, expect, test } from "bun:test"

import { VariantEndpoint } from "../../endpoints/variant"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("VariantEndpoint (unit)", () => {
  test("list without options omits query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new VariantEndpoint(client)

    await endpoint.list()

    expect(calls[0]?.input).toBe("entity/variant")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })

  test("list composes expected query params", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new VariantEndpoint(client)

    await endpoint.list({
      pagination: { limit: 9, offset: 18 },
      filter: { code: "V-1" },
      expand: { product: true },
      fields: ["downloadPermanentHref"],
      search: "v",
    })

    expect(calls[0]?.input).toBe("entity/variant")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "9",
      offset: "18",
      expand: "product",
      search: "v",
      filter: "code=V-1",
      fields: "downloadPermanentHref",
    })
  })

  test("all uses getAll and aggregates rows", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 10, expandLimit: 2, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })
    const endpoint = new VariantEndpoint(client)

    const result = await endpoint.all({ expand: { product: true } })

    expect(result.rows).toHaveLength(3)
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "2",
      offset: "0",
      expand: "product",
    })
    expect(getSearchParamsObject(calls[1]!)).toEqual({
      limit: "2",
      offset: "2",
      expand: "product",
    })
  })

  test("all without expand uses regular limit", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })
    const endpoint = new VariantEndpoint(client)

    await endpoint.all()

    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("allChunks yields all expected chunks", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 5 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }, { id: "4" }], meta: { size: 5 }, context: { id: "ctx" } },
        { rows: [{ id: "5" }], meta: { size: 5 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new VariantEndpoint(client)
    const values: string[] = []

    for await (const chunk of endpoint.allChunks()) {
      values.push(...chunk.rows.map((row: any) => row.id))
    }

    expect(values).toEqual(["1", "2", "3", "4", "5"])
    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
    expect(getSearchParamsObject(calls[2]!)).toEqual({ limit: "2", offset: "4" })
  })

  test("first requests one entity", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new VariantEndpoint(client)

    await endpoint.first({ filter: { name: "Variant A" } })

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "1",
      filter: "name=Variant A",
    })
  })

  test("byId sends path and optional query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "v-1" }] })
    const endpoint = new VariantEndpoint(client)

    await endpoint.byId("v-1", {
      expand: { product: true },
      fields: ["downloadPermanentHref"],
    })

    expect(calls[0]?.input).toBe("entity/variant/v-1")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      expand: "product",
      fields: "downloadPermanentHref",
    })
  })

  test("byId without options omits query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "v-2" }] })
    const endpoint = new VariantEndpoint(client)

    await endpoint.byId("v-2")

    expect(calls[0]?.input).toBe("entity/variant/v-2")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })
})
