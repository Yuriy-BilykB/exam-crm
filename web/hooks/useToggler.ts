import { useState, useCallback, useMemo } from "react"

export const useToggleState = (initialValue = false) => {
    const [state, setState] = useState(initialValue)
  
    const setTrue = useCallback(() => setState(true), [])
    const setFalse = useCallback(() => setState(false), [])
    const flip = useCallback(() => setState((s) => !s), [])
  
    return useMemo(
      () => [state, setTrue, setFalse, flip] as const,
      [state, setTrue, setFalse, flip],
    )
  }
  