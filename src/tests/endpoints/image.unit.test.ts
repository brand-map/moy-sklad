import { describe, expect, test } from "bun:test"

import { ImageEndpoint } from "../../endpoints/image"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("ImageEndpoint (unit)", () => {
  test("list without options omits query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ImageEndpoint(client)

    await endpoint.list("product", "p-1")

    expect(calls[0]?.input).toBe("entity/product/p-1/images")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })

  test("list builds image collection path and query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ImageEndpoint(client)

    await endpoint.list("product", "p-1", {
      pagination: { limit: 3, offset: 6 },
      fields: ["downloadPermanentHref"],
    })

    expect(calls[0]?.input).toBe("entity/product/p-1/images")
    expect(calls[0]?.options?.method).toBe("GET")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "3",
      offset: "6",
      fields: "downloadPermanentHref",
    })
  })

  test("all paginates through all image chunks", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })
    const endpoint = new ImageEndpoint(client)

    const result = await endpoint.all("variant", "v-1", { fields: ["downloadPermanentHref"] })

    expect(result.rows).toHaveLength(3)
    expect(calls[0]?.input).toBe("entity/variant/v-1/images")
    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "2",
      offset: "0",
      fields: "downloadPermanentHref",
    })
    expect(getSearchParamsObject(calls[1]!)).toEqual({
      limit: "2",
      offset: "2",
      fields: "downloadPermanentHref",
    })
  })

  test("all without fields keeps only pagination params", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [{ rows: [{ id: "1" }], meta: { size: 1 }, context: { id: "ctx" } }],
    })
    const endpoint = new ImageEndpoint(client)

    await endpoint.all("product", "p-1")

    expect(getSearchParamsObject(calls[0]!)).toEqual({
      limit: "2",
      offset: "0",
    })
  })

  test("allChunks yields chunked responses", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 5 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }, { id: "4" }], meta: { size: 5 }, context: { id: "ctx" } },
        { rows: [{ id: "5" }], meta: { size: 5 }, context: { id: "ctx" } },
      ],
    })

    const endpoint = new ImageEndpoint(client)
    const ids: string[] = []

    for await (const chunk of endpoint.allChunks("bundle", "b-1")) {
      ids.push(...chunk.rows.map((row: any) => row.id))
    }

    expect(ids).toEqual(["1", "2", "3", "4", "5"])
    expect(calls[0]?.input).toBe("entity/bundle/b-1/images")
    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
    expect(getSearchParamsObject(calls[2]!)).toEqual({ limit: "2", offset: "4" })
  })

  test("first enforces limit=1", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new ImageEndpoint(client)

    await endpoint.first("product", "p-1")

    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "1" })
  })

  test("create sends POST with JSON body", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [[{ id: "img-1" }]] })
    const endpoint = new ImageEndpoint(client)

    await endpoint.create("product", "p-1", {
      filename: "a.png",
      content: "base64",
    })

    expect(calls[0]?.input).toBe("entity/product/p-1/images")
    expect(calls[0]?.options?.method).toBe("POST")
    expect(calls[0]?.options?.body).toBe(JSON.stringify({ filename: "a.png", content: "base64" }))
  })

  test("update sends POST with array JSON body", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [[{ id: "img-1" }]] })
    const endpoint = new ImageEndpoint(client)

    const items = [{ filename: "a.png", content: "base64" }]
    await endpoint.update("product", "p-1", items as any)

    expect(calls[0]?.input).toBe("entity/product/p-1/images")
    expect(calls[0]?.options?.method).toBe("POST")
    expect(calls[0]?.options?.body).toBe(JSON.stringify(items))
  })

  test("delete sends DELETE to image resource", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{}] })
    const endpoint = new ImageEndpoint(client)

    await endpoint.delete("product", "p-1", "img-1")

    expect(calls[0]?.input).toBe("entity/product/p-1/images/img-1")
    expect(calls[0]?.options?.method).toBe("DELETE")
  })

  test("batchDelete posts to /delete with meta list", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [[{ info: "ok" }]] })
    const endpoint = new ImageEndpoint(client)

    const metaList = [
      {
        href: "https://example/image/1",
        type: "image",
        mediaType: "application/json",
      },
    ]

    await endpoint.batchDelete("product", "p-1", metaList)

    expect(calls[0]?.input).toBe("entity/product/p-1/images/delete")
    expect(calls[0]?.options?.method).toBe("POST")
    expect(calls[0]?.options?.body).toBe(JSON.stringify(metaList))
  })
})
