import { makeAutoObservable } from 'mobx'

import type {
  PresentationPrimaryAction,
  PresentationResolvedMedia,
  PresentationSecondaryAction,
  PresentationStepConfig,
} from './types'

import { presentationDeckConfig } from './config'
import { resolvePresentationMedia } from './registry'
import { getFirstSlideId, getNextTarget, getPresentationSlideById, getPreviousSlideId } from './selectors'

class PresentationStore {
  /** Состояние playback: проигрывание шага или короткое удержание на 100%. */
  playbackPhase: 'playing' | 'holding' = 'playing'

  /** Идентификатор активного верхнеуровневого слайда. */
  currentSlideId = getFirstSlideId()

  /** Индекс активного шага внутри currentSlide. */
  currentStepIndex = 0

  /** Флаг автопроигрывания текущего шага. */
  isPlaying = presentationDeckConfig.autoplay

  /** Сколько миллисекунд уже прошло в текущем шаге. */
  elapsedMs = 0

  /** Слайд, на который нужно перейти после завершения текущего. */
  pendingSlideId: string | null = null

  /** Индекс шага, который должен открыться после завершения hold-фазы. */
  pendingStepIndex: number | null = null

  /** Идентификатор слайда, для которого нужно применить отложенный стартовый шаг. */
  pendingEntrySlideId: string | null = null

  /** Индекс стартового шага, который нужно применить при открытии pendingEntrySlideId. */
  pendingEntryStepIndex: number | null = null

  /** Остаток hold-фазы в миллисекундах до автоперехода. */
  remainingHoldMs: number | null = null

  /** Внутренний id requestAnimationFrame. */
  private frameId: number | null = null

  /** Временная отметка предыдущего тика. */
  private lastFrameAt = 0

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get currentSlide() {
    return getPresentationSlideById(this.currentSlideId)
  }

  get currentStep(): PresentationStepConfig | undefined {
    return this.currentSlide?.steps[this.currentStepIndex]
  }

  get currentStepCount() {
    return this.currentSlide?.steps.length ?? 0
  }

  get currentStepNumber() {
    return this.currentStepIndex + 1
  }

  get shouldShowCounter() {
    return this.currentSlide?.kind === 'sequence' || this.currentSlide?.kind === 'hybrid'
  }

  get shouldShowStepButtons() {
    return this.currentSlide?.kind === 'selector' || this.currentSlide?.kind === 'hybrid'
  }

  get stepProgress() {
    const duration = this.currentStep?.durationMs ?? 1
    return Math.min(this.elapsedMs / duration, 1)
  }

  /**
   * Считает суммарный прогресс прохождения всех шагов текущего слайда.
   * Алгоритм:
   * 1. Суммирует durationMs всех шагов текущего слайда.
   * 2. Добавляет длительности полностью завершённых шагов.
   * 3. Добавляет elapsedMs активного шага.
   * 4. Делит на общую длительность и ограничивает результат единицей.
   */
  get totalSlideProgress() {
    if (!this.currentSlide) {
      return 0
    }

    const totalDuration = this.currentSlide.steps.reduce((sum, step) => sum + step.durationMs, 0)
    if (!totalDuration) {
      return 0
    }

    const completedDuration = this.currentSlide.steps
      .slice(0, this.currentStepIndex)
      .reduce((sum, step) => sum + step.durationMs, 0)

    const currentStepDuration = this.currentStep?.durationMs ?? 0
    const currentElapsed = Math.min(this.elapsedMs, currentStepDuration)

    return Math.min((completedDuration + currentElapsed) / totalDuration, 1)
  }

  get ctaProgress() {
    if (this.currentSlide?.kind === 'selector' || this.currentSlide?.kind === 'hybrid') {
      return this.totalSlideProgress
    }

    return this.stepProgress
  }

  /**
   * Возвращает текущее действие основной CTA-кнопки.
   * Алгоритм:
   * 1. Для sequence до последнего шага переключает на следующий внутренний шаг.
   * 2. Для остальных состояний использует верхнеуровневый nextTarget.
   * 3. Если верхнеуровневого перехода нет, возвращает действие возврата домой.
   */
  get currentPrimaryAction(): PresentationPrimaryAction {
    if (this.currentSlide?.kind === 'sequence' && this.currentSlide && this.currentStepIndex < this.currentSlide.steps.length - 1) {
      const nextStepIndex = this.currentStepIndex + 1
      const internalStepCta = this.currentSlide.internalStepCta
      const label = internalStepCta?.label ?? 'Следующий проект'
      const description = internalStepCta?.hideDescription
        ? ''
        : (internalStepCta?.description ?? '')

      return {
        kind: 'project',
        label,
        description,
        isInternalStep: true,
        targetStepIndex: nextStepIndex,
      }
    }

    if (this.nextTarget) {
      return {
        kind: this.nextTarget.kind,
        label: this.nextTarget.label,
        description: this.nextTarget.description,
        isInternalStep: false,
        targetSlideId: this.nextTarget.targetSlideId,
      }
    }

    return {
      kind: 'section',
      label: 'На главную',
      description: 'Вернуться в начало',
      isInternalStep: false,
    }
  }

  /**
   * Возвращает текущее действие вторичной кнопки.
   * Алгоритм:
   * 1. Для sequence после первого шага возвращает на предыдущий внутренний шаг.
   * 2. Для остальных состояний использует верхнеуровневую навигацию назад.
   * 3. Если предыдущего верхнеуровневого слайда нет, возвращает домой.
   */
  get currentSecondaryAction(): PresentationSecondaryAction {
    if (this.currentSlide?.kind === 'sequence' && this.currentStepIndex > 0) {
      return {
        label: 'Назад',
        isInternalStep: true,
        targetStepIndex: this.currentStepIndex - 1,
      }
    }

    if (this.previousSlideId) {
      const previousSlide = getPresentationSlideById(this.previousSlideId)

      return {
        label: 'Назад',
        isInternalStep: false,
        targetSlideId: this.previousSlideId,
        targetStepIndex: previousSlide ? previousSlide.steps.length - 1 : undefined,
      }
    }

    return {
      label: 'На главную',
      isInternalStep: false,
    }
  }

  get nextTarget() {
    return this.currentSlide ? getNextTarget(this.currentSlide.id) : null
  }

  get previousSlideId() {
    return getPreviousSlideId(this.currentSlideId)
  }

  get resolvedMedia(): PresentationResolvedMedia | undefined {
    if (!this.currentStep) {
      return undefined
    }

    return resolvePresentationMedia(
      this.currentStep.media,
      this.currentStep.imageAlt ?? this.currentStep.projectTitle,
    )
  }

  /**
   * Синхронизирует store с route-параметром.
   * Алгоритм:
   * 1. Проверяет, существует ли requested slide в config.
   * 2. Если route уже совпадает, ничего не меняет.
   * 3. При смене route сбрасывает шаг, прогресс и pending navigation.
   */
  setCurrentSlide(slideId: string) {
    const slide = getPresentationSlideById(slideId)
    if (!slide || slide.id === this.currentSlideId) {
      return
    }

    const initialStepIndex = this.resolvePendingEntryStep(slide.id, slide.steps.length)

    this.resetPendingTransition()
    this.playbackPhase = 'playing'
    this.currentSlideId = slide.id
    this.currentStepIndex = initialStepIndex
    this.elapsedMs = 0
    this.lastFrameAt = 0
  }

  /**
   * Запускает loop автопроигрывания только один раз.
   * Алгоритм:
   * 1. Отменяет повторный запуск, если frame уже активен.
   * 2. Сбрасывает lastFrameAt, чтобы первый delta был корректным.
   * 3. Подписывает store на requestAnimationFrame loop.
   */
  startPlayback() {
    if (this.frameId !== null) {
      return
    }

    this.lastFrameAt = 0
    this.frameId = window.requestAnimationFrame(this.handleFrame)
  }

  /**
   * Останавливает loop и очищает ссылку на активный frame.
   */
  stopPlayback() {
    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId)
      this.frameId = null
    }

    this.lastFrameAt = 0
  }

  /**
   * Переключает состояние pause/play без сброса накопленного прогресса.
   */
  togglePlayback() {
    this.isPlaying = !this.isPlaying
    this.lastFrameAt = 0
  }

  /**
   * Активирует выбранный шаг вручную.
   * Алгоритм:
   * 1. Проверяет границы индекса.
   * 2. Переключает шаг.
   * 3. Сбрасывает таймер только для нового шага.
   */
  selectStep(stepIndex: number) {
    if (!this.currentSlide) {
      return
    }

    if (stepIndex < 0 || stepIndex >= this.currentSlide.steps.length) {
      return
    }

    this.resetPendingTransition()
    this.playbackPhase = 'playing'
    this.currentStepIndex = stepIndex
    this.elapsedMs = 0
    this.lastFrameAt = 0
  }

  clearPendingNavigation() {
    this.pendingSlideId = null
  }

  /**
   * Подготавливает стартовый шаг для следующего route-перехода на конкретный slide.
   */
  prepareEntryStep(slideId: string, stepIndex: number) {
    this.pendingEntrySlideId = slideId
    this.pendingEntryStepIndex = stepIndex
  }

  /**
   * Сбрасывает отложенный переход и возвращает store в обычную playback-фазу.
   */
  private resetPendingTransition() {
    this.pendingSlideId = null
    this.pendingStepIndex = null
    this.remainingHoldMs = null
  }

  /**
   * Разрешает отложенный стартовый шаг для только что открытого slide.
   */
  private resolvePendingEntryStep(slideId: string, stepCount: number) {
    if (this.pendingEntrySlideId !== slideId || this.pendingEntryStepIndex === null) {
      return 0
    }

    const resolvedIndex = Math.max(0, Math.min(this.pendingEntryStepIndex, stepCount - 1))
    this.pendingEntrySlideId = null
    this.pendingEntryStepIndex = null
    return resolvedIndex
  }

  private handleFrame(frameTime: number) {
    this.frameId = window.requestAnimationFrame(this.handleFrame)

    if (!this.isPlaying || !this.currentStep) {
      this.lastFrameAt = frameTime
      return
    }

    if (!this.lastFrameAt) {
      this.lastFrameAt = frameTime
      return
    }

    const delta = frameTime - this.lastFrameAt
    this.lastFrameAt = frameTime

    if (this.playbackPhase === 'holding') {
      if (this.remainingHoldMs === null) {
        this.finishPendingTransition()
        return
      }

      this.remainingHoldMs = Math.max(this.remainingHoldMs - delta, 0)
      if (this.remainingHoldMs === 0) {
        this.finishPendingTransition()
      }

      return
    }

    this.elapsedMs += delta

    if (this.elapsedMs >= this.currentStep.durationMs) {
      this.advanceAfterStepFinish()
    }
  }

  /**
   * Переводит презентацию к следующему состоянию после окончания текущего шага.
   * Алгоритм:
   * 1. Фиксирует прогресс текущего шага на 100%.
   * 2. Определяет, будет ли следующий внутренний шаг или верхнеуровневый slide.
   * 3. Переводит playback в hold-фазу на transitionHoldMs.
   */
  private advanceAfterStepFinish() {
    if (!this.currentSlide) {
      return
    }

    this.elapsedMs = this.currentStep?.durationMs ?? this.elapsedMs
    this.playbackPhase = 'holding'
    this.remainingHoldMs = presentationDeckConfig.transitionHoldMs

    const nextStepIndex = this.currentStepIndex + 1
    if (nextStepIndex < this.currentSlide.steps.length) {
      this.pendingStepIndex = nextStepIndex
      this.pendingSlideId = null
      return
    }

    this.pendingStepIndex = null
    this.pendingSlideId = this.nextTarget?.targetSlideId ?? null
  }

  /**
   * Завершает отложенный переход после hold-фазы.
   * Алгоритм:
   * 1. Если запланирован внутренний шаг, активирует его как новый текущий шаг.
   * 2. Если запланирован переход на slide, оставляет pendingSlideId для route-layer.
   * 3. Очищает hold-состояние и возвращает playback в фазу playing.
   */
  private finishPendingTransition() {
    const pendingStepIndex = this.pendingStepIndex

    this.resetPendingTransition()
    this.playbackPhase = 'playing'
    this.lastFrameAt = 0

    if (typeof pendingStepIndex === 'number') {
      this.currentStepIndex = pendingStepIndex
      this.elapsedMs = 0
      return
    }

    if (this.nextTarget?.targetSlideId) {
      this.pendingSlideId = this.nextTarget.targetSlideId
      return
    }

    this.isPlaying = false
    this.elapsedMs = this.currentStep?.durationMs ?? this.elapsedMs
  }
}

export const presentationStore = new PresentationStore()
