import { useAtom } from 'jotai'
import { useEffect } from 'react'

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

  const fallbackServer = availableServers[0] ?? null

  // Find the currently selected server object based on the stored URL
  const chosenServer = availableServers.find(server => server.url === chosenServerUrl) ?? null

  // Automatic fallback logic when selection becomes invalid
  useEffect(() => {
    const hasValidSelection = chosenServerUrl && chosenServer
    const hasFallbackAvailable = fallbackServer?.url

    console.log('🔄 useServerSelection fallback check:', {
      chosenServerUrl,
      chosenServer: chosenServer?.url,
      hasValidSelection,
      hasFallbackAvailable,
      fallbackServerUrl: fallbackServer?.url,
      availableServersCount: availableServers.length,
    })

    // Apply fallback when:
    // 1. No server is currently selected, OR
    // 2. Selected server is no longer available in the list
    if (!hasValidSelection && hasFallbackAvailable) {
      console.log('🔄 Applying fallback to:', fallbackServer.url)
      setChosenServerUrl(fallbackServer.url)
      return
    }

    // Clear selection if no servers are available
    if (!hasFallbackAvailable && chosenServerUrl) {
      console.log('🔄 Clearing selection - no servers available')
      setChosenServerUrl('')
    }
  }, [chosenServerUrl, chosenServer, fallbackServer, setChosenServerUrl, availableServers.length])

  /**
   * Manually select a server by URL
   * @param url - Server URL to select, or empty string to clear selection
   */
  const selectServer = (url: string) => {
    console.log('🎯 selectServer called with:', {
      url,
      previousUrl: chosenServerUrl,
      serverExists: availableServers.some(s => s.url === url),
    })
    setChosenServerUrl(url)
  }

  return {
    chosenServer,
    selectServer,
  }
}
