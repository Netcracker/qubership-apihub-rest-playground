import type { FC } from 'react'
import * as React from 'react'
import { memo } from 'react'

export const FullscreenIcon: FC = memo(() => {
  return (
    <div style={{ display: 'flex' }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M11.9986 3.75259C11.9986 3.33838 12.3344 3.00259 12.7486 3.00259L16.2517 3.00261C16.6659 3.00261 17.0017 3.33839 17.0017 3.7526L17.0017 7.24997C17.0017 7.66419 16.6659 7.99997 16.2517 7.99998C15.8375 7.99998 15.5017 7.66419 15.5017 7.24998L15.5017 5.56325L12.2352 8.82974C11.9423 9.12264 11.4674 9.12263 11.1745 8.82974C10.8816 8.53685 10.8816 8.06197 11.1745 7.76908L14.441 4.5026L12.7486 4.50259C12.3344 4.50259 11.9986 4.16681 11.9986 3.75259ZM8.83021 11.1707C9.1231 11.4636 9.1231 11.9385 8.83021 12.2314L5.56212 15.4995L7.25455 15.4995C7.66876 15.4995 8.00455 15.8353 8.00454 16.2495C8.00454 16.6637 7.66875 16.9995 7.25454 16.9995L3.75147 16.9995C3.33726 16.9995 3.00148 16.6637 3.00148 16.2495L3.00146 12.7521C3.00146 12.3379 3.33725 12.0021 3.75146 12.0021C4.16568 12.0021 4.50146 12.3379 4.50146 12.7521L4.50147 14.4388L7.76955 11.1707C8.06244 10.8778 8.53731 10.8778 8.83021 11.1707Z"
          fill="#626D82"
        />
      </svg>
    </div>
  )
})
