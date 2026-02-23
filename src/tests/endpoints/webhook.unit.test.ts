import { describe, expect, test } from "bun:test"

import { WebhookEndpoint } from "../../endpoints/webhook"
import { createApiClientTestHarness, getSearchParamsObject } from "../helpers/api-client-test-harness"

describe("WebhookEndpoint (unit)", () => {
  test("list sends plain GET without query", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new WebhookEndpoint(client)

    await endpoint.list()

    expect(calls[0]?.input).toBe("entity/webhook")
    expect(calls[0]?.options?.method).toBe("GET")
    expect(getSearchParamsObject(calls[0]!)).toEqual({})
  })

  test("all paginates requests", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 3 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }], meta: { size: 3 }, context: { id: "ctx" } },
      ],
    })
    const endpoint = new WebhookEndpoint(client)

    const result = await endpoint.all()

    expect(result.rows).toHaveLength(3)
    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("allChunks yields all chunks", async () => {
    const { client, calls } = createApiClientTestHarness({
      batchGetOptions: { limit: 2, expandLimit: 1, concurrencyLimit: 1 },
      responses: [
        { rows: [{ id: "1" }, { id: "2" }], meta: { size: 4 }, context: { id: "ctx" } },
        { rows: [{ id: "3" }, { id: "4" }], meta: { size: 4 }, context: { id: "ctx" } },
      ],
    })
    const endpoint = new WebhookEndpoint(client)

    const ids: string[] = []
    for await (const chunk of endpoint.allChunks()) {
      ids.push(...chunk.rows.map((row: any) => row.id))
    }

    expect(ids).toEqual(["1", "2", "3", "4"])
    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "2", offset: "0" })
    expect(getSearchParamsObject(calls[1]!)).toEqual({ limit: "2", offset: "2" })
  })

  test("first requests one item", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new WebhookEndpoint(client)

    await endpoint.first()

    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "1" })
  })

  test("first ignores unused options argument", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ rows: [], meta: { size: 0 }, context: {} }] })
    const endpoint = new WebhookEndpoint(client)

    await endpoint.first({ any: true } as any)

    expect(getSearchParamsObject(calls[0]!)).toEqual({ limit: "1" })
  })

  test("byId calls item path", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "wh-1" }] })
    const endpoint = new WebhookEndpoint(client)

    await endpoint.byId("wh-1")

    expect(calls[0]?.input).toBe("entity/webhook/wh-1")
    expect(calls[0]?.options?.method).toBe("GET")
  })

  test("create posts webhook payload", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "wh-1" }] })
    const endpoint = new WebhookEndpoint(client)

    const payload = {
      url: "https://example.com/hook",
      action: "CREATE",
      entityType: "product",
    }

    await endpoint.create(payload as any)

    expect(calls[0]?.input).toBe("entity/webhook")
    expect(calls[0]?.options?.method).toBe("POST")
    expect(calls[0]?.options?.body).toBe(JSON.stringify(payload))
  })

  test("update sends PUT to item path", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{ id: "wh-1" }] })
    const endpoint = new WebhookEndpoint(client)

    const payload = { enabled: true }
    await endpoint.update("wh-1", payload as any)

    expect(calls[0]?.input).toBe("entity/webhook/wh-1")
    expect(calls[0]?.options?.method).toBe("PUT")
    expect(calls[0]?.options?.body).toBe(JSON.stringify(payload))
  })

  test("delete sends DELETE to item path", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [{}] })
    const endpoint = new WebhookEndpoint(client)

    await endpoint.delete("wh-1")

    expect(calls[0]?.input).toBe("entity/webhook/wh-1")
    expect(calls[0]?.options?.method).toBe("DELETE")
  })

  test("batchCreateOrUpdate uses urlId when provided", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [[{ id: "wh-2" }]] })
    const endpoint = new WebhookEndpoint(client)

    const items = [{ url: "https://example.com", action: "CREATE", entityType: "product" }]
    await endpoint.batchCreateOrUpdate(items as any, "custom-id")

    expect(calls[0]?.input).toBe("entity/webhook/custom-id")
    expect(calls[0]?.options?.method).toBe("POST")
    expect(calls[0]?.options?.body).toBe(JSON.stringify(items))
  })

  test("batchCreateOrUpdate derives id from first meta href when urlId absent", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [[{ id: "wh-2" }]] })
    const endpoint = new WebhookEndpoint(client)

    const items = [
      {
        meta: {
          href: "https://api.moysklad.ru/api/remap/1.2/entity/webhook/derived-id",
          type: "webhook",
          mediaType: "application/json",
          metadataHref: "https://api.moysklad.ru/api/remap/1.2/entity/webhook/metadata",
        },
      },
    ]

    await endpoint.batchCreateOrUpdate(items as any)

    expect(calls[0]?.input).toBe("entity/webhook/derived-id")
  })

  test("batchCreateOrUpdate falls back to empty url id when no meta and no explicit id", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [[{ id: "wh-3" }]] })
    const endpoint = new WebhookEndpoint(client)

    await endpoint.batchCreateOrUpdate([{ url: "https://example.com", action: "CREATE", entityType: "product" }] as any)

    expect(calls[0]?.input).toBe("entity/webhook/")
  })

  test("batchDelete posts to /delete", async () => {
    const { client, calls } = createApiClientTestHarness({ responses: [[{ info: "ok" }]] })
    const endpoint = new WebhookEndpoint(client)

    const metaList = [
      {
        meta: {
          href: "https://api.moysklad.ru/api/remap/1.2/entity/webhook/1",
          type: "webhook",
          mediaType: "application/json",
          metadataHref: "https://api.moysklad.ru/api/remap/1.2/entity/webhook/metadata",
        },
      },
    ]

    await endpoint.batchDelete(metaList as any)

    expect(calls[0]?.input).toBe("entity/webhook/delete")
    expect(calls[0]?.options?.method).toBe("POST")
    expect(calls[0]?.options?.body).toBe(JSON.stringify(metaList))
  })
})
