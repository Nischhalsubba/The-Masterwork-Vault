import test from 'node:test'
import assert from 'node:assert/strict'
import {extractExternalReferences, classifyReferenceResponse} from '../lib/reference-audit.mjs'
const origin = 'https://neverwintermastercraft.netlify.app'

test('source extraction ignores internal navigation, fragments, mail, and images', () => {
  const html = `<a href="https://example.com/source">Source</a><a href='/guides/'>Guide</a><a href='mailto:a@b.test'>Mail</a><a href='#main'>Skip</a><img src='https://other.com/image.webp'><a href='https://example.com/source'>Repeat</a>`
  assert.deepEqual(extractExternalReferences(html, origin + '/guides/materials/example/'), ['https://example.com/source'])
})

test('reference HTTP statuses distinguish reachable and inconclusive responses', () => {
  assert.equal(classifyReferenceResponse(200, false), 'reachable')
  assert.equal(classifyReferenceResponse(200, true), 'redirected')
  assert.equal(classifyReferenceResponse(403, false), 'blocked-or-access-restricted')
  assert.equal(classifyReferenceResponse(429, false), 'rate-limited')
  assert.equal(classifyReferenceResponse(404, false), 'not-found')
  assert.equal(classifyReferenceResponse(503, false), 'blocked-or-access-restricted')
})
