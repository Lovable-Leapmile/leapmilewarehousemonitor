const DEFAULT_RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export type RetryOptions = {
  attempts?: number;
  timeoutMs?: number;
  retryDelaysMs?: number[];
  fetchFn?: typeof fetch;
  sleepFn?: (milliseconds: number) => Promise<void>;
};

export class UpstreamUnavailableError extends Error {
  constructor() {
    super("Order service temporarily unavailable");
    this.name = "UpstreamUnavailableError";
  }
}

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/** Retry only transport failures and temporary upstream statuses. */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: RetryOptions = {},
): Promise<Response> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const timeoutMs = options.timeoutMs ?? 4_000;
  const retryDelaysMs = options.retryDelaysMs ?? [150, 350];
  const fetchFn = options.fetchFn ?? fetch;
  const sleepFn = options.sleepFn ?? sleep;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchFn(url, { ...init, signal: controller.signal });
      const retryable = DEFAULT_RETRYABLE_STATUSES.has(response.status);

      if (!retryable) return response;
      if (attempt === attempts - 1) throw new UpstreamUnavailableError();

      await response.body?.cancel().catch(() => undefined);
    } catch (error) {
      if (error instanceof UpstreamUnavailableError) throw error;
      if (attempt === attempts - 1) throw new UpstreamUnavailableError();
    } finally {
      clearTimeout(timeout);
    }

    await sleepFn(retryDelaysMs[attempt] ?? retryDelaysMs.at(-1) ?? 0);
  }

  throw new UpstreamUnavailableError();
}