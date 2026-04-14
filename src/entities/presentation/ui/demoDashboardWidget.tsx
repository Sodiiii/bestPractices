import { motion } from 'motion/react'

import cls from './demoDashboardWidget.module.scss'

const bars = [
  { id: 'jan', value: 38, label: 'Янв' },
  { id: 'feb', value: 44, label: 'Фев' },
  { id: 'mar', value: 52, label: 'Мар' },
  { id: 'apr', value: 58, label: 'Апр' },
  { id: 'may', value: 61, label: 'Май' },
  { id: 'jun', value: 66, label: 'Июн' },
]

const metrics = [
  { id: 'speed', title: 'Скорость внедрения', value: '4.8x', delta: '+18%' },
  { id: 'coverage', title: 'Покрытие сценариев', value: '96%', delta: '+12%' },
  { id: 'uptime', title: 'Доступность панели', value: '99.4%', delta: '+0.8%' },
]

const legend = [
  { id: 'fact', color: '#44c4ff', label: 'Факт' },
  { id: 'plan', color: '#7cf7c3', label: 'План' },
  { id: 'trend', color: '#ffc561', label: 'Тренд' },
]

export function DemoDashboardWidget() {
  return (
    <div className={cls.widget}>
      <div className={cls.chartArea}>
        <div className={cls.chartGrid} />

        <div className={cls.chartHeader}>
          <div>
            <h3 className={cls.chartTitle}>Интерактивный виджет аналитики</h3>
            <span className={cls.chartSubtitle}>Показательный React-компонент для левой панели</span>
          </div>

          <div className={cls.stats}>
            <div className={cls.statCard}>
              <span className={cls.statLabel}>Проектов</span>
              <span className={cls.statValue}>12</span>
            </div>

            <div className={cls.statCard}>
              <span className={cls.statLabel}>Сценариев</span>
              <span className={cls.statValue}>48</span>
            </div>
          </div>
        </div>

        <div className={cls.chart}>
          {bars.map((bar, index) => (
            <motion.div
              key={bar.id}
              className={cls.bar}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${bar.value}%`, opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.08, ease: 'easeOut' }}
            >
              <div className={cls.barAccent} style={{ height: `${Math.max(18, bar.value * 0.32)}%` }} />
              <span className={cls.barLabel}>{bar.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={cls.sidebar}>
        <div>
          <h4 className={cls.sidebarTitle}>Ключевые метрики</h4>

          <div className={cls.metricList}>
            {metrics.map(metric => (
              <motion.div
                key={metric.id}
                className={cls.metricItem}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <div className={cls.metricHead}>
                  <span>{metric.title}</span>
                  <span>{metric.delta}</span>
                </div>

                <div className={cls.metricValue}>{metric.value}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={cls.legend}>
          {legend.map(item => (
            <span key={item.id} className={cls.legendItem}>
              <span className={cls.legendDot} style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
