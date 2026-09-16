import { MenuItem } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { safeStringify } from '@stoplight/json'
import { INodeExample, INodeExternalExample } from '@stoplight/types'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'

import { MenuItemContent } from '../MenuItemContent'

export type ExamplesDropdownProps = {
  examples: ReadonlyArray<INodeExample | INodeExternalExample>;
  requestResponseBody: string;
  onChange: (newRequestBody: string) => void;
  onSelectExample?: (example: INodeExample | INodeExternalExample | undefined) => void;
};

export const ExamplesDropdown: FC<ExamplesDropdownProps> = memo<ExamplesDropdownProps>(
  ({ examples, requestResponseBody, onChange, onSelectExample }) => {
    const menuItems = useMemo(
      () =>
        examples.map((example, index) => ({
          // Example keys are not guaranteed to be unique: http-spec assigns the key 'default'
          // to the example taken from `example`, which can collide with a key coming from `examples`.
          // The index is what makes the id unique; the key is kept for readability.
          id: `request-example-${index}-${example.key}`,
          title: example.key,
          summary: example.summary,
          description: ((example as INodeExample)?.value as INodeExample)?.description ?? '',
          example,
        })),
      [examples],
    )

    const [selectedId, setSelectedId] = useState<string | undefined>()
    const selectedItem = menuItems.find(({ id }) => id === selectedId) ?? menuItems[0]

    useEffect(() => setSelectedId(menuItems.length ? menuItems[0].id : undefined), [menuItems])

    const [open, setOpen] = useState(false)
    const handleClose = () => {
      setOpen(false)
    }
    const handleOpen = () => {
      setOpen(true)
    }

    const handleClick = useCallback(
      event => {
        const item = menuItems.find(({ id }) => id === event.target.value)

        onChange(
          item
            ? safeStringify('value' in item.example ? item.example.value : item.example.externalValue, undefined, 2) ??
                ''
            : requestResponseBody,
        )
        setSelectedId(item?.id)
        setOpen(false)
      },
      [menuItems, onChange, requestResponseBody],
    )

    useEffect(() => {
      onSelectExample?.(selectedItem?.example)
    }, [onSelectExample, selectedItem])

    return (
      <FormControl size="small" fullWidth>
        <Select
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          onChange={handleClick}
          value={selectedItem?.id ?? ''}
          renderValue={id => menuItems.find(item => item.id === id)?.title ?? ''}
          className="MuiInputBase-root MuiSelect-select custom"
        >
          {menuItems.map(({ id, title, summary }) => {
            return (
              <MenuItem
                key={id}
                style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                value={id}
                disableRipple
              >
                <MenuItemContent title={title} subtitle={summary} maxWidth="400px"/>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
    )
  },
)

ExamplesDropdown.displayName = 'ExamplesDropdown'
