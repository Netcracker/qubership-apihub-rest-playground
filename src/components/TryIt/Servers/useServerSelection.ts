import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import type { IServer } from '../../../utils/http-spec/IServer'
import { chosenServerUrlAtom } from '../chosenServer'

/**
 * Custom hook for managing server selection state with automatic fallback logic.
 *
 * Features:
 * - Persists selected server URL in global state
 * - Automatically falls back to first available server when current selection becomes invalid
 * - Handles edge cases like empty server lists and removed servers
 *
 * @param availableServers - Array of available servers to choose from
 * @returns Object containing the currently selected server and selection function
 */
export const useServerSelection = (availableServers: IServer[]) => {
  const [chosenServerUrl, setChosenServerUrl] = useAtom(chosenServerUrlAtom)

  // Memoize expensive calculations
  const fallbackServer = useMemo(() => availableServers[0] ?? null, [availableServers])
  
  const chosenServer = useMemo(() => 
    availableServers.find(server => server.url === chosenServerUrl) ?? null,
    [availableServers, chosenServerUrl],
  )

  // Memoize validation states to prevent unnecessary re-calculations
  const validationState = useMemo(() => {
    const hasValidSelection = Boolean(chosenServerUrl && chosenServer)
    const hasFallbackAvailable = Boolean(fallbackServer?.url)
    
    return {
      hasValidSelection,
      hasFallbackAvailable,
      shouldApplyFallback: !hasValidSelection && hasFallbackAvailable,
      shouldClearSelection: !hasFallbackAvailable && Boolean(chosenServerUrl),
    }
  }, [chosenServerUrl, chosenServer, fallbackServer])

  // Optimized fallback logic with reduced re-renders
  useEffect(() => {
    const { hasValidSelection, hasFallbackAvailable, shouldApplyFallback, shouldClearSelection } = validationState

    // Only log when necessary (not on every render)
    if (shouldApplyFallback || shouldClearSelection) {
      console.log('🔄 useServerSelection fallback check:', {
        chosenServerUrl,
        chosenServer: chosenServer?.url,
        hasValidSelection,
        hasFallbackAvailable,
        fallbackServerUrl: fallbackServer?.url,
        availableServersCount: availableServers.length,
        action: shouldApplyFallback ? 'applying-fallback' : 'clearing-selection',
      })
    }

    if (shouldApplyFallback) {
      console.log('🔄 Applying fallback to:', fallbackServer!.url)
      setChosenServerUrl(fallbackServer!.url)
      return
    }

    if (shouldClearSelection) {
      console.log('🔄 Clearing selection - no servers available')
      setChosenServerUrl('')
    }
  }, [validationState, chosenServerUrl, chosenServer, fallbackServer, setChosenServerUrl, availableServers.length])

  /**
   * Manually select a server by URL
   * @param url - Server URL to select, or empty string to clear selection
   */
  const selectServer = useCallback((url: string) => {
    // Only log and update if the URL actually changed
    if (url !== chosenServerUrl) {
      console.log('🎯 selectServer called with:', {
        url,
        previousUrl: chosenServerUrl,
        serverExists: availableServers.some(s => s.url === url),
      })
      setChosenServerUrl(url)
    }
  }, [chosenServerUrl, availableServers, setChosenServerUrl])

  return {
    chosenServer,
    selectServer,
  }
}
