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

    // Apply fallback when:
    // 1. No server is currently selected, OR
    // 2. Selected server is no longer available in the list
    if (!hasValidSelection && hasFallbackAvailable) {
      setChosenServerUrl(fallbackServer.url)
    }

    // Clear selection if no servers are available
    if (!hasFallbackAvailable && chosenServerUrl) {
      setChosenServerUrl('')
    }
  }, [chosenServerUrl, chosenServer, fallbackServer, setChosenServerUrl])

  /**
   * Manually select a server from the available list
   * @param server - Server to select, or null to clear selection
   */
  const selectServer = (server: IServer | null) => {
    setChosenServerUrl(server?.url || '')
  }

  return {
    chosenServer,
    selectServer,
  }
}
