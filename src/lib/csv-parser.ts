export interface ParsedRow {
    [key: string]: string
  }

export function parseCSV(text: string): ParsedRow[] {
    const lines = text.trim().split(/\r?\n/)
        if (lines.length < 2) return []

            const headers = parseCSVLine(lines[0]).map(h =>
                                                           h.trim().toLowerCase()
                                                             .replace(/\s*\*\s*/g, '')
                                                             .replace(/\s+/g, ' ')
                                                         )

            return lines.slice(1)
              .filter(line => line.trim())
              .map(line => {
                      const values = parseCSVLine(line)
                              const row: ParsedRow = {}
                      headers.forEach((header, i) => {
                                row[header] = (values[i] || '').trim()
                        })
                              return row
                })
              .filter(row => Object.values(row).some(v => v))
      }

function parseCSVLine(line: string): string[] {
    const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
              const char = line[i]
                    if (char === '"') {
                            if (inQuotes && line[i + 1] === '"') {
                                      current += '"'
                                                i++
                              } else {
                                      inQuotes = !inQuotes
                              }
                    } else if (char === ',' && !inQuotes) {
                            result.push(current)
                                    current = ''
                      } else {
                            current += char
                      }
        }
    result.push(current)
        return result
  }

export function parseDate(value: string): string | null {
    if (!value) return null
        const str = value.trim()

        // DD/MM/YYYY
        const dmy = str.match(/^(\d{1,2})[\/\-\.]( \d{1,2})[\/\-\.](\d{2,4})$/)
        if (dmy) {
              const [, d, m, y] = dmy
                    const year = y.length === 2 ? `20${y}` : y
                    return `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
          }

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
        return null
  }

export function downloadCSVTemplate(
    headers: string[],
    exampleRow: string[],
    filename: string
    ): void {
  const csvContent = [
    headers.join(','),
    exampleRow.join(','),
  ].join('\n')

                  const blob = new Blob(['\uFEFF' + csvContent], {
                      type: 'text/csv;charset=utf-8;'
                        })

                          const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                              a.href = url
                                a.download = filename
                                  a.click()
                                    URL.revokeObjectURL(url)
                                    }
