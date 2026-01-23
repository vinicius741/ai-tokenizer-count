/**
 * Results Schema Validator
 *
 * Provides validation for ResultsOutput data structure without requiring
 * external validation libraries. Validates the schema structure and required
 * fields for results.json files uploaded via the API.
 *
 * @module lib/schema-validator
 */

import type { ResultsOutput } from '@epub-counter/shared';

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the data is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
}

/**
 * Validate ResultsOutput structure
 *
 * Validates that the provided data conforms to the ResultsOutput schema
 * by checking for required fields and correct types. Returns detailed
 * error messages for any validation failures.
 *
 * @param data - Unknown data to validate against ResultsOutput schema
 * @returns Validation result with validity flag and error messages
 *
 * @example
 * ```ts
 * const result = validateResultsOutput(request.body);
 * if (!result.valid) {
 *   return reply.status(400).send({
 *     error: { code: 'INVALID_SCHEMA', details: result.errors }
 *   });
 * }
 * ```
 */
export function validateResultsOutput(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if data is object
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Input must be an object'] };
  }

  const obj = data as Record<string, unknown>;

  // Validate schema_version
  if (typeof obj.schemaVersion !== 'string') {
    errors.push('Missing or invalid schema_version (must be string)');
  }

  // Validate timestamp
  if (typeof obj.timestamp !== 'string') {
    errors.push('Missing or invalid timestamp (must be ISO string)');
  }

  // Validate options
  if (typeof obj.options !== 'object' || obj.options === null) {
    errors.push('Missing or invalid options (must be object)');
  } else {
    const opts = obj.options as Record<string, unknown>;
    if (!Array.isArray(opts.tokenizers)) {
      errors.push('options.tokenizers must be an array');
    }
    if (opts.maxMb !== undefined && typeof opts.maxMb !== 'number') {
      errors.push('options.maxMb must be a number');
    }
  }

  // Validate results array
  if (!Array.isArray(obj.results)) {
    errors.push('Missing or invalid results (must be array)');
  }

  // Validate summary object
  if (typeof obj.summary !== 'object' || obj.summary === null) {
    errors.push('Missing or invalid summary (must be object)');
  } else {
    const summary = obj.summary as Record<string, unknown>;
    if (typeof summary.total !== 'number') {
      errors.push('summary.total must be a number');
    }
    if (typeof summary.success !== 'number') {
      errors.push('summary.success must be a number');
    }
    if (typeof summary.failed !== 'number') {
      errors.push('summary.failed must be a number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Type guard to check if data is a valid ResultsOutput
 *
 * Use this to narrow the type of unknown data to ResultsOutput.
 *
 * @param data - Unknown data to check
 * @returns True if data conforms to ResultsOutput schema
 *
 * @example
 * ```ts
 * if (isResultsOutput(data)) {
 *   // TypeScript now knows data is ResultsOutput
 *   console.log(data.summary);
 * }
 * ```
 */
export function isResultsOutput(data: unknown): data is ResultsOutput {
  return validateResultsOutput(data).valid;
}
