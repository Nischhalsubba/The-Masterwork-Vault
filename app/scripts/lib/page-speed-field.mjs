/** Retrieve CrUX field percentiles through PageSpeed Insights without inventing data. */
const METRICS = [
  'LARGEST_CONTENTFUL_PAINT_MS',
  'INTERACTION_TO_NEXT_PAINT',
  'CUMULATIVE_LAYOUT_SHIFT_SCORE',
  'FIRST_CONTENTFUL_PAINT_MS',
  'EXPERIMENTAL_TIME_TO_FIRST_BYTE',
]
const fieldMetrics = (entry) => entry?.metrics && Object.keys(entry.metrics).length ? entry.metrics : null

export async function queryPageSpeedField({
  target, strategy, fetchImpl = fetch,
  sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration)),
  maxRetries = 1, apiKey, timeoutMs = 30000,
} = {}) {
  if (!['mobile', 'desktop'].includes(strategy)) throw Error('Expected mobile or desktop strategy')
  const base = {url: target, strategy, source: 'CrUX/PageSpeed Insights', status: 'unavailable', metrics: {}}
  const params = new URLSearchParams({url: target, strategy, category: 'performance'})
  if (apiKey) params.set('key', apiKey)
  const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?' + params
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchImpl(endpoint, {signal: AbortSignal.timeout(timeoutMs)})
      if (!response.ok) {
        const status = response.status === 429 ? 'rate-limited' : [401, 403].includes(response.status) ? 'access-denied' : 'unavailable'
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const retryAfter = Number(response.headers?.get?.('retry-after'))
          const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1)
          await sleep(Math.min(delay, 4000))
          continue
        }
        return {...base, status, reason: 'API HTTP ' + response.status}
      }
      const data = await response.json()
      const urlMetrics = data.loadingExperience?.origin_fallback ? null : fieldMetrics(data.loadingExperience)
      const originMetrics = fieldMetrics(data.originLoadingExperience)
      const selected = urlMetrics || originMetrics
      if (!selected) return {...base, status: 'insufficient-public-field-data'}
      return {
        ...base, status: 'field-data', scope: urlMetrics ? 'url' : 'origin',
        analysisUTCTimestamp: data.analysisUTCTimestamp || null,
        metricUnits: {
          LARGEST_CONTENTFUL_PAINT_MS: 'ms',
          INTERACTION_TO_NEXT_PAINT: 'ms',
          CUMULATIVE_LAYOUT_SHIFT_SCORE: 'PSI percentile units (score × 100)',
          FIRST_CONTENTFUL_PAINT_MS: 'ms',
          EXPERIMENTAL_TIME_TO_FIRST_BYTE: 'ms',
        },
        metrics: Object.fromEntries(METRICS.map(metric => [metric, selected[metric]?.percentile ?? null])),
      }
    } catch (error) {
      if (attempt < maxRetries) {
        await sleep(1000 * (attempt + 1))
        continue
      }
      return {...base, status: 'unavailable', reason: error?.name === 'TimeoutError' ? 'Request timed out' : 'Request failed: ' + String(error?.message || error).slice(0, 120)}
    }
  }
  return base
}
