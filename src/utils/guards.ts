import { IAsyncOperation } from '@netcracker/qubership-apihub-http-spec'
import type { IMarkdownViewerProps } from '@stoplight/markdown-viewer'
import { isArray } from '@stoplight/mosaic'
import { IHttpOperation, IHttpService, INode } from '@stoplight/types'
import { JSONSchema7 } from 'json-schema'
import { isObject, isPlainObject } from 'lodash'

export function isSMDASTRoot(maybeAst: unknown): maybeAst is IMarkdownViewerProps['markdown'] {
  return isObject(maybeAst) && maybeAst['type'] === 'root' && isArray(maybeAst['children'])
}

export function isJSONSchema(maybeSchema: unknown): maybeSchema is JSONSchema7 {
  // the trick is, JSONSchema doesn't define any required properties, so technically even an empty object is a valid JSONSchema
  return isPlainObject(maybeSchema)
}

function isStoplightNode(maybeNode: unknown): maybeNode is INode {
  return isObject(maybeNode) && 'id' in maybeNode
}

export function isHttpService(maybeHttpService: unknown): maybeHttpService is IHttpService {
  return isStoplightNode(maybeHttpService) && 'name' in maybeHttpService && 'version' in maybeHttpService
}

export function isHttpOperation(maybeHttpOperation: unknown): maybeHttpOperation is IHttpOperation {
  return isStoplightNode(maybeHttpOperation) && 'method' in maybeHttpOperation && 'path' in maybeHttpOperation
}

export function isAsyncOperation(maybeAsyncOperation: unknown): maybeAsyncOperation is IAsyncOperation {
  return isStoplightNode(maybeAsyncOperation) && 'message' in maybeAsyncOperation
}

/**
 * Validates URLs for OpenAPI server specifications.
 * Supports both absolute and relative URLs as per OpenAPI 3.0+ specification.
 * 
 * **Allowed formats:**
 * - Absolute URLs: `https://api.example.com`, `http://localhost:3000`
 * - Protocol-relative URLs: `//api.example.com`
 * - Relative paths: `/api/v1`, `../api`, `api/endpoint`
 * - Root paths: `/`
 * - Query-only: `?param=value`
 * - Fragment-only: `#section`
 * - Templated URLs: `https://{server}.example.com/{basePath}`
 * 
 * **Security checks:**
 * - Blocks `javascript:`, `data:`, `vbscript:` schemes (XSS prevention)
 * - Blocks `file:` scheme (local file access prevention)
 * - Trims whitespace and validates non-empty input
 * - Validates URL structure using native URL constructor for absolute URLs
 * 
 * @param url - The URL string to validate
 * @returns `true` if the URL is valid for OpenAPI server usage, `false` otherwise
 */
export function isProperUrl(url: string): boolean {
  // Trim whitespace and check for empty string
  const trimmedUrl = url.trim()
  if (!trimmedUrl) {
    return false
  }

  // Block dangerous schemes (XSS and file access prevention)
  const dangerousSchemes = /^(javascript|data|vbscript|file):/i
  if (dangerousSchemes.test(trimmedUrl)) {
    return false
  }

  // Fast path: relative URLs (most common in OpenAPI)
  // Covers: /path, ../path, path, ?query, #fragment
  if (!trimmedUrl.includes('://') && !trimmedUrl.startsWith('//')) {
    // Allow any relative path, query, or fragment
    // OpenAPI allows templated relative paths like {basePath}/endpoint
    return /^[^<>"|\\^`{}\s]*$/.test(trimmedUrl)
  }

  // Protocol-relative URLs: //example.com
  if (trimmedUrl.startsWith('//')) {
    try {
      // Validate by prepending https: and using URL constructor
      new URL('https:' + trimmedUrl)
      return true
    } catch {
      return false
    }
  }

  // Absolute URLs: validate using URL constructor
  try {
    const parsedUrl = new URL(trimmedUrl)
    
    // Only allow web-safe protocols for absolute URLs
    const allowedProtocols = ['http:', 'https:', 'ws:', 'wss:']
    return allowedProtocols.includes(parsedUrl.protocol)
  } catch {
    return false
  }
}
