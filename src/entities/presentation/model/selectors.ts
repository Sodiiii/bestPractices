import type {
  PresentationNextTarget,
  PresentationSectionConfig,
  PresentationSlideConfig,
} from './types'

import { presentationDeckConfig } from './config'

export function getPresentationSlides(): PresentationSlideConfig[] {
  return presentationDeckConfig.slides
}

export function getPresentationSlideById(slideId: string): PresentationSlideConfig | undefined {
  return presentationDeckConfig.slides.find(slide => slide.id === slideId)
}

export function getPresentationSectionById(sectionId: string): PresentationSectionConfig | undefined {
  return presentationDeckConfig.sections.find(section => section.id === sectionId)
}

export function getPresentationSectionBySlideId(slideId: string): PresentationSectionConfig | undefined {
  const slide = getPresentationSlideById(slideId)
  return slide ? getPresentationSectionById(slide.sectionId) : undefined
}

export function getResolvedPresentationSections(): Array<{
  section: PresentationSectionConfig
  slide: PresentationSlideConfig
}> {
  return presentationDeckConfig.sections.map((section) => {
    const slide = getPresentationSlideById(section.startSlideId)

    if (!slide) {
      throw new Error(`Presentation section "${section.id}" references missing slide "${section.startSlideId}"`)
    }

    return { section, slide }
  })
}

export function getFirstSlideId(): string {
  return presentationDeckConfig.slides[0]?.id ?? ''
}

export function getPreviousSlideId(slideId: string): string | null {
  const slides = getPresentationSlides()
  const slideIndex = slides.findIndex(slide => slide.id === slideId)

  if (slideIndex <= 0) {
    return null
  }

  return slides[slideIndex - 1]?.id ?? null
}

/**
 * Возвращает CTA-метаданные для следующего перехода.
 * Алгоритм:
 * 1. Если в конфиге явно указан next, используем его.
 * 2. Иначе берём следующий слайд по плоскому порядку deck.
 * 3. Последнему слайду возвращаем null, чтобы UI показал возврат домой.
 */
export function getNextTarget(slideId: string): PresentationNextTarget | null {
  const slides = getPresentationSlides()
  const slideIndex = slides.findIndex(slide => slide.id === slideId)

  if (slideIndex === -1) {
    return null
  }

  const currentSlide = slides[slideIndex]
  if (currentSlide?.next) {
    return currentSlide.next
  }

  const nextSlide = slides[slideIndex + 1]
  if (!nextSlide) {
    return null
  }

  return {
    kind: 'project',
    label: 'Следующий проект',
    description: nextSlide.title,
    targetSlideId: nextSlide.id,
  }
}
