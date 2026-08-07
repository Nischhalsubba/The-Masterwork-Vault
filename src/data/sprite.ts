import spriteBase64 from './sprite.b64?raw'

const cleaned = spriteBase64.replace(/\s+/g, '')
const binary = atob(cleaned)
const bytes = new Uint8Array(binary.length)

for (let index = 0; index < binary.length; index += 1) {
  bytes[index] = binary.charCodeAt(index)
}

// Use a Blob URL instead of a large data: URL. Samsung Browser and some
// mobile Chromium builds can fail to decode large inline WebP data URLs even
// though the same WebP bytes are valid. A Blob URL follows the normal image
// decoding path and keeps the verified extracted atlas intact.
const spriteObjectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }))

export default spriteObjectUrl
