import { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useNavigate, useParams } from 'react-router'

import { routes } from '@/shared/routes'
import { NotFoundPage } from '@/pages/not-found/notFound'
import { useDocumentTitle } from '@/shared/lib/hooks/useDocumentTitle'
import { PresentationSlide } from '@/widgets/presentationSlide/presentationSlide'
import { getPresentationSlideById, presentationStore } from '@/entities/presentation'
import { usePresentationPlayback } from '@/features/presentation/playback/usePresentationPlayback'

export const SlidePage = observer(() => {
  const navigate = useNavigate()
  const { slideId = '' } = useParams()
  const slide = getPresentationSlideById(slideId)
  const { set } = useDocumentTitle()

  usePresentationPlayback(Boolean(slide))

  useEffect(() => {
    if (!slide) {
      return
    }

    presentationStore.setCurrentSlide(slide.id)
    set(`${slide.title} | Лучшие практики`)
  }, [set, slide])

  if (!slide) {
    return <NotFoundPage />
  }

  return (
    <PresentationSlide
      onGoHome={() => navigate(routes.home.path)}
      onGoBack={() => {
        if (presentationStore.currentSecondaryAction.isInternalStep && typeof presentationStore.currentSecondaryAction.targetStepIndex === 'number') {
          presentationStore.selectStep(presentationStore.currentSecondaryAction.targetStepIndex)
          return
        }

        if (presentationStore.currentSecondaryAction.targetSlideId) {
          if (typeof presentationStore.currentSecondaryAction.targetStepIndex === 'number') {
            presentationStore.prepareEntryStep(
              presentationStore.currentSecondaryAction.targetSlideId,
              presentationStore.currentSecondaryAction.targetStepIndex,
            )
          }

          navigate(routes.slide.build(presentationStore.currentSecondaryAction.targetSlideId))
          return
        }

        navigate(routes.home.path)
      }}
      onGoNext={() => {
        if (presentationStore.currentPrimaryAction.isInternalStep && typeof presentationStore.currentPrimaryAction.targetStepIndex === 'number') {
          presentationStore.selectStep(presentationStore.currentPrimaryAction.targetStepIndex)
          return
        }

        if (presentationStore.currentPrimaryAction.targetSlideId) {
          navigate(routes.slide.build(presentationStore.currentPrimaryAction.targetSlideId))
          presentationStore.clearPendingNavigation()
          return
        }

        navigate(routes.home.path)
      }}
      onSelectStep={(stepIndex) => {
        presentationStore.selectStep(stepIndex)
      }}
      onTogglePlayback={() => {
        presentationStore.togglePlayback()
      }}
    />
  )
})
