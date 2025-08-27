import { Dictionary, INodeVariable } from '@stoplight/types'
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
export const useProcessedSpecServers = (specServers: IServer[] | undefined, withRelativeUrls = false): IServer[] => {
  useRecalculationLogger('useProcessedSpecServers', [specServers])

  return useMemo(() => {

    if (isEmpty(specServers)) {
      return []
    }
    console.log(`📋 Spec servers: Processing ${specServers!.length} servers`)

    const validServers = filterValidServers(specServers!)
    const filteredServers = withRelativeUrls ? specServers! : specServers!.filter(server => isAbsoluteURL(server.url))
    const expandedServers = expandSpecServersWithEnumVariables(filteredServers)
    const processedServers = processServers(expandedServers)

    console.log(`📋 Spec servers: Result ${validServers.length} servers`)
    return processedServers
  }, [specServers, withRelativeUrls])
}

/**
 * Hook for processing custom servers.
 * Includes normalization and security filtering.
 * Only recalculates when custom servers change.
 */
export const useProcessedCustomServers = (customServers: IServer[] | undefined): IServer[] => {
  useRecalculationLogger('useProcessedCustomServers', [customServers])

  return useMemo(() => {

    if (isEmpty(customServers)) {
      return []
    }
    console.log(`🔧 Custom servers: Processing ${customServers!.length} servers`)

    const validServers = filterValidServers(customServers!)
    const processedServers = processServers(validServers, true)

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
 * Checks if a URL is an absolute HTTP/HTTPS URL.
 * Only allows secure web protocols suitable for API servers.
 *
 * @param url - The URL string to validate
 * @returns `true` if the URL is an absolute HTTP/HTTPS URL, `false` otherwise
 */
function isAbsoluteURL(url: string): boolean {
  const trimmedUrl = url.trim()
  return /^https?:\/\//i.test(trimmedUrl)
}

/**
 * Expands servers that have enum variables into multiple server entries.
 * Each combination of enum values creates a separate server entry.
 *
 * @param specServers - Array of servers from OpenAPI specification
 * @returns Array of expanded servers with all enum variable combinations
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
  variables: Dictionary<INodeVariable, string>,
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
 * Normalizes URLs, adds default descriptions, and sets proxy endpoint usage.
 *
 * @param servers - Array of servers to process
 * @param isCustom - Whether these are custom servers (default: false)
 * @returns Processed servers ready for display with normalized URLs and descriptions
 */
function processServers(servers: IServer[], isCustom = false): IServer[] {
  return servers.map((server) => {
    return {
      ...server,
      url: removeTrailingSlash(isCustom ? server.url : getServerUrlWithDefaultValues(server)).toLowerCase(),
      description: server.description || '-',
      custom: isCustom,
      shouldUseProxyEndpoint: isCustom ? server.shouldUseProxyEndpoint : true,
    }
  })
}

/**
 * Replaces variable placeholders in server URL with their default values.
 *
 * @param server - Server object containing URL and variable definitions
 * @returns Normalized URL with default values substituted
 */
function getServerUrlWithDefaultValues(server: IServer): string {
  const defaultValues = Object.fromEntries(
    Object.entries(server.variables ?? {}).map(([key, variable]) => [key, variable.default ?? '']),
  )

  if (isEmpty(defaultValues)) {
    return server.url
  }

  return replacePlaceholders(server.url, defaultValues)
}

function removeTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

/**
 * Filters servers to only include those with valid URLs.
 * This function helps protect against malicious URLs by filtering out null/empty URLs
 * and using isProperUrl which validates URL format and prevents dangerous schemes.
 *
 * @param servers - Array of servers to validate
 * @returns Array of servers with valid URLs only
 */
function filterValidServers(servers: IServer[]): IServer[] {
  return servers.filter(isValidServer)
}

/**
 * Type guard to check if a server has a valid URL.
 *
 * @param server - Server object to validate
 * @returns `true` if server has a non-null, properly formatted URL
 */
function isValidServer(server: IServer): server is IServer {
  return server.url !== null && isProperUrl(server.url)
}
