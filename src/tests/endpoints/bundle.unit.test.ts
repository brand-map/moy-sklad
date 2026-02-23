import { describe, expect, test } from "bun:test"

import { BundleEndpoint } from "../../endpoints/bundle"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("BundleEndpoint (unit)", () => {
  test("list without options omits query", async () => {
    const { client, calls } = createApiClientTestHarness({
      responses: [{ rows: [], meta: { size: 0 }, context: {} }],
    })
    const endpoint = new BundleEndpoint(client)

    await endpoint.list()

    expect(calls[0]?.input).toBe("entity/bundle")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })

  test("list composes pagination/filter/expand/fields query", async () => {
    const { client, calls } = createApiClientTestHarness({
      responses: [{ rows: [], meta: { size: 0 }, context: {} }],
    })
    const endpoint = new BundleEndpoint(client)

    await endpoint.list({
      pagination: { limit: 10, offset: 5 },
      filter: { name: "Bundle A" },
      expand: { images: true },
      fields: ["downloadPermanentHref"],
    })

    expect(calls).toHaveLength(1)
    expect(calls[0]?.input).toBe("entity/bundle")
    expect(calls[0]?.options?.method).toBe("GET")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "10",
      offset: "5",
      expand: "images",
      filter: "name=Bundle A",
      fields: "downloadPermanentHref",
    })
  })

  test("all uses expandLimit when expand is requested", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: {
        limit: 100,
        expandLimit: 2,
        concurrencyLimit: 1,
      },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new BundleEndpoint(client)

    const result = await endpoint.all({ expand: { images: true } })

    expect(result.rows).toHaveLength(3)
    expect(calls).toHaveLength(2)
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "2",
      offset: "0",
      expand: "images",
    })
    expect(getSearchParamsObject(calls[1]!)).toEqual({
      limit: "2",
      offset: "2",
      expand: "images",
    })
  })

  test("all without expand uses regular limit", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: {
        limit: 2,
        expandLimit: 1,
        concurrencyLimit: 1,
      },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new BundleEndpoint(client)
    await endpoint.all()

    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("allChunks yields all rows across chunks", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: {
        limit: 2,
        expandLimit: 1,
        concurrencyLimit: 1,
      },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 5 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }, { id: "4" }], meta: { size: 5 }, context: { id: "ctx" } },
        { rows: [{ id: "5" }], meta: { size: 5 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new BundleEndpoint(client)
    const rows: string[] = []

    for await (const chunk of endpoint.allChunks()) {
      rows.push(...chunk.rows.map((item: any) => item.id))
    }

    expect(rows).toEqual(["1", "2", "3", "4", "5"])
    expect(calls).toHaveLength(3)
    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
    expect(getSearchParamsObject(calls[2]!)).toEqual({ limit: "2", offset: "4" })
  })

  test("first always requests limit=1", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new BundleEndpoint(client)

    await endpoint.first({ filter: { code: "B-001" } })

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "1",
      filter: "code=B-001",
    })
  })

  test("byId requests entity path and optional query params", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "bundle-1" }] })
    const endpoint = new BundleEndpoint(client)

    await endpoint.byId("bundle-1", {
      expand: { images: true },
      fields: ["downloadPermanentHref"],
    })

    expect(calls[0]?.input).toBe("entity/bundle/bundle-1")
    expect(calls[0]?.options?.method).toBe("GET")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      expand: "images",
      fields: "downloadPermanentHref",
    })
  })

  test("byId without options omits query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "bundle-2" }] })
    const endpoint = new BundleEndpoint(client)

    await endpoint.byId("bundle-2")

    expect(calls[0]?.input).toBe("entity/bundle/bundle-2")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })
})
