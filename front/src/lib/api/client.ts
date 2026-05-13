import type { ApiErrorResponse } from '@/src/lib/api/types'

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  retries?: number
  retryDelayMs?: number
  timeoutMs?: number
}

const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY_MS = 600
const DEFAULT_TIMEOUT_MS = 10000

function getApiBaseUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
  if (explicitUrl) {
    return explicitUrl
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://127.0.0.1:8000'
  }

  return ''
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryable(status: number) {
  return status >= 500 || status === 429
}

export class ApiError extends Error {
  code?: string
  details?: unknown
  status: number

  constructor(status: number, payload: ApiErrorResponse) {
    super(payload.message)
    this.name = 'ApiError'
    this.status = status
    this.code = payload.code
    this.details = payload.details
  }
}

export async function apiRequest<T>(
  endpoint: string,
  {
    body,
    headers,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...init
  }: ApiRequestOptions = {}
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint}`

  try {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(url, {
          ...init,
          body: body === undefined ? undefined : JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          let payload: ApiErrorResponse = { message: `Request failed with status ${response.status}` }

          try {
            payload = (await response.json()) as ApiErrorResponse
          } catch {
            payload = { message: response.statusText || payload.message }
          }

          if (attempt < retries && isRetryable(response.status)) {
            await sleep(retryDelayMs * (attempt + 1))
            continue
          }

          throw new ApiError(response.status, payload)
        }

        if (response.status === 204) {
          return undefined as T
        }

        return (await response.json()) as T
      } catch (error) {
        if (attempt >= retries || error instanceof ApiError) {
          throw error
        }

        await sleep(retryDelayMs * (attempt + 1))
      }
    }

    throw new Error('Unexpected API request flow')
  } finally {
    clearTimeout(timeout)
  }
}
