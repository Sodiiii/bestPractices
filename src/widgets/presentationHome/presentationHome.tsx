import type { CSSProperties } from 'react'

import { motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { RightOutlined } from '@ant-design/icons'

import type {
  PresentationHomeCardConfig,
  PresentationHomeCardImageLayout,
} from '@/entities/presentation/model/types'

import { routes } from '@/shared/routes'
import { getPresentationSlideById, presentationDeckConfig, presentationLogoPath, resolvePresentationAssetPath } from '@/entities/presentation'

import cls from './presentationHome.module.scss'

function getSlideCardClass(homeCard: PresentationHomeCardConfig) {
  if (homeCard.size === 'compact') {
    return cls.cardCompact
  }

  return cls.cardWide
}

function getCardImageLayoutClass(imageLayout?: PresentationHomeCardImageLayout) {
  switch (imageLayout?.variant) {
    case 'bottomLeft':
      return cls.cardImageLayoutBottomLeft
    case 'bottomCenter':
      return cls.cardImageLayoutBottomCenter
    case 'bottomRight':
      return cls.cardImageLayoutBottomRight
    case 'center':
      return cls.cardImageLayoutCenter
    case 'left':
      return cls.cardImageLayoutLeft
    case 'bottom':
      return cls.cardImageLayoutBottom
    case 'right':
      return cls.cardImageLayoutRight
    default:
      return cls.cardImageLayoutCenter
  }
}

function getCardPositionClass(index: number) {
  if (index === 0) {
    return cls.cardTopLeft
  }

  if (index === 1) {
    return cls.cardTopRight
  }

  if (index === 2) {
    return cls.cardBottomWide
  }

  return cls.cardBottomCompact
}

export function PresentationHome() {
  const navigate = useNavigate()
  const featuredSlide = getPresentationSlideById(presentationDeckConfig.sections[0]?.startSlideId ?? '')

  return (
    <section className={cls.home}>
      <div className={cls.backdrop} />
      <div className={cls.gridOverlay} />

      <div className={cls.content}>
        <motion.article
          className={cls.heroCard}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <img className={cls.heroLogo} src={presentationLogoPath} alt="Логотип Газпром Информ" />

          <h1 className={cls.heroTitle}>{presentationDeckConfig.title}</h1>
          <p className={cls.heroSubtitle}>{presentationDeckConfig.subtitle}</p>

          <div className={cls.heroFooter}>
            <div className={cls.leadCaption}>{presentationDeckConfig.leadCaption}</div>

            <button
              type="button"
              className={cls.heroCta}
              onClick={() => {
                if (!featuredSlide) {
                  return
                }

                navigate(routes.slide.build(featuredSlide.id))
              }}
            >
              <span className={cls.heroCtaIcon}>▶</span>
              Смотреть
            </button>
          </div>
        </motion.article>

        <div className={cls.cards}>
          {presentationDeckConfig.sections.map((section, index) => {
            const slide = getPresentationSlideById(section.startSlideId)
            if (!slide) {
              return null
            }

            return (
              <motion.button
                key={section.id}
                type="button"
                className={`${cls.card} ${getSlideCardClass(slide.homeCard)} ${getCardPositionClass(index)}`}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
                onClick={() => navigate(routes.slide.build(slide.id))}
              >
                <div className={cls.cardTitleRow}>
                  <h2 className={cls.cardTitle}>{section.title}</h2>
                  <span className={cls.cardArrow}><RightOutlined /></span>
                </div>

                <div className={cls.cardImageWrap}>
                  {slide.homeCard.imagePath && (
                    <img
                      className={`${cls.cardImage} ${getCardImageLayoutClass(slide.homeCard.imageLayout)}`}
                      src={resolvePresentationAssetPath(slide.homeCard.imagePath)}
                      alt={section.title}
                      style={{
                        '--home-card-image-scale': slide.homeCard.imageLayout?.scale ?? 1,
                        '--home-card-image-offset-x': `${slide.homeCard.imageLayout?.offsetX ?? 0}px`,
                        '--home-card-image-offset-y': `${slide.homeCard.imageLayout?.offsetY ?? 0}px`,
                        '--home-card-image-rotate': `${slide.homeCard.imageLayout?.rotateDeg ?? 0}deg`,
                      } as CSSProperties}
                    />
                  )}
                </div>

              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
