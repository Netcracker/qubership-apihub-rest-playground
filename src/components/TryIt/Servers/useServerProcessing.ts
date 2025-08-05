import { isEmpty } from 'lodash'
import { useMemo } from 'react'

import { useRecalculationLogger } from '../../../hooks/usePerformanceLogger'
import { isProperUrl } from '../../../utils/guards'
import { IServer } from '../../../utils/http-spec/IServer'
import { replacePlaceholders } from '../../../utils/string'

/**
 * Hook for processing servers from OpenAPI specification.
 * Includes normalization and security filtering.
 * Only recalculates when spec servers change.
 */
export const useProcessedSpecServers = (specServers: IServer[] | undefined): IServer[] => {
  useRecalculationLogger('useProcessedSpecServers', [specServers])

  if (isEmpty(specServers)) {
    return []
  }

  return useMemo(() => {
    console.log(`📋 Spec servers: Processing ${specServers!.length} servers`)
    const absoluteServers = specServers!.filter(server => isAbsoluteURL(server.url))
    const expandedServers = expandSpecServersWithEnumVariables(absoluteServers)
    const processedServers = processServers(expandedServers)
    const validServers = filterValidServers(processedServers)
    console.log(`📋 Spec servers: Result ${validServers.length} servers`)
    return validServers
  }, [specServers])
}

/**
 * Hook for processing custom servers.
 * Includes normalization but no security filtering (custom servers are trusted).
 * Only recalculates when custom servers change.
 */
export const useProcessedCustomServers = (customServers: IServer[] | undefined): IServer[] => {
  useRecalculationLogger('useProcessedCustomServers', [customServers])

  if (isEmpty(customServers)) {
    return []
  }

  return useMemo(() => {
    console.log(`🔧 Custom servers: Processing ${customServers!.length} servers`)

    const processedServers = processServers(customServers!, true)

    console.log(`🔧 Custom servers: Result ${processedServers.length} servers`)
    return processedServers
  }, [customServers])
}

/**
 * Hook for combining processed servers and adding mock server.
 */
export const useCombinedServers = (
  processedSpecServers: IServer[],
  processedCustomServers: IServer[],
  mockUrl?: string,
): IServer[] => {
  useRecalculationLogger('useCombinedServers', [processedSpecServers, processedCustomServers, mockUrl])

  return useMemo(() => {
    const combinedServers = processedCustomServers.length > 0
      ? [...processedSpecServers, ...processedCustomServers]
      : processedSpecServers

    const finalServers = [...combinedServers]

    if (mockUrl) {
      finalServers.push({
        description: 'Mock Server',
        url: mockUrl,
      })
    }

    console.log(`📋 Final servers: ${finalServers.length} total`)
    return finalServers
  }, [processedSpecServers, processedCustomServers, mockUrl])
}

// Helper functions

/**
 * Checks if a URL is absolute (contains protocol or starts with //
 */
function isAbsoluteURL(url: string): boolean {
  return url.indexOf('://') > 0 || url.startsWith('//')
}

/**
 * Expands servers that have enum variables into multiple server entries
 * Each combination of enum values creates a separate server entry
 */
function expandSpecServersWithEnumVariables(specServers: IServer[]): IServer[] {
  return specServers?.flatMap(specServer => {
    if (specServer?.variables) {
      const formattedUrls = generateUrlCombinationsFromEnumVariables(specServer.url, specServer.variables)
      return formattedUrls.map(formattedUrl => ({
        ...specServer,
        url: formattedUrl,
      }))
    }
    return [specServer]
  }) ?? []
}

/**
 * Generates all possible URL combinations from enum variables
 * @param url - Template URL with variable placeholders (e.g., 'https://{env}.{region}.api.com')
 * @param variables - Object containing variable definitions with enum values
 * @returns Array of URLs with all possible variable combinations
 */
function generateUrlCombinationsFromEnumVariables(
  url: string,
  variables: Record<string, { enum?: string[]; default?: string }>,
): string[] {
  const enumVariables = Object.entries(variables || {})
    .filter(([_, variable]) => Array.isArray(variable.enum))
    .map(([key, variable]) => ({ key, values: variable.enum! }))

  if (isEmpty(enumVariables)) {
    return [url]
  }

  const combinations = enumVariables.reduce<{ [key: string]: string }[]>((acc, { key, values }) => {
    return acc.flatMap(combination => values.map(value => ({ ...combination, [key]: value })))
  }, [{}])

  return combinations.map(combination => replacePlaceholders(url, combination))
}

/**
 * Normalizes URLs, adds default descriptions, and sets using proxy endpoint.
 * @param servers - Array of servers to process
 * @param isCustom - Whether these are custom servers (default: false)
 * @returns Processed servers ready for display
 */
function processServers(servers: IServer[], isCustom = false): IServer[] {
  return servers.map((server) => {
    return {
      ...server,
      url: isCustom ? removeTrailingSlash(server.url) : getServerUrlWithDefaultValues(server),
      description: server.description || '-',
      custom: isCustom,
      shouldUseProxyEndpoint: server.shouldUseProxyEndpoint || true,
    }
  })
}

/**
 * Replaces variable placeholders in server URL with their default values and normalize URL
 */
function getServerUrlWithDefaultValues(server: IServer): string {
  const defaultValues = Object.fromEntries(
    Object.entries(server.variables ?? {}).map(([key, variable]) => [key, variable.default ?? '']),
  )

  if (isEmpty(defaultValues)) {
    return server.url
  }

  const urlWithDefaults = replacePlaceholders(server.url, defaultValues)

  return removeTrailingSlash(urlWithDefaults)
}

function removeTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

/**
 * Filters servers to only include those with valid URLs.
 * This function helps protect against malicious URLs by:
 * - Filtering out null/empty URLs
 * - Using isProperUrl which validates URL format and prevents:
 *   * javascript: protocol injection
 *   * data: URLs with malicious content
 *   * file: URLs
 *   * malformed URLs that could bypass security checks
 */
function filterValidServers(servers: IServer[]): IServer[] {
  return servers.filter(isValidServer)
}

/**
 * Type guard to check if a server has a valid URL
 */
function isValidServer(server: IServer): server is IServer {
  return server.url !== null && isProperUrl(server.url)
}
