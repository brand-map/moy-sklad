import { describe, expect, test } from "bun:test"

import { ProductEndpoint } from "../../endpoints/product"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("ProductEndpoint (unit)", () => {
  test("list composes query from pagination/filter/expand/fields", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ProductEndpoint(client)

    await endpoint.list({
      pagination: { limit: 20, offset: 40 },
      filter: { name: "Milk" },
      expand: { images: true },
      fields: ["downloadPermanentHref"],
      search: "M",
    })

    expect(calls).toHaveLength(1)
    expect(calls[0]?.input).toBe("entity/product")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "20",
      offset: "40",
      expand: "images",
      search: "M",
      filter: "name=Milk",
      fields: "downloadPermanentHref",
    })
  })

  test("all uses expandLimit for expanded requests and aggregates results", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 1000, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }], meta: { size: 2 }, context: { id: "ctx" } },
        { rows: [{ id: "2" }], meta: { size: 2 }, context: { id: "ctx" } },
      ],
    })
    const endpoint = new ProductEndpoint(client)

    const result = await endpoint.all({ expand: { images: true } })

    expect(result.rows).toHaveLength(2)
    expect(calls).toHaveLength(2)
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "1",
      offset: "0",
      expand: "images",
    })
    expect(getSearchParamsObject(calls[1]!)).toEqual({
      limit: "1",
      offset: "1",
      expand: "images",
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

    const endpoint = new ProductEndpoint(client)
    await endpoint.all()

    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("allChunks yields all chunks", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new ProductEndpoint(client)
    const collected: string[] = []

    for await (const chunk of endpoint.allChunks()) {
      collected.push(...chunk.rows.map((row: any) => row.id))
    }

    expect(collected).toEqual(["1", "2", "3"])
    expect(calls).toHaveLength(2)
    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("first requests limit=1", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ProductEndpoint(client)

    await endpoint.first({ filter: { code: "P-1" } })

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "1",
      filter: "code=P-1",
    })
  })

  test("byId uses resource path and optional expand/fields", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "p-1" }] })
    const endpoint = new ProductEndpoint(client)

    await endpoint.byId("p-1", {
      expand: { images: true },
      fields: ["downloadPermanentHref"],
    })

    expect(calls[0]?.input).toBe("entity/product/p-1")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      expand: "images",
      fields: "downloadPermanentHref",
    })
  })

  test("byId without options does not append query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "p-2" }] })
    const endpoint = new ProductEndpoint(client)

    await endpoint.byId("p-2")

    expect(calls[0]?.input).toBe("entity/product/p-2")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })

  test("unimplemented methods throw explicit errors", () => {
    const { client } = createApiClientTestHarness()
    const endpoint = new ProductEndpoint(client)

    expect(() => endpoint.get("id")).toThrow("Method not implemented")
    expect(() => endpoint.size()).toThrow("Method not implemented")
    expect(() => endpoint.delete("id")).toThrow("Method not implemented")
    expect(() => endpoint.update("id", {} as any)).toThrow("Method not implemented")
    expect(() => endpoint.upsert({} as any)).toThrow("Method not implemented")
    expect(() => endpoint.batchDelete(["id"])).toThrow("Method not implemented")
    expect(() => endpoint.trash("id")).toThrow("Method not implemented")
    expect(() => endpoint.audit("id")).toThrow("Method not implemented")
  })
})
