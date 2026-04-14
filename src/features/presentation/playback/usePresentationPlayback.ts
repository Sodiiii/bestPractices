import { reaction } from 'mobx'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { routes } from '@/shared/routes'
import { presentationStore } from '@/entities/presentation'

/**
 * Поднимает lifecycle презентационного store в React-дерево.
 * Алгоритм:
 * 1. При маунте запускает requestAnimationFrame loop.
 * 2. Подписывается на pending navigation из store.
 * 3. После route transition очищает pending state.
 * 4. При анмаунте гарантированно останавливает loop.
 */
export function usePresentationPlayback(enabled = true) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!enabled) {
      return
    }

    presentationStore.startPlayback()

    const disposePendingNavigation = reaction(
      () => presentationStore.pendingSlideId,
      (pendingSlideId) => {
        if (!pendingSlideId) {
          return
        }

        navigate(routes.slide.build(pendingSlideId))
        presentationStore.clearPendingNavigation()
      },
    )

    return () => {
      presentationStore.stopPlayback()
      disposePendingNavigation()
    }
  }, [enabled, navigate])
}
