import { reaction } from 'mobx'
import { useEffect, useRef } from 'react'

import { useNotification } from '@/shared/ui/notification'

interface UseChartNotificationsOptions {
  notifyReady?: boolean
}

interface ChartNotificationsSource {
  lastError: string | null
  dataState: string
}

/**
 * Подписывается на chart.lastError и chart.dataState
 * и показывает уведомления
 */
export function useChartNotifications(chart: ChartNotificationsSource, options: UseChartNotificationsOptions = {}) {
  const { notifyReady = true } = options
  const notification = useNotification()
  const lastShownError = useRef<string | null>(null)

  useEffect(() => {
    // Ошибки построения
    const disposeError = reaction(
      () => chart.lastError,
      (err) => {
        if (!err)
          return
        if (lastShownError.current === err)
          return // не дублируем одинаковое
        lastShownError.current = err
        notification.error?.({
          message: 'Ошибка построения графика',
          description: err,
          duration: 5,
        })
      },
      { fireImmediately: false },
    )

    // Уведомление об успешной перестройке
    const disposeReady = notifyReady
      ? reaction(
          () => chart.dataState,
          (state) => {
            if (state === 'ready') {
              notification.success?.({
                message: 'График обновлён',
                duration: 2,
              })
            }
          },
          { fireImmediately: false },
        )
      : () => {}

    return () => {
      disposeError()
      disposeReady()
    }
  }, [chart, notification, notifyReady])
}
