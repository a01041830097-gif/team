const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
}

export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-zA-Z#0-9]+;/g, (m) => ENTITY_MAP[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}

const SAFE_ATTRS: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
}

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'a', 'img', 'hr',
])

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (_match, close, tag, attrs) => {
      const lower = tag.toLowerCase()
      if (!ALLOWED_TAGS.has(lower)) return ''
      if (close) return `</${lower}>`
      const allowed = SAFE_ATTRS[lower] ?? []
      const safeAttrs = allowed
        .map((attr) => {
          const m = attrs.match(new RegExp(`${attr}="([^"]*)"`, 'i'))
          if (!m) return null
          const val = lower === 'a' && attr === 'href'
            ? m[1].replace(/^javascript:/i, '')
            : m[1]
          return `${attr}="${val}"`
        })
        .filter(Boolean)
        .join(' ')
      const extras = lower === 'a' ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<${lower}${safeAttrs ? ` ${safeAttrs}` : ''}${extras}>`
    })
}
