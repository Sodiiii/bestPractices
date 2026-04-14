export { presentationDeckConfig } from './model/config'
export { presentationStore } from './model/presentationStore'
export { presentationLogoPath, presentationWidgetRegistry, resolvePresentationAssetPath, resolvePresentationMedia } from './model/registry'
export { getFirstSlideId, getNextTarget, getPresentationSectionBySlideId, getPresentationSlideById, getPresentationSlides, getPreviousSlideId } from './model/selectors'

export type {
  PresentationDeckConfig,
  PresentationHybridSlideConfig,
  PresentationInternalStepCtaConfig,
  PresentationMediaObjectFit,
  PresentationNextTarget,
  PresentationPrimaryAction,
  PresentationSecondaryAction,
  PresentationSectionConfig,
  PresentationSelectorSlideConfig,
  PresentationSlideConfig,
  PresentationSlideKind,
  PresentationStepConfig,
  PresentationWidgetKey,
} from './model/types'
