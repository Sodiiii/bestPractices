import type { CSSProperties } from 'react'

import { observer } from 'mobx-react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftOutlined, LinkOutlined, PauseOutlined, RightOutlined } from '@ant-design/icons'

import { cn } from '@/shared/lib/classNames'
import { presentationStore } from '@/entities/presentation'

import cls from './presentationSlide.module.scss'

interface PresentationSlideProps {
  /** Обработчик возврата на главный экран. */
  onGoHome: () => void
  /** Обработчик перехода к предыдущему верхнеуровневому слайду. */
  onGoBack: () => void
  /** Обработчик перехода к следующему верхнеуровневому слайду. */
  onGoNext: () => void
  /** Обработчик ручного выбора шага справа. */
  onSelectStep: (stepIndex: number) => void
  /** Обработчик переключения play/pause. */
  onTogglePlayback: () => void
}

export const PresentationSlide = observer(({
  onGoHome,
  onGoBack,
  onGoNext,
  onSelectStep,
  onTogglePlayback,
}: PresentationSlideProps) => {
  const slide = presentationStore.currentSlide
  const step = presentationStore.currentStep
  const media = presentationStore.resolvedMedia

  if (!slide || !step || !media) {
    return null
  }

  const primaryLabel = presentationStore.currentPrimaryAction.label
  const primaryDescription = presentationStore.currentPrimaryAction.description
  const secondaryLabel = presentationStore.currentSecondaryAction.label
  const infoLabel = slide.infoLabel ?? 'О проекте'
  const stepButtonsTitle = slide.stepButtonsTitle ?? (slide.kind === 'hybrid' ? 'Этапы детализации' : 'Виды графиков')
  const shouldShowInfoCard = slide.showInfoCard ?? slide.kind !== 'selector'
  const hasPrimaryDescription = primaryDescription.trim().length > 0

  return (
    <section className={cls.slidePage}>
      <div className={cls.backdrop} />
      <div className={cls.gridOverlay} />

      <div className={cls.content}>
        <button type="button" className={cls.topLink} onClick={onGoHome}>
          <span><ArrowLeftOutlined /></span>
          На главную
        </button>

        <div className={cls.titleRow}>
          <h1 className={cls.title}>{slide.title}</h1>
          {presentationStore.shouldShowCounter && (
            <span className={cls.counter}>
              {presentationStore.currentStepNumber}
              /
              {presentationStore.currentStepCount}
            </span>
          )}
        </div>

        <div className={cls.body}>
          <div className={cls.mediaFrame}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                className={cls.mediaInner}
                initial={{ opacity: 0, scale: 0.98, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -16 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                {media.kind === 'widget' && media.component
                  ? <media.component />
                  : (
                      <img
                        className={cls.mediaImage}
                        src={media.src}
                        alt={media.alt}
                        style={{ objectFit: media.objectFit ?? 'contain' } as CSSProperties}
                      />
                    )}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className={cls.sidePanel}>
            {shouldShowInfoCard && (
              <motion.div
                className={cls.infoCard}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <h2 className={cls.projectTitle}>{step.projectTitle}</h2>

                {step.projectUrl && (
                  <a className={cls.projectLink} target="_blank" href={step.projectUrl}>
                    <span className={cls.projectLinkIcon}><LinkOutlined /></span>
                    <span className={cls.projectLinkText}>Перейти на проект</span>
                  </a>
                )}

                <div className={cls.backdrop2} />
              </motion.div>
            )}

            <div className={cls.sideContent}>
              {(slide.kind === 'basic' || slide.kind === 'sequence' || slide.kind === 'hybrid') && (
                <motion.div
                  className={cls.detailCard}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <span className={cls.sectionLabel}>{infoLabel}</span>
                  <p className={cls.description}>{step.description}</p>
                </motion.div>
              )}

              {presentationStore.shouldShowStepButtons && (
                <div className={cls.stepButtonsWrap}>
                  <div className={cls.stepButtonsTitle}>{stepButtonsTitle}</div>

                  {slide.steps.map((slideStep, stepIndex) => {
                    const isActive = stepIndex === presentationStore.currentStepIndex

                    return (
                      <button
                        key={slideStep.id}
                        type="button"
                        className={cn(cls.stepButton, { [cls.stepButtonActive]: isActive })}
                        onClick={() => onSelectStep(stepIndex)}
                      >
                        <span className={cls.stepButtonLabel}>
                          {slideStep.buttonLabel ?? slideStep.title}
                        </span>

                        {isActive && <div className={cls.backdrop3} />}

                        {isActive && (
                          <motion.span
                            className={cls.stepButtonProgress}
                            initial={{ width: 0 }}
                            animate={{ width: `${presentationStore.stepProgress * 100}%` }}
                            transition={{ duration: 0.16, ease: 'linear' }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className={cls.controls}>
              <button type="button" className={cls.secondaryControl} onClick={onGoBack}>
                {secondaryLabel}
              </button>

              <div className={cls.primaryRow}>
                <button type="button" className={cls.roundButton} onClick={onTogglePlayback}>
                  {presentationStore.isPlaying ? <PauseOutlined /> : <span className="playIcon">▶</span>}
                </button>

                <button type="button" className={cls.primaryButton} onClick={onGoNext}>
                  <motion.span
                    className={cls.primaryFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${presentationStore.ctaProgress * 100}%` }}
                    transition={{ duration: 0.16, ease: 'linear' }}
                  />

                  <span className={cls.primaryContent}>
                    <span className={cls.primaryLabel}>
                      {hasPrimaryDescription
                        ? (
                            <>
                              <span className={cls.primaryDescription}>{primaryLabel}</span>
                              <span className={cls.primaryTitle}>{primaryDescription}</span>
                            </>
                          )
                        : <span className={cls.primaryTitle}>{primaryLabel}</span>}
                    </span>

                    <span className={cls.primaryArrow}><RightOutlined /></span>
                  </span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
})
