/** Identify the external HTTP anchors in generated static guide pages. */
export function extractExternalReferences(html, from) {
  const origin = new URL(from).origin
  const links = new Set()
  for (const match of html.matchAll(/<a\b[^>]*?\bhref=["']([^"']+)["']/gi)) {
    try {
      const url = new URL(match[1], from)
      if (['https:', 'http:'].includes(url.protocol) && url.origin !== origin) {
        url.hash = ''
        links.add(url.href)
      }
    } catch { /* Invalid URL parsing is not a claim about reference validity. */ }
  }
  return [...links]
}
export function classifyReferenceResponse(status, redirected) {
  if (status >= 200 && status < 300) return redirected ? 'redirected' : 'reachable'
  if (status === 429) return 'rate-limited'
  if ([401, 403, 503].includes(status)) return 'blocked-or-access-restricted'
  if ([404, 410].includes(status)) return 'not-found'
  return 'unavailable'
}
