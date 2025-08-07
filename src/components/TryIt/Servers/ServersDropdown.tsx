import AddIcon from '@mui/icons-material/Add'
import { Button, MenuItem } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { useAtom } from 'jotai'
import React, { useCallback, useState } from 'react'

import { DeleteIcon } from '../../../icons/DeleteIcon'
import type { IServer } from '../../../utils/http-spec/IServer'
import { ButtonWithHint } from '../../ButtonWithHint'
import { createCustomServer, deleteCustomServer } from '../../events'
import { chosenServerAtom } from '../chosenServer'
import { MenuItemContent } from '../MenuItemContent'

const MENU_ITEM_MAX_WIDTH = 400

const STYLE_MENU_ITEM = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover .MuiButtonBase-root': {
    visibility: 'visible',
  },
}

export type ServersDropdownProps = {
  servers: IServer[]
}

export const ServersDropdown = ({ servers }: ServersDropdownProps) => {
  const [chosenServer, setChosenServer] = useAtom(chosenServerAtom)

  const defaultValue = servers[0]?.url ?? ''

  const [open, setOpen] = useState(false)

  const handleServerChange = useCallback(
    (event) => {
      const server = servers.find(server => server.url === event.target.value)
      setChosenServer(server)
    },
    [servers, setChosenServer],
  )

  const handleServerAdd = useCallback(() => {
    setOpen(false)
    document.dispatchEvent(createCustomServer)
  }, [])

  const handleServerDelete = useCallback((server: IServer) => (event: React.MouseEvent) => {
    event.stopPropagation()
    if (server.custom) {
      setOpen(false)
      document.dispatchEvent(deleteCustomServer({ url: server.url }))
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
  }
  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <FormControl size="small" fullWidth>
      <Select
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        onChange={handleServerChange}
        value={chosenServer?.url ?? ''}
        defaultValue={defaultValue}
        renderValue={p => p}
        // TODO: review styles
        inputProps={{ sx: { py: '1px', fontWeight: 500, fontSize: 12, lineHeght: '16px', color: '#000000' } }}
        aria-label="Server"
        data-testid="ServerSelect"
      >
        {servers.map((server, index) => {
          const { url, description, custom } = server
          return (
            <MenuItem
              key={server.url}
              value={server.url}
              selected={index === servers.indexOf(chosenServer!)}
              sx={STYLE_MENU_ITEM}
            >
              <MenuItemContent title={url} subtitle={description} maxWidth={MENU_ITEM_MAX_WIDTH} />

              <ButtonWithHint
                startIcon={<DeleteIcon fontSize="small" />}
                sx={{ visibility: 'hidden' }}
                onClick={handleServerDelete(server)}
                disabled={!custom}
                hint={!custom ? 'Server from API specification cannot be deleted' : undefined}
                hintMaxWidth={320}
                aria-label="Delete Server"
                data-testid="DeleteButton"
              />
            </MenuItem>
          )
        })}

        <Button
          startIcon={<AddIcon />}
          onClick={handleServerAdd}
          aria-label="Add Server"
          data-testid="AddCustomServerButton"
        >
          Add Custom Server
        </Button>
      </Select>
    </FormControl>
  )
}

ServersDropdown.displayName = 'ServersDropdown'
