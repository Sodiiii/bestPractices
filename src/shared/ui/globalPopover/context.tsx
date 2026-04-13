import { createContext, useContext } from 'react'

import type { PopoverController } from './types'

/** Контекст для передачи контроллера вниз по дереву */
const PopoverContext = createContext<PopoverController | null>(null)
export const PopoverContextProvider = PopoverContext.Provider

/** Хук доступа к контроллеру (декларативный способ) */
export function useGlobalPopover(): PopoverController {
  const ctx = useContext(PopoverContext)
  if (!ctx)
    throw new Error('useGlobalPopover must be used within <GlobalPopoverProvider/>')
  return ctx
}
