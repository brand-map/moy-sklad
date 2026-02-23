import { describe, expect, test } from "bun:test"

import { ServiceEndpoint } from "../../endpoints/service"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("ServiceEndpoint (unit)", () => {
  test("list without options omits query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ServiceEndpoint(client)

    await endpoint.list()

    expect(calls[0]?.input).toBe("entity/service")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })

  test("list sends GET with composed query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ServiceEndpoint(client)

    await endpoint.list({
      pagination: { limit: 7, offset: 14 },
      filter: { name: "Delivery" },
      expand: { owner: true },
      order: [{ field: "name", direction: "asc" }],
      search: "del",
    })

    expect(calls[0]?.input).toBe("entity/service")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "7",
      offset: "14",
      expand: "owner",
      order: "name,asc",
      search: "del",
      filter: "name=Delivery",
    })
  })

  test("all uses getAll and respects expandLimit when expand provided", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 50, expandLimit: 2, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new ServiceEndpoint(client)
    const result = await endpoint.all({ expand: { owner: true } })

    expect(result.rows).toHaveLength(3)
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "2",
      offset: "0",
      expand: "owner",
    })
    expect(getSearchParamsObject(calls[1]!)).toEqual({
      limit: "2",
      offset: "2",
      expand: "owner",
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

    const endpoint = new ServiceEndpoint(client)
    await endpoint.all()

    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("allChunks yields batched rows", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 4 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }, { id: "4" }], meta: { size: 4 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new ServiceEndpoint(client)
    const chunks: number[] = []

    for await (const chunk of endpoint.allChunks()) {
      chunks.push(chunk.rows.length)
    }

    expect(chunks).toEqual([2, 2])
    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("first requests limit=1", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ServiceEndpoint(client)

    await endpoint.first({ filter: { code: "S-1" } })

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "1",
      filter: "code=S-1",
    })
  })

  test("byId uses resource path", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "srv-1" }] })
    const endpoint = new ServiceEndpoint(client)

    await endpoint.byId("srv-1")

    expect(calls[0]?.input).toBe("entity/service/srv-1")
    expect(calls[0]?.options?.method).toBe("GET")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })
})
