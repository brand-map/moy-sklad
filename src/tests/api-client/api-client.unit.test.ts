import { describe, expect, test } from "bun:test"

import { ApiClient, createApiClientFetcher } from "../../api-client"
import { MoyskladApiError, MoyskladError } from "../../errors"
import { createApiClientTestHarness } from "../helpers/api-client-test-harness"

describe("ApiClient (unit)", () => {
  test("createApiClientFetcher creates ky instance for token auth", () => {
    const fetcher = createApiClientFetcher(
      { token: "token-value" },
      { baseUrl: "https://api.example.com", userAgent: "unit-test-agent" },
    )

    expect(typeof fetcher).toBe("function")
    expect(typeof (fetcher as any).get).toBe("function")
  })

  test("createApiClientFetcher creates ky instance for basic auth", () => {
    const fetcher = createApiClientFetcher(
      { login: "user", password: "pass" } as any,
      { baseUrl: "https://api.example.com" },
    )

    expect(typeof fetcher).toBe("function")
    expect(typeof (fetcher as any).post).toBe("function")
  })

  test("get/post/put/delete forward method and request payload", async () => {
    const { client, calls } = createApiClientTestHarness({
      responses: [{}, {}, {}, {}],
    })

    await client.get("entity/a", { searchParameters: new URLSearchParams({ a: "1" }) })
    await client.post("entity/b", { body: { x: 1 } })
    await client.put("entity/c", { body: { y: 2 } })
    await client.delete("entity/d")

    expect(calls).toHaveLength(4)

    expect(calls[0]?.input).toBe("entity/a")
    expect(calls[0]?.options?.method).toBe("GET")

    expect(calls[1]?.input).toBe("entity/b")
    expect(calls[1]?.options?.method).toBe("POST")
    expect(calls[1]?.options?.body).toBe(JSON.stringify({ x: 1 }))

    expect(calls[2]?.input).toBe("entity/c")
    expect(calls[2]?.options?.method).toBe("PUT")
    expect(calls[2]?.options?.body).toBe(JSON.stringify({ y: 2 }))

    expect(calls[3]?.input).toBe("entity/d")
    expect(calls[3]?.options?.method).toBe("DELETE")
  })

  test("request normalizes leading slash in endpoint", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{}] })

    await client.get("/entity/product")

    expect(calls[0]?.input).toBe("entity/product")
  })

  test("request throws MoyskladApiError on API error JSON", async () => {
    const { client } = createApiClientTestHarness({
      responses: [
        {
          status: 400,
          body: {
            errors: [{ error: "Invalid data", code: 123, info: "https://example.dev/error" }],
          },
        },
      ],
    })

    await expect(client.get("entity/product")).rejects.toBeInstanceOf(MoyskladApiError)
  })

  test("request throws MoyskladError when response content-type is not JSON", async () => {
    const { client } = createApiClientTestHarness({
      responses: [
        {
          status: 500,
          rawBody: "oops",
          headers: { "Content-Type": "text/plain" },
        },
      ],
    })

    await expect(client.get("entity/product")).rejects.toBeInstanceOf(MoyskladError)
  })

  test("request throws MoyskladError when response body is invalid JSON", async () => {
    const { client } = createApiClientTestHarness({
      responses: [
        {
          status: 500,
          rawBody: "{",
          headers: { "Content-Type": "application/json" },
        },
      ],
    })

    await expect(client.get("entity/product")).rejects.toThrow("invalid JSON error payload")
  })

  test("request extracts first valid API error from mixed errors array", async () => {
    const { client } = createApiClientTestHarness({
      responses: [
        {
          status: 400,
          body: {
            errors: [{ message: "unknown shape" }, { error: "Second error is valid", code: 999 }],
          },
        },
      ],
    })

    await expect(client.get("entity/product")).rejects.toMatchObject({
      message: "Second error is valid",
      code: 999,
    })
  })

  test("request extracts API error from array payload", async () => {
    const { client } = createApiClientTestHarness({
      responses: [
        {
          status: 400,
          body: [{ errors: [{ error: "Array payload error", code: 321 }] }],
        },
      ],
    })

    await expect(client.get("entity/product")).rejects.toMatchObject({
      message: "Array payload error",
      code: 321,
    })
  })

  test("getAll uses expandLimit when hasExpand is true", async () => {
    const { client } = createApiClientTestHarness({
      batchGetOptions: { limit: 1000, expandLimit: 5, concurrencyLimit: 1 },
    })

    const seen: Array<{ limit: number; offset: number }> = []

    await client.getAll(
      async (limit, offset) => {
        seen.push({ limit, offset })
        return {
          rows: [{ id: `${offset}` }],
          meta: { size: 1 },
          context: { id: "ctx" },
        } as any
      },
      true,
    )

    expect(seen).toEqual([{ limit: 5, offset: 0 }])
  })

  test("getAll returns first page only when size <= limit", async () => {
    const { client } = createApiClientTestHarness({
      batchGetOptions: { limit: 10, expandLimit: 2, concurrencyLimit: 1 },
    })

    const offsets: number[] = []

    const result = await client.getAll(async (limit, offset) => {
      offsets.push(offset)
      return {
        rows: [{ id: 1 }],
        meta: { size: 1 },
        context: { id: "ctx" },
      } as any
    })

    expect(offsets).toEqual([0])
    expect(result.rows).toHaveLength(1)
  })

  test("getAll fetches all pages when size > limit", async () => {
    const { client } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
    })

    const result = await client.getAll(async (limit, offset) => {
      if (offset === 0) {
        return {
          rows: [{ id: 1 }, { id: 2 }],
          meta: { size: 5 },
          context: { id: "ctx" },
        } as any
      }

      if (offset === 2) {
        return {
          rows: [{ id: 3 }, { id: 4 }],
          meta: { size: 5 },
          context: { id: "ctx" },
        } as any
      }

      return {
        rows: [{ id: 5 }],
        meta: { size: 5 },
        context: { id: "ctx" },
      } as any
    })

    expect(result.rows.map((row: any) => row.id)).toEqual([1, 2, 3, 4, 5])
  })

  test("getAllByChunks yields flattened chunk per concurrency batch", async () => {
    const { client } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 2 },
    })

    const chunks: number[] = []

    for await (const chunk of client.getAllByChunks(async (limit, offset) => {
      if (offset === 0) {
        return {
          rows: [{ id: 1 }, { id: 2 }],
          meta: { size: 6 },
          context: { id: "ctx" },
        } as any
      }

      if (offset === 2) {
        return {
          rows: [{ id: 3 }, { id: 4 }],
          meta: { size: 6 },
          context: { id: "ctx" },
        } as any
      }

      return {
        rows: [{ id: 5 }, { id: 6 }],
        meta: { size: 6 },
        context: { id: "ctx" },
      } as any
    })) {
      chunks.push(chunk.rows.length)
    }

    expect(chunks).toEqual([2, 4])
  })

  test("getAll throws when generator yields no chunks", async () => {
    const { client } = createApiClientTestHarness()

    ;(client as any).getAllByChunks = async function* () {
      // no chunks on purpose
    }

    await expect(
      client.getAll(async () => {
        throw new Error("unreachable")
      }),
    ).rejects.toThrow("getAllByChunks returned no chunks")
  })

  test("normalizeUrl removes duplicate slashes", () => {
    expect(ApiClient.normalizeUrl("https://example.com//a///b")).toBe("https:/example.com/a/b")
  })

  test("buildUrl handles string and array inputs", () => {
    const { client } = createApiClientTestHarness()

    expect(client.buildUrl("entity/product/1").toString()).toBe(
      "https://api.moysklad.ru/api/remap/1.2/entity/product/1",
    )

    expect(client.buildUrl(["entity", "product", "1"]).toString()).toBe(
      "https://api.moysklad.ru/api/remap/1.2/entity/product/1",
    )
  })
})
