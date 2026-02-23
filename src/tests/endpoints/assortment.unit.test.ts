import { describe, expect, test } from "bun:test"

import { AssortmentEndpoint } from "../../endpoints/assortment"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("AssortmentEndpoint (unit)", () => {
  test("list without options omits query", async () => {
    const { client, calls } = createApiClientTestHarness({
      responses: [{ rows: [], meta: { size: 0 }, context: {} }],
    })
    const endpoint = new AssortmentEndpoint(client)

    await endpoint.list()

    expect(calls).toHaveLength(1)
    expect(calls[0]?.input).toBe("entity/assortment")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })

  test("list builds expected GET request config", async () => {
    const { client, calls } = createApiClientTestHarness({
      responses: [{ rows: [], meta: { size: 0 }, context: {} }],
    })
    const endpoint = new AssortmentEndpoint(client)

    await endpoint.list({
      pagination: { limit: 10, offset: 20 },
      filter: { name: "Tea" },
      groupBy: "consignment",
      expand: { images: true },
      fields: ["downloadPermanentHref"],
    })

    expect(calls).toHaveLength(1)
    expect(calls[0]?.input).toBe("entity/assortment")
    expect(calls[0]?.options?.method).toBe("GET")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "10",
      offset: "20",
      expand: "images",
      filter: "name=Tea",
      fields: "downloadPermanentHref",
      groupBy: "consignment",
    })
  })

  test("all uses getAll pagination and aggregates rows", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: {
        limit: 5,
        expandLimit: 2,
        concurrencyLimit: 1,
      },
      responses: [
        { rows: [{ id: "a" }, { id: "b" }], meta: { size: 3 }, context: { token: "ctx" } },
        { rows: [{ id: "c" }], meta: { size: 3 }, context: { token: "ctx" } },
      ],
    })
    const endpoint = new AssortmentEndpoint(client)

    const result = await endpoint.all({
      filter: { name: "Tea" },
      groupBy: "product",
    })

    expect(result.rows).toHaveLength(3)
    expect(calls).toHaveLength(2)

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "2",
      offset: "0",
      filter: "name=Tea",
      expand: "images",
      fields: "downloadPermanentHref",
      groupBy: "product",
    })

    expect(getSearchParamsObject(calls[1]!)).toEqual({
      limit: "2",
      offset: "2",
      filter: "name=Tea",
      expand: "images",
      fields: "downloadPermanentHref",
      groupBy: "product",
    })
  })

  test("all without filter uses regular limit branch", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: {
        limit: 3,
        expandLimit: 1,
        concurrencyLimit: 1,
      },
      responses: [{ rows: [{ id: "a" }], meta: { size: 1 }, context: { token: "ctx" } }],
    })
    const endpoint = new AssortmentEndpoint(client)

    await endpoint.all()

    expect(calls).toHaveLength(1)
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "3",
      offset: "0",
      expand: "images",
      fields: "downloadPermanentHref",
    })
  })

  test("allChunks yields all batches with expected query params", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: {
        limit: 5,
        expandLimit: 2,
        concurrencyLimit: 1,
      },
      responses: [
        { rows: [{ id: "a" }, { id: "b" }], meta: { size: 5 }, context: { token: "ctx" } },
        { rows: [{ id: "c" }, { id: "d" }], meta: { size: 5 }, context: { token: "ctx" } },
        { rows: [{ id: "e" }], meta: { size: 5 }, context: { token: "ctx" } },
      ],
    })
    const endpoint = new AssortmentEndpoint(client)

    const chunkSizes: number[] = []
    for await (const chunk of endpoint.allChunks({ filter: { name: "Tea" }, groupBy: "variant" })) {
      chunkSizes.push(chunk.rows.length)
    }

    expect(chunkSizes).toEqual([2, 2, 1])
    expect(calls).toHaveLength(3)

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "2",
      offset: "0",
      filter: "name=Tea",
      groupBy: "variant",
    })
    expect(getSearchParamsObject(calls[1]!)).toEqual({
      limit: "2",
      offset: "2",
      filter: "name=Tea",
      groupBy: "variant",
    })
    expect(getSearchParamsObject(calls[2]!)).toEqual({
      limit: "2",
      offset: "4",
      filter: "name=Tea",
      groupBy: "variant",
    })
  })

  test("allChunks without filter uses regular limit branch", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: {
        limit: 3,
        expandLimit: 1,
        concurrencyLimit: 1,
      },
      responses: [{ rows: [{ id: "a" }], meta: { size: 1 }, context: { token: "ctx" } }],
    })
    const endpoint = new AssortmentEndpoint(client)

    const chunkSizes: number[] = []
    for await (const chunk of endpoint.allChunks()) {
      chunkSizes.push(chunk.rows.length)
    }

    expect(chunkSizes).toEqual([1])
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "3",
      offset: "0",
    })
  })

  test("first requests exactly one item", async () => {
    const { client, calls } = createApiClientTestHarness({
      responses: [{ rows: [], meta: { size: 0 }, context: {} }],
    })
    const endpoint = new AssortmentEndpoint(client)

    await endpoint.first({ filter: { code: "A-1" }, groupBy: "consignment" })

    expect(calls).toHaveLength(1)
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "1",
      filter: "code=A-1",
      groupBy: "consignment",
    })
  })

  test("size is not implemented", async () => {
    const { client } = createApiClientTestHarness()
    const endpoint = new AssortmentEndpoint(client)

    expect(() => endpoint.size()).toThrow("Method not implemented")
  })
})
