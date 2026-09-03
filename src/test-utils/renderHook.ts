/* A minimal `renderHook` harness, standing in for `@testing-library/react-hooks`.
 *
 * It exists so that the React 17 -> 18 migration is a single-variable change. The two unit
 * test files are this repository's *entire* test suite, and both imported
 * `@testing-library/react-hooks` 8.0.1, whose peer range is capped at React 17 - so moving
 * the framework and the only instrument that could report the framework breaking would
 * otherwise have had to happen in one step.
 *
 * This is deliberately written against the legacy `ReactDOM.render` API rather than
 * `createRoot`, because React 18 still supports it. That is the point: this file does not
 * change when React does, so the framework bump is measured against an unmoved instrument.
 *
 * It is temporary. Once React 18 is in, it is replaced by `renderHook` from
 * `@testing-library/react` >= 13.1, which is the supported successor, and deleted.
 *
 * The surface is only what the two suites actually use - `result.current`, `rerender`,
 * `unmount` and `act`. `@testing-library/react-hooks`' `waitForNextUpdate`, `result.error`
 * and `result.all` are not reproduced, because nothing here uses them.
 */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

export { act }

export interface RenderHookResult<TProps, TResult> {
  result: { current: TResult }
  rerender: (props?: TProps) => void
  unmount: () => void
}

export interface RenderHookOptions<TProps> {
  initialProps?: TProps
}

export function renderHook<TProps, TResult>(
  callback: (props: TProps) => TResult,
  options: RenderHookOptions<TProps> = {},
): RenderHookResult<TProps, TResult> {
  const result = { current: undefined as unknown as TResult }
  let currentProps = options.initialProps as TProps

  /* Assigning during render rather than in an effect matches
     @testing-library/react-hooks: `result.current` is the value the hook returned on the
     most recent render, including renders an effect caused. */
  const TestComponent: React.FC<{ hookProps: TProps }> = ({ hookProps }) => {
    result.current = callback(hookProps)
    return null
  }

  const container = document.createElement('div')

  const render = (): void => {
    act(() => {
      ReactDOM.render(React.createElement(TestComponent, { hookProps: currentProps }), container)
    })
  }

  render()

  return {
    result,
    /* `rerender()` with no argument re-renders with the props already in place, which is how
       the memoisation assertions in useServerProcessing.unit-test.ts use it. */
    rerender: (props?: TProps) => {
      if (props !== undefined) {
        currentProps = props
      }
      render()
    },
    unmount: () => {
      act(() => {
        ReactDOM.unmountComponentAtNode(container)
      })
    },
  }
}
