import { useEffect, useRef } from 'react'

/**
 * Hook for measuring and logging performance of operations
 */
export const usePerformanceLogger = (operationName: string, dependencies: any[]) => {
  const startTimeRef = useRef<number>()
  const renderCountRef = useRef(0)

  useEffect(() => {
    renderCountRef.current += 1
    startTimeRef.current = performance.now()
    
    // Only log if it's not the first render to reduce noise
    if (renderCountRef.current > 1) {
      console.log(`⏱️ ${operationName}: Starting (render #${renderCountRef.current})`)
    }
    
    return () => {
      if (startTimeRef.current && renderCountRef.current > 1) {
        const duration = performance.now() - startTimeRef.current
        console.log(`⏱️ ${operationName}: ${duration.toFixed(1)}ms`)
      }
    }
  }, dependencies)
}

/**
 * Hook for logging when a component or hook recalculates
 */
export const useRecalculationLogger = (name: string, dependencies: any[]) => {
  const previousDepsRef = useRef<any[]>()
  const renderCountRef = useRef(0)

  useEffect(() => {
    renderCountRef.current += 1
    
    if (previousDepsRef.current) {
      const changedDeps = dependencies.filter((dep, index) => dep !== previousDepsRef.current![index])

      if (changedDeps.length > 0) {
        console.log(`🔄 ${name}: Recalc #${renderCountRef.current} (${changedDeps.length} deps changed)`)
      }
    } else {
      console.log(`🆕 ${name}: Initial calc`)
    }

    previousDepsRef.current = [...dependencies]
  }, dependencies)
}
