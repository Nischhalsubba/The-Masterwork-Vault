import { PLAYER_STATE_KEY, normalizePlayerState } from './playerState'

export const PORTABLE_STATE_TYPE = 'masterwork-vault-portable-state'
export const PORTABLE_STATE_VERSION = 1
const PREFIX = 'masterwork-vault.'
const MAX_ENTRY_BYTES = 2_000_000
const MAX_TOTAL_BYTES = 8_000_000

export interface PortableVaultState {
  type: typeof PORTABLE_STATE_TYPE
  schemaVersion: typeof PORTABLE_STATE_VERSION
  exportedAt: string
  entries: Record<string, string>
}

export function collectPortableVaultState(storage: Storage = window.localStorage): PortableVaultState {
  const entries: Record<string, string> = {}
  let total = 0
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (!key?.startsWith(PREFIX)) continue
    const value = storage.getItem(key)
    if (value == null) continue
    const size = new Blob([value]).size
    if (size > MAX_ENTRY_BYTES || total + size > MAX_TOTAL_BYTES) continue
    entries[key] = value
    total += size
  }
  return { type: PORTABLE_STATE_TYPE, schemaVersion: PORTABLE_STATE_VERSION, exportedAt: new Date().toISOString(), entries }
}

export function serializePortableVaultState(storage: Storage = window.localStorage) {
  return JSON.stringify(collectPortableVaultState(storage), null, 2)
}

export function importPortableVaultState(text: string, storage: Storage = window.localStorage) {
  const parsed = JSON.parse(text) as unknown
  if (!parsed || typeof parsed !== 'object') throw new Error('The selected file is not a Masterwork Vault state bundle.')
  const envelope = parsed as Partial<PortableVaultState>
  if (envelope.type !== PORTABLE_STATE_TYPE || envelope.schemaVersion !== PORTABLE_STATE_VERSION || !envelope.entries || typeof envelope.entries !== 'object') {
    throw new Error('Unsupported Masterwork Vault state bundle.')
  }

  const entries = Object.entries(envelope.entries)
  let total = 0
  const safe: Array<[string, string]> = []
  for (const [key, value] of entries) {
    if (!key.startsWith(PREFIX) || typeof value !== 'string') continue
    const size = new Blob([value]).size
    total += size
    if (size > MAX_ENTRY_BYTES || total > MAX_TOTAL_BYTES) throw new Error('State bundle exceeds the safe import size.')
    safe.push([key, value])
  }

  for (const [key, value] of safe) {
    if (key === PLAYER_STATE_KEY) {
      const normalized = normalizePlayerState(JSON.parse(value))
      storage.setItem(key, JSON.stringify(normalized))
    } else {
      storage.setItem(key, value)
    }
  }
  return safe.length
}
