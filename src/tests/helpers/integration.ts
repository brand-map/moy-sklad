import { ApiClient, createApiClientFetcher } from "../../api-client"

function getToken(): string {
  const token = process.env.MOYSKLAD_TOKEN

  if (!token) {
    throw new Error("MOYSKLAD_TOKEN is required for integration tests")
  }

  return token
}

export function isIntegrationEnabled(): boolean {
  return process.env.MOYSKLAD_INTEGRATION === "1" && Boolean(process.env.MOYSKLAD_TOKEN)
}

export function isWriteIntegrationEnabled(): boolean {
  return isIntegrationEnabled() && process.env.MOYSKLAD_INTEGRATION_WRITE === "1"
}

export function createIntegrationClient() {
  const baseUrl = process.env.MOYSKLAD_BASE_URL
  const userAgent = process.env.MOYSKLAD_USER_AGENT

  const fetcher = createApiClientFetcher(
    { token: getToken() },
    {
      baseUrl,
      userAgent,
    },
  )

  return new ApiClient(fetcher)
}
