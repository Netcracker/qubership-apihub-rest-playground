import { Box, Typography } from '@mui/material'
import { FC, memo } from 'react'

import { COLOR_TEXT_SECONDARY } from '../themes/colors'
import { OverflowTooltip } from './OverflowTooltip'

export type MenuItemContentProps = Partial<{
  maxWidth: string | number
  title: string
  subtitle: string
}>

export const MenuItemContent: FC<MenuItemContentProps> = memo<MenuItemContentProps>(({ maxWidth, title, subtitle }) => {
  return (
    <Box width="100%" maxWidth={maxWidth}>
      {title && (
        <OverflowTooltip placement="right" title={title}>
          <Typography
            variant="body2"
            noWrap
            fontSize="13px"
            data-testid="MenuItemTitle"
          >
            {title}
          </Typography>
        </OverflowTooltip>
      )}
      {subtitle && (
        <OverflowTooltip placement="right" title={subtitle}>
          <Typography
            variant="body2"
            noWrap
            color={COLOR_TEXT_SECONDARY}
            fontSize="12px"
            data-testid="MenuItemSubtitle"
          >
            {subtitle}
          </Typography>
        </OverflowTooltip>
      )}
    </Box>
  )
})
