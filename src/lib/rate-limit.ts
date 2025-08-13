type RateKey = string

interface Bucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<RateKey, Bucket>()

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for') || headers.get('x-real-ip')
  if (xff) return xff.split(',')[0].trim()
  return 'unknown'
}

export function rateLimit(
  key: RateKey,
  {
    capacity = 20,
    refillPerMs = 60_000, // 1 token per minute by default when capacity=1
  }: { capacity?: number; refillPerMs?: number } = {}
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const bucket = buckets.get(key) ?? { tokens: capacity, lastRefill: now }

  // Refill
  const elapsed = now - bucket.lastRefill
  if (elapsed > 0) {
    const tokensToAdd = Math.floor(elapsed / refillPerMs)
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd)
      bucket.lastRefill = now
    }
  }

  const allowed = bucket.tokens > 0
  if (allowed) bucket.tokens -= 1

  buckets.set(key, bucket)
  return { allowed, remaining: bucket.tokens }
}


