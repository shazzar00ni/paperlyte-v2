export interface Note {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

export function extractTitle(content: string): string {
  const firstLine = content.split('\n')[0].trim()
  // Strip leading markdown heading markers
  const cleaned = firstLine.replace(/^#{1,6}\s+/, '')
  return cleaned || 'Untitled'
}

export function extractPreview(content: string): string {
  const lines = content.split('\n')
  // Skip the first line (title) and find the first non-empty line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line) return line.slice(0, 120)
  }
  return ''
}

export function createEmptyNote(): Note {
  return {
    id: crypto.randomUUID(),
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
