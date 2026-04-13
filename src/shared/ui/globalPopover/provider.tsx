import type { CSSProperties, FC, PropsWithChildren } from 'react'

import { createPortal } from 'react-dom'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { cn } from '@/shared/lib/classNames'

import type { GlobalPopoverOpenOptions, PopoverController, State } from './types'

import { getFocusables } from './utils'
import cls from './provider.module.scss'
import { PopoverContextProvider } from './context'
import { useComputedPosition } from './positioning'
import { setGlobalController } from './controllerRegistry'

const POPOVER_CLOSE_ANIMATION_MS = 340

interface PopoverMotionStyle extends CSSProperties {
  '--global-popover-enter-x': string
  '--global-popover-enter-y': string
  '--global-popover-origin': string
}

function getPopoverMotionStyle(placement: State['placement']): PopoverMotionStyle {
  switch (placement) {
    case 'top':
      return { '--global-popover-enter-x': '0', '--global-popover-enter-y': '10px', '--global-popover-origin': 'bottom center' }
    case 'top-start':
      return { '--global-popover-enter-x': '0', '--global-popover-enter-y': '10px', '--global-popover-origin': 'bottom left' }
    case 'top-end':
      return { '--global-popover-enter-x': '0', '--global-popover-enter-y': '10px', '--global-popover-origin': 'bottom right' }
    case 'bottom':
      return { '--global-popover-enter-x': '0', '--global-popover-enter-y': '-10px', '--global-popover-origin': 'top center' }
    case 'bottom-start':
      return { '--global-popover-enter-x': '0', '--global-popover-enter-y': '-10px', '--global-popover-origin': 'top left' }
    case 'bottom-end':
      return { '--global-popover-enter-x': '0', '--global-popover-enter-y': '-10px', '--global-popover-origin': 'top right' }
    case 'left':
      return { '--global-popover-enter-x': '10px', '--global-popover-enter-y': '0', '--global-popover-origin': 'center right' }
    case 'left-start':
      return { '--global-popover-enter-x': '10px', '--global-popover-enter-y': '0', '--global-popover-origin': 'top right' }
    case 'left-end':
      return { '--global-popover-enter-x': '10px', '--global-popover-enter-y': '0', '--global-popover-origin': 'bottom right' }
    case 'right':
      return { '--global-popover-enter-x': '-10px', '--global-popover-enter-y': '0', '--global-popover-origin': 'center left' }
    case 'right-start':
      return { '--global-popover-enter-x': '-10px', '--global-popover-enter-y': '0', '--global-popover-origin': 'top left' }
    case 'right-end':
      return { '--global-popover-enter-x': '-10px', '--global-popover-enter-y': '0', '--global-popover-origin': 'bottom left' }
    default:
      return { '--global-popover-enter-x': '0', '--global-popover-enter-y': '-10px', '--global-popover-origin': 'top center' }
  }
}

const DEFAULT_KEEP_OPEN_SELECTORS = [
  // семантика ARIA
  '[role="listbox"]',
  '[role="menu"]',
  '[role="combobox"]',
  '[role="dialog"]',
  '.rc-select-dropdown',
  '.tippy-box',
  '[data-radix-portal]',
  '.floating-ui-portal',
  '.xenon-select-portal',
  '.xenon-select-dropdown',
  '.xenon-popover',
]

function pathMatchesSelectors(path: EventTarget[], selectors: string[]) {
  for (const node of path) {
    if (!(node instanceof Element))
      continue
    for (const sel of selectors) {
      try {
        if (node.matches(sel) || node.closest(sel))
          return true
      }
      catch { /* ignore invalid sel */ }
    }
  }
  return false
}

const defaultState: State = {
  isOpen: false,
  content: null,
  anchor: null,
  at: null,

  placement: 'top-start',
  offset: 8,
  arrow: false,
  trapFocus: false,
  disableOutsideClose: false,
  matchAnchorWidth: false,

  maxWidth: 420,
  zIndex: 10000,
  onClose: undefined,
  classNames: undefined,
}

/**
 * Провайдер глобального поповера.
 * - Держит состояние и отдаёт контроллер через контекст.
 * - Регистрирует контроллер глобально для императивных вызовов (openGlobalPopover, ...).
 * - Управляет обработчиками клавиатуры/мыши и trapFocus.
 *
 * Размещайте ОДИН раз рядом с корнем <App/>.
 */
export const GlobalPopoverProvider: FC<PropsWithChildren<object>> = ({ children }) => {
  const [state, setState] = useState<State>(defaultState)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const stateRef = useRef<State>(defaultState)
  const closeTimeoutRef = useRef<number | null>(null)
  const openAnimationFrameRef = useRef<number | null>(null)
  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  stateRef.current = state

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current == null)
      return

    window.clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = null
  }

  const clearOpenAnimationFrame = () => {
    if (openAnimationFrameRef.current == null)
      return

    window.cancelAnimationFrame(openAnimationFrameRef.current)
    openAnimationFrameRef.current = null
  }

  const scheduleEnterAnimation = () => {
    clearOpenAnimationFrame()
    setIsVisible(false)
    openAnimationFrameRef.current = window.requestAnimationFrame(() => {
      openAnimationFrameRef.current = null
      setIsVisible(true)
    })
  }

  // Контроллер: открытие/обновление/закрытие
  const controller: PopoverController = useMemo(
    () => ({
      open: (opts: GlobalPopoverOpenOptions) => {
        clearCloseTimeout()
        setState(prev => ({
          ...defaultState,
          ...prev,
          ...opts,
          content: opts.content,
          anchor: opts.anchor ?? null,
          at: opts.at ?? null,
          isOpen: true,
          onClose: opts.onClose,
          zIndex: opts.zIndex ?? prev.zIndex ?? defaultState.zIndex,
          placement: opts.placement ?? prev.placement ?? defaultState.placement,
          offset: opts.offset ?? prev.offset ?? defaultState.offset,
          arrow: opts.arrow ?? prev.arrow ?? defaultState.arrow,
          trapFocus: opts.trapFocus ?? prev.trapFocus ?? defaultState.trapFocus,
          disableOutsideClose: opts.disableOutsideClose ?? prev.disableOutsideClose ?? defaultState.disableOutsideClose,
          matchAnchorWidth: opts.matchAnchorWidth ?? prev.matchAnchorWidth ?? defaultState.matchAnchorWidth,
          maxWidth: opts.maxWidth ?? prev.maxWidth ?? defaultState.maxWidth,
          classNames: opts.classNames ?? prev.classNames,
        }))
        setIsRendered(true)
        scheduleEnterAnimation()
      },
      update: opts => setState(prev => ({ ...prev, ...opts } as State)),
      close: () => {
        if (!stateRef.current.isOpen && !isRendered)
          return

        clearCloseTimeout()
        clearOpenAnimationFrame()
        const onClose = stateRef.current.onClose

        setState(prev => ({ ...prev, isOpen: false }))
        setIsVisible(false)
        closeTimeoutRef.current = window.setTimeout(() => {
          closeTimeoutRef.current = null
          setIsRendered(false)
          setState(prev => ({
            ...prev,
            content: null,
            anchor: null,
            at: null,
          }))
          onClose?.()
        }, POPOVER_CLOSE_ANIMATION_MS)
      },
      isOpen: () => stateRef.current.isOpen,
    }),
    [isRendered],
  )

  // Регистрируем/снимаем глобальный контроллер
  useLayoutEffect(() => {
    setGlobalController(controller)
    return () => {
      setGlobalController(null)
    }
  }, [controller])

  // Закрыть по Escape
  useEffect(() => {
    if (!state.isOpen)
      return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        controller.close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.isOpen, controller])

  // Закрыть по клику/тапу снаружи (если не отключено)
  useEffect(() => {
    if (!state.isOpen || state.disableOutsideClose)
      return

    const onDocPointerDown = (e: PointerEvent) => {
      const path = (e.composedPath?.() ?? []) as EventTarget[]

      // 1) если клик пришёл из "типичных" выпадашек — игнорируем
      if (pathMatchesSelectors(path, DEFAULT_KEEP_OPEN_SELECTORS))
        return

      // 2) обычная проверка «вне поповера»
      const target = e.target as Node | null
      if (popoverRef.current && target && !popoverRef.current.contains(target)) {
        controller.close()
      }
    }

    document.addEventListener('pointerdown', onDocPointerDown, true)
    return () => document.removeEventListener('pointerdown', onDocPointerDown, true)
  }, [state.isOpen, state.disableOutsideClose, controller])

  useEffect(() => {
    return () => {
      clearCloseTimeout()
      clearOpenAnimationFrame()
    }
  }, [])

  // Позиционирование и ширина под якорь
  const [coords, arrowPos, width] = useComputedPosition(state, popoverRef)
  const motionStyle = getPopoverMotionStyle(state.placement)

  // Нормализуем content (функция или ReactNode)
  const content = useMemo(() => {
    if (!state.content)
      return null
    return typeof state.content === 'function' ? state.content(controller.close) : state.content
  }, [state.content, controller.close])

  return (
    <PopoverContextProvider value={controller}>
      {children}
      {isRendered && createPortal(
        <div
          aria-label="global-popover-overlay"
          style={{ position: 'fixed', inset: 0, zIndex: state.zIndex }}
          className={state.classNames?.root}
        >
          {/* Простейший «ловец» фокуса: перехватываем Tab и зацикливаем в пределах поповера */}
          <div
            tabIndex={-1}
            style={{ position: 'absolute', inset: 0, outline: 'none' }}
            onKeyDown={(e) => {
              if (!state.trapFocus)
                return
              if (e.key === 'Tab') {
                const focusables = getFocusables(popoverRef.current)
                if (!focusables.length)
                  return
                const first = focusables[0]
                const last = focusables[focusables.length - 1]
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  (last as HTMLElement).focus()
                }
                else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  (first as HTMLElement).focus()
                }
              }
            }}
          />

          <div
            ref={popoverRef}
            role="dialog"
            aria-modal={state.trapFocus || undefined}
            className={cn(
              cls.popoverWrapper,
              isVisible && cls.popoverWrapperVisible,
              state.classNames?.wrapper,
            )}
            style={{
              ...motionStyle,
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              minWidth: state.matchAnchorWidth ? width : undefined,
              maxWidth: state.maxWidth,
              // Базовый «поверхностный» стиль дружит с xenon-ui токенами
              background: 'var(--xenon-color-bg-container, #fff)',
              color: 'var(--xenon-color-text, #0f172a)',
              borderRadius: 4,
              boxShadow: '0 10px 20px rgba(0,0,0,.12), 0 3px 8px rgba(0,0,0,.08)',
              padding: 12,
              border: '1px solid var(--xenon-color-border, rgba(0,0,0,.08))',
            }}
          >
            {state.arrow && (
              <div
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  transform: 'rotate(45deg)',
                  background: 'var(--xenon-color-bg-container, #fff)',
                  borderLeft: '1px solid var(--xenon-color-border, rgba(0,0,0,.08))',
                  borderTop: '1px solid var(--xenon-color-border, rgba(0,0,0,.08))',
                  top: arrowPos.top,
                  left: arrowPos.left,
                }}
              />
            )}
            {content}
          </div>
        </div>,
        document.body,
      )}
    </PopoverContextProvider>
  )
}
