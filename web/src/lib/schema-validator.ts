import type { ResultsOutput } from '@epub-counter/shared'

interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateResultsOutput(data: unknown): data is ResultsOutput {
  const errors: string[] = []

  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push('Root must be an object')
    return false
  }

  const obj = data as Record<string, unknown>

  // Check schemaVersion
  if (!('schemaVersion' in obj) || typeof obj.schemaVersion !== 'string') {
    errors.push('Missing or invalid schemaVersion')
  } else if (obj.schemaVersion !== '1.0') {
    errors.push(`Unsupported schema version: ${obj.schemaVersion}`)
  }

  // Check timestamp
  if (!('timestamp' in obj) || typeof obj.timestamp !== 'string') {
    errors.push('Missing or invalid timestamp')
  }

  // Check options
  if (!('options' in obj) || typeof obj.options !== 'object' || obj.options === null) {
    errors.push('Missing or invalid options')
  } else {
    const options = obj.options as Record<string, unknown>
    if (!('tokenizers' in options) && !('tokenizerList' in options)) {
      // Accept either tokenizers or tokenizerList for flexibility
      errors.push('Missing tokenizers in options')
    }
    if (!('inputPath' in options) && !('path' in options)) {
      // Accept either inputPath or path for flexibility
      errors.push('Missing inputPath in options')
    }
  }

  // Check results
  if (!('results' in obj) || !Array.isArray(obj.results)) {
    errors.push('Missing or invalid results array')
  } else {
    obj.results.forEach((result, index) => {
      if (typeof result !== 'object' || result === null) {
        errors.push(`Result[${index}] must be an object`)
        return
      }
      const r = result as Record<string, unknown>
      if (!('filePath' in r) || typeof r.filePath !== 'string') {
        errors.push(`Result[${index}] missing filePath`)
      }
      if (!('metadata' in r) || typeof r.metadata !== 'object') {
        errors.push(`Result[${index}] missing metadata`)
      }
      if (!('wordCount' in r) || typeof r.wordCount !== 'number') {
        errors.push(`Result[${index}] missing or invalid wordCount`)
      }
      if (!('tokenCounts' in r) || typeof r.tokenCounts !== 'object') {
        errors.push(`Result[${index}] missing tokenCounts`)
      }
    })
  }

  // Check summary
  if (!('summary' in obj) || typeof obj.summary !== 'object' || obj.summary === null) {
    errors.push('Missing or invalid summary')
  } else {
    const summary = obj.summary as Record<string, unknown>
    if (!('total' in summary) || typeof summary.total !== 'number') {
      errors.push('Summary missing or invalid total')
    }
    if (!('success' in summary) || typeof summary.success !== 'number') {
      errors.push('Summary missing or invalid success')
    }
    if (!('failed' in summary) || typeof summary.failed !== 'number') {
      errors.push('Summary missing or invalid failed')
    }
  }

  return errors.length === 0
}

export function validateResultsFile(data: unknown): ValidationResult {
  const errors: string[] = []

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Root must be an object'] }
  }

  const obj = data as Record<string, unknown>

  // Check schemaVersion
  if (!('schemaVersion' in obj) || typeof obj.schemaVersion !== 'string') {
    errors.push('Missing or invalid schemaVersion')
  } else if (obj.schemaVersion !== '1.0') {
    errors.push(`Unsupported schema version: ${obj.schemaVersion}`)
  }

  // Check timestamp
  if (!('timestamp' in obj) || typeof obj.timestamp !== 'string') {
    errors.push('Missing or invalid timestamp')
  }

  // Check options
  if (!('options' in obj) || typeof obj.options !== 'object' || obj.options === null) {
    errors.push('Missing or invalid options')
  } else {
    const options = obj.options as Record<string, unknown>
    if (!('tokenizers' in options) && !('tokenizerList' in options)) {
      // Accept either tokenizers or tokenizerList for flexibility
      errors.push('Missing tokenizers in options')
    }
    if (!('inputPath' in options) && !('path' in options)) {
      // Accept either inputPath or path for flexibility
      errors.push('Missing inputPath in options')
    }
  }

  // Check results
  if (!('results' in obj) || !Array.isArray(obj.results)) {
    errors.push('Missing or invalid results array')
  } else {
    obj.results.forEach((result, index) => {
      if (typeof result !== 'object' || result === null) {
        errors.push(`Result[${index}] must be an object`)
        return
      }
      const r = result as Record<string, unknown>
      if (!('filePath' in r) || typeof r.filePath !== 'string') {
        errors.push(`Result[${index}] missing filePath`)
      }
      if (!('metadata' in r) || typeof r.metadata !== 'object') {
        errors.push(`Result[${index}] missing metadata`)
      }
      if (!('wordCount' in r) || typeof r.wordCount !== 'number') {
        errors.push(`Result[${index}] missing or invalid wordCount`)
      }
      if (!('tokenCounts' in r) || typeof r.tokenCounts !== 'object') {
        errors.push(`Result[${index}] missing tokenCounts`)
      }
    })
  }

  // Check summary
  if (!('summary' in obj) || typeof obj.summary !== 'object' || obj.summary === null) {
    errors.push('Missing or invalid summary')
  } else {
    const summary = obj.summary as Record<string, unknown>
    if (!('total' in summary) || typeof summary.total !== 'number') {
      errors.push('Summary missing or invalid total')
    }
    if (!('success' in summary) || typeof summary.success !== 'number') {
      errors.push('Summary missing or invalid success')
    }
    if (!('failed' in summary) || typeof summary.failed !== 'number') {
      errors.push('Summary missing or invalid failed')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
