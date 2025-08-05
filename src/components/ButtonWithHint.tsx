import { LoadingButton } from '@mui/lab'
import { Button, IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import type { ButtonProps } from '@mui/material/Button/Button'
import Tooltip from '@mui/material/Tooltip'
import type { FC, ReactElement, ReactNode } from 'react'
import { memo, useMemo } from 'react'

export type ButtonWithHintProps = {
  hint?: string | ReactNode
  isLoading?: boolean
  title?: string
  startIcon?: ReactElement
  ['area-label']?: string
} & ButtonProps

export const ButtonWithHint: FC<ButtonWithHintProps> = memo<ButtonWithHintProps>((
  {
    title,
    isLoading,
    hint,
    startIcon,
    ...buttonProps
  },
) => {
  const button = useMemo(() => {
    if (isLoading !== undefined) {
      return (
        <LoadingButton
          loading={isLoading}
          startIcon={startIcon}
          {...buttonProps}
        >
          {title}
        </LoadingButton>
      )
    }

    if (!title && startIcon) {
      return (
        <IconButton
          {...buttonProps}
        >
          {startIcon}
        </IconButton>
      )
    }

    return (
      <Button
        startIcon={startIcon}
        {...buttonProps}
      >
        {title}
      </Button>
    )
  }, [isLoading, title, startIcon, buttonProps])

  return (
    <Tooltip
      title={hint}
    >
      {/* MUI disables mouse events for disabled elements. `display: 'inline'` resolves this with minimal layout impact. */}
      <Box display="inline">
        {button}
      </Box>
    </Tooltip>
  )
})
