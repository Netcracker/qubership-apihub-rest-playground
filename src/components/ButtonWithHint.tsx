/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
/* eslint-disable simple-import-sort/imports */
/* eslint-disable prettier/prettier */

import type { FC, ReactNode } from 'react'
import * as React from 'react'
import { memo } from 'react'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'
import type { TooltipProps } from '@mui/material/Tooltip';


type TooltipPlacement = 'bottom-end' | 'bottom-start' | 'bottom' | 'left-end' | 'left-start' | 'left' | 'right-end' | 'right-start' | 'right' | 'top-end' | 'top-start' | 'top';

export type ButtonWithHintProps = {
  hint?: string | ReactNode;
  disableHint?: boolean;
  tooltipMaxWidth?: number | string;
  tooltipPlacement?: TooltipPlacement;
  handleClose?: TooltipProps['onClose'];
  handleOpen?: TooltipProps['onOpen'];
} & ButtonProps;

export const ButtonWithHint: FC<ButtonWithHintProps> = memo<ButtonWithHintProps>((
  {
    hint,
    disableHint = false,
    tooltipMaxWidth,
    tooltipPlacement,
    handleClose,
    handleOpen,
    children,
    ...buttonProps
  }) => {

  const button = (
    <Button {...buttonProps}>
      {children}
    </Button>
  );

  if (hint) {
    return (
      <Tooltip
        disableHoverListener={disableHint}
        title={hint}
        onClose={handleClose}
        onOpen={handleOpen}
        PopperProps={{
          sx: { '.MuiTooltip-tooltip': { maxWidth: tooltipMaxWidth } },
        }}
        placement={tooltipPlacement}
      >
        <Box sx={{ display: 'inline-block' }}>
          {button}
        </Box>
      </Tooltip>
    )
  }

  return button;
});

ButtonWithHint.displayName = 'ButtonWithHint';