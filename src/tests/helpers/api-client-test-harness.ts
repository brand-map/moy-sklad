import type { KyInstance, KyRequest, Options } from "ky"

import { ApiClient } from "../../api-client"
import type { BatchGetOptions } from "../../types"

export type CapturedRequest = {
  input: string
  options: Options | undefined
}

type ResponseBody = ConstructorParameters<typeof Response>[0]
type ResponseHeaders = NonNullable<ConstructorParameters<typeof Response>[1]>["headers"]

export type MockResponseConfig = {
  status?: number
  headers?: ResponseHeaders
  body?: unknown
  rawBody?: ResponseBody
  delayMs?: number
}

type MockResponseFactory = (request: CapturedRequest, callIndex: number) => MockResponseConfig | unknown

type MockResponse = unknown | MockResponseFactory | MockResponseConfig

function isMockResponseConfig(value: unknown): value is MockResponseConfig {
  if (typeof value !== "object" || value == null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    "status" in candidate
    || "headers" in candidate
    || "body" in candidate
    || "rawBody" in candidate
    || "delayMs" in candidate
  )
}

export function createApiClientTestHarness(options?: {
  responses?: MockResponse[]
  batchGetOptions?: BatchGetOptions
}) {
  const calls: CapturedRequest[] = []
  const responses = options?.responses ?? []

  const fetcher = (async (input: KyRequest, requestOptions?: Options) => {
    let serializedInput: string
    if (typeof input === "string") {
      serializedInput = input
    } else if (typeof input === "object" && input !== null && "url" in input && typeof input.url === "string") {
      serializedInput = input.url
    } else {
      serializedInput = String(input)
    }

    const call: CapturedRequest = {
      input: serializedInput,
      options: requestOptions,
    }

    calls.push(call)

    const responseEntry = responses[calls.length - 1]
    const responseValue = typeof responseEntry === "function" ? responseEntry(call, calls.length - 1) : responseEntry
    let responseConfig: MockResponseConfig
    if (isMockResponseConfig(responseValue)) {
      responseConfig = responseValue
    } else {
      responseConfig = { body: responseValue }
    }

    if (typeof responseConfig.delayMs === "number" && responseConfig.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, responseConfig.delayMs))
    }

    const responseBody: ResponseBody = responseConfig.rawBody ?? JSON.stringify(responseConfig.body ?? {})
    const headers: ResponseHeaders = responseConfig.headers ?? {
      "Content-Type": "application/json",
    }

    return new Response(responseBody, {
      status: responseConfig.status ?? 200,
      headers,
    })
  }) as unknown as KyInstance

  return {
    client: new ApiClient(fetcher, {
      batchGetOptions: options?.batchGetOptions,
    }),
    calls,
  }
}

export function getSearchParams(call: CapturedRequest): URLSearchParams {
  const searchParams = call.options?.searchParams

  if (searchParams instanceof URLSearchParams) {
    return searchParams
  }

  if (typeof searchParams === "string") {
    return new URLSearchParams(searchParams)
  }

  return new URLSearchParams()
}

export function getSearchParamsObject(call: CapturedRequest): Record<string, string> {
  return Object.fromEntries(getSearchParams(call).entries())
}

export function getSerializedBody(call: CapturedRequest): Options["body"] | undefined {
  return call.options?.body
}

export function getJsonBody<T = unknown>(call: CapturedRequest): T {
  const serializedBody = getSerializedBody(call)

  if (typeof serializedBody !== "string") {
    throw new Error("Request body is not a serialized JSON string")
  }

  return JSON.parse(serializedBody) as T
}
