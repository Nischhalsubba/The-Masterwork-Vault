import test from 'node:test'
import assert from 'node:assert/strict'
import { queryPageSpeedField } from '../lib/page-speed-field.mjs'

const response = (status, payload = {}, headers = {}) => new Response(JSON.stringify(payload), {status, headers: {'Content-Type': 'application/json', ...headers}})
const options = { target: 'https://neverwintermastercraft.netlify.app/catalog', strategy: 'mobile', sleep: async () => {}, maxRetries: 1 }

test('HTTP 429 reports rate-limited after bounded retries', async () => {
  let attempts = 0
  const result = await queryPageSpeedField({...options, fetchImpl: async () => { attempts++; return response(429) }})
  assert.equal(attempts, 2)
  assert.equal(result.status, 'rate-limited')
  assert.equal(result.reason, 'API HTTP 429')
  assert.deepEqual(result.metrics, {})
})

test('URL-level field percentiles are separate from origin results', async () => {
  const result = await queryPageSpeedField({...options, fetchImpl: async () => response(200, {
    analysisUTCTimestamp: '2026-10-28T00:00:00Z',
    loadingExperience: {metrics: {LARGEST_CONTENTFUL_PAINT_MS: {percentile: 2400}, INTERACTION_TO_NEXT_PAINT: {percentile: 170}, CUMULATIVE_LAYOUT_SHIFT_SCORE: {percentile: 9}}},
    originLoadingExperience: {metrics: {LARGEST_CONTENTFUL_PAINT_MS: {percentile: 3000}}},
  })})
  assert.equal(result.status, 'field-data')
  assert.equal(result.scope, 'url')
  assert.equal(result.metrics.LARGEST_CONTENTFUL_PAINT_MS, 2400)
  assert.equal(result.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE, 9)
  assert.equal(result.analysisUTCTimestamp, '2026-10-28T00:00:00Z')
})

test('origin fallback is never represented as URL data', async () => {
  const result = await queryPageSpeedField({...options, fetchImpl: async () => response(200, {
    loadingExperience: {metrics: {}, origin_fallback: true},
    originLoadingExperience: {metrics: {INTERACTION_TO_NEXT_PAINT: {percentile: 200}}},
  })})
  assert.equal(result.status, 'field-data')
  assert.equal(result.scope, 'origin')
  assert.equal(result.metrics.INTERACTION_TO_NEXT_PAINT, 200)
})

test('absent public field data is not reported as zero', async () => {
  const result = await queryPageSpeedField({...options, fetchImpl: async () => response(200, {loadingExperience: {metrics: {}}, originLoadingExperience: {metrics: {}}})})
  assert.equal(result.status, 'insufficient-public-field-data')
  assert.deepEqual(result.metrics, {})
})

test('HTTP 403 is access-denied rather than insufficient field data', async () => {
  const result = await queryPageSpeedField({...options, fetchImpl: async () => response(403)})
  assert.equal(result.status, 'access-denied')
})

test('network failures yield unavailable without invented data', async () => {
  const result = await queryPageSpeedField({...options, fetchImpl: async () => {throw Error('network offline')}})
  assert.equal(result.status, 'unavailable')
  assert.deepEqual(result.metrics, {})
})
