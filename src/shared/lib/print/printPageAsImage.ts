import html2canvas from 'html2canvas'

import { PRINT_CSS_VAR_OVERRIDES } from './printCssVarOverrides'

export type PaperSize = 'A4' | 'A3'
export type PaperOrientation = 'portrait' | 'landscape'

export interface VirtualViewport {
  width: number
  height: number
}

/**
 * Как показывать картинку в окне печати:
 * - contain: целиком влезает на страницу (без обрезки)
 * - cover: заполняет страницу, может обрезать по краям
 * - fill: растягивает по ширине/высоте (может исказить пропорции)
 */
export type PrintImageFit = 'contain' | 'cover' | 'fill'

async function waitForAnimationsAndTransitions(timeoutMs: number) {
  return new Promise<void>((resolve) => {
    const doc = document
    let active = 0
    const start = performance.now()

    const inc = () => {
      active += 1
    }
    const dec = () => {
      active = Math.max(0, active - 1)
    }

    const onTransitionRun = () => inc()
    const onTransitionStart = () => inc()
    const onAnimationStart = () => inc()

    const onTransitionEnd = () => dec()
    const onTransitionCancel = () => dec()
    const onAnimationEnd = () => dec()
    const onAnimationCancel = () => dec()

    function cleanup() {
      doc.removeEventListener('transitionrun', onTransitionRun)
      doc.removeEventListener('transitionstart', onTransitionStart)
      doc.removeEventListener('animationstart', onAnimationStart)
      doc.removeEventListener('transitionend', onTransitionEnd)
      doc.removeEventListener('transitioncancel', onTransitionCancel)
      doc.removeEventListener('animationend', onAnimationEnd)
      doc.removeEventListener('animationcancel', onAnimationCancel)
    }

    doc.addEventListener('transitionrun', onTransitionRun)
    doc.addEventListener('transitionstart', onTransitionStart)
    doc.addEventListener('animationstart', onAnimationStart)
    doc.addEventListener('transitionend', onTransitionEnd)
    doc.addEventListener('transitioncancel', onTransitionCancel)
    doc.addEventListener('animationend', onAnimationEnd)
    doc.addEventListener('animationcancel', onAnimationCancel)

    function check() {
      const elapsed = performance.now() - start

      // либо все анимации закончились, либо таймаут
      if (active === 0 || elapsed >= timeoutMs) {
        cleanup()
        resolve()
        return
      }

      requestAnimationFrame(check)
    }

    check()
  })
}

function updateLoaderProgress(
  targetWindow: Window | null | undefined,
  percent: number,
  text?: string,
) {
  if (!targetWindow)
    return

  try {
    const doc = targetWindow.document
    const bar = doc.getElementById('print-progress-bar') as HTMLDivElement | null
    const label = doc.getElementById('print-progress-label') as HTMLDivElement | null

    if (bar) {
      const safe = Math.max(0, Math.min(100, percent))
      bar.style.width = `${safe}%`
    }
    if (label && typeof text === 'string') {
      label.textContent = text
    }
  }
  catch {
    // окно могло уже закрыться, игнорируем
  }
}

interface CropCanvasOptions {
  enabled?: boolean
  padding?: number
  whiteThreshold?: number
  alphaThreshold?: number
}

interface Options {
  rootSelector?: string
  paperSize?: PaperSize
  orientation?: PaperOrientation
  scale?: number
  targetWindow?: Window | null
  windowTitle?: string
  /** Класс, который навешивается на <body> только на время создания скрина */
  bodyPrintClass?: string
  /** Минимальная задержка перед снимком (мс), чтобы дать доанимироваться UI */
  waitBeforeScreenshotMs?: number
  /** Количество кадров rAF для стабилизации лэйаута */
  stabilizationFrames?: number
  /** Переопределения CSS-переменных на время печати */
  cssVarOverrides?: Record<string, string>

  /** Виртуальный viewport (только в cloned DOM) */
  virtualViewport?: VirtualViewport

  /** Кроп результата (по контенту) */
  crop?: CropCanvasOptions

  /** “Растягивание” картинки в окне печати */
  imageFit?: PrintImageFit
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function waitForStabilization(
  _frames: number,
  extraDelayMs: number,
) {
  // (у тебя закомментировано ожидание кадров — оставляю как было)
  // for (let i = 0; i < frames; i += 1) {
  //   await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  // }

  if (extraDelayMs > 0) {
    await sleep(extraDelayMs)
  }
}

/* -------------------------------------------------------------------------------------------------
 * Virtual viewport helpers (только для cloned DOM)
 * ------------------------------------------------------------------------------------------------- */

function ensureBaseTag(clonedDoc: Document) {
  if (clonedDoc.head.querySelector('base'))
    return
  const base = clonedDoc.createElement('base')
  base.href = document.baseURI
  clonedDoc.head.prepend(base)
}

function applyVirtualViewport(
  clonedDoc: Document,
  rootSelector: string,
  vp?: VirtualViewport,
) {
  if (!vp)
    return

  const html = clonedDoc.documentElement
  const body = clonedDoc.body

  html.style.width = `${vp.width}px`
  html.style.height = `${vp.height}px`
  body.style.width = `${vp.width}px`
  body.style.height = `${vp.height}px`

  // чтобы не появлялся скроллбар (он меняет layout)
  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'

  const clonedRoot = clonedDoc.querySelector(rootSelector) as HTMLElement | null
  if (clonedRoot) {
    clonedRoot.style.width = `${vp.width}px`
    clonedRoot.style.height = `${vp.height}px`
    clonedRoot.style.overflow = 'hidden'
  }
}

/* -------------------------------------------------------------------------------------------------
 * Crop canvas to content
 * ------------------------------------------------------------------------------------------------- */

function cropCanvasToContent(
  src: HTMLCanvasElement,
  {
    padding = 16,
    whiteThreshold = 250, // 255 = чисто белый, 250 = чуть строже
    alphaThreshold = 5,
  }: {
    padding?: number
    whiteThreshold?: number
    alphaThreshold?: number
  } = {},
) {
  const ctx = src.getContext('2d', { willReadFrequently: true })
  if (!ctx)
    return src

  const w = src.width
  const h = src.height
  const data = ctx.getImageData(0, 0, w, h).data

  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // контент = не прозрачное и не (почти) белое
      if (a > alphaThreshold && (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold)) {
        if (x < minX)
          minX = x
        if (y < minY)
          minY = y
        if (x > maxX)
          maxX = x
        if (y > maxY)
          maxY = y
      }
    }
  }

  if (maxX < 0 || maxY < 0)
    return src

  const x0 = Math.max(0, minX - padding)
  const y0 = Math.max(0, minY - padding)
  const x1 = Math.min(w - 1, maxX + padding)
  const y1 = Math.min(h - 1, maxY + padding)

  const outW = x1 - x0 + 1
  const outH = y1 - y0 + 1

  const out = document.createElement('canvas')
  out.width = outW
  out.height = outH

  const outCtx = out.getContext('2d')
  if (!outCtx)
    return src

  // белый фон (печать без “прозрачности”)
  outCtx.fillStyle = '#ffffff'
  outCtx.fillRect(0, 0, outW, outH)

  outCtx.drawImage(src, x0, y0, outW, outH, 0, 0, outW, outH)

  return out
}

/* -------------------------------------------------------------------------------------------------
 * Print window
 * ------------------------------------------------------------------------------------------------- */

function openPrintWindowWithImage(params: {
  dataUrl: string
  paperSize: PaperSize
  orientation: PaperOrientation
  windowTitle: string
  targetWindow?: Window | null
  imageFit: PrintImageFit
}) {
  const { dataUrl, paperSize, orientation, windowTitle, targetWindow, imageFit } = params
  const printWindow = targetWindow ?? window.open('', '_blank')
  if (!printWindow)
    return

  // object-fit: fill/contain/cover
  const fitCss = imageFit

  printWindow.document.open()
  printWindow.document.write(`
    <html>
      <head>
        <title>${windowTitle}</title>
        <style>
          @page { size: ${paperSize} ${orientation}; margin: 0; }
          html, body { margin: 0; padding: 0; height: 100%; background: #fff; }
          body { display: flex; align-items: center; justify-content: center; }

          /* Растягиваем под размер страницы/окна */
          img {
            width: 100vw;
            height: 100vh;
            object-fit: ${fitCss};
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" />
        <script>
          (function () {
            function triggerPrint() { window.focus(); window.print(); }

            if ('onafterprint' in window) {
              window.onafterprint = function () { window.close(); };
            } else if (window.matchMedia) {
              var mediaQueryList = window.matchMedia('print');
              mediaQueryList.addListener(function (mql) {
                if (!mql.matches) window.close();
              });
            }

            var img = document.querySelector('img');
            if (!img) { setTimeout(triggerPrint, 50); return; }
            if (img.complete) { setTimeout(triggerPrint, 50); }
            else {
              img.onload = function () { setTimeout(triggerPrint, 50); };
              img.onerror = function () { setTimeout(triggerPrint, 50); };
            }
          })();
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

/* -------------------------------------------------------------------------------------------------
 * Main
 * ------------------------------------------------------------------------------------------------- */

/**
 * всё, что помечено className="print-hidden" или data-print-hidden="true", не попадёт в скрин;
 * для управления css свойствами использовать селектор body.${bodyPrintClass}
 */
export async function printPageAsImage({
  rootSelector = '#root',
  paperSize = 'A4',
  orientation = 'landscape',
  scale = 2,
  targetWindow,
  windowTitle = 'Печать…',
  bodyPrintClass = 'printing',
  waitBeforeScreenshotMs = 1500,
  stabilizationFrames = 3, // 2–3 кадра обычно достаточно
  cssVarOverrides,
  virtualViewport,

  crop,
  imageFit = 'contain',
}: Options = {}) {
  if (typeof document === 'undefined')
    return

  const root = document.querySelector(rootSelector) as HTMLElement | null
  if (!root)
    return

  // Кого считаем "хостами" переменных: <html> + все элементы с .tokens
  const varHosts = new Set<HTMLElement>()
  varHosts.add(document.documentElement) // <html>
  document.querySelectorAll<HTMLElement>('.tokens').forEach((el) => {
    varHosts.add(el)
  })

  const effectiveOverrides: Record<string, string> | undefined
    = cssVarOverrides ?? PRINT_CSS_VAR_OVERRIDES

  const overriddenVars: { host: HTMLElement, name: string, prevInline: string }[] = []

  try {
    // 0. Навешиваем спец-класс на body
    const body = document.body
    if (bodyPrintClass)
      body.classList.add(bodyPrintClass)

    // 0.0. Применяем переопределения CSS-переменных НА ВСЕХ varHosts
    if (effectiveOverrides) {
      for (const host of varHosts) {
        for (const [name, value] of Object.entries(effectiveOverrides)) {
          const prevInline = host.style.getPropertyValue(name)
          overriddenVars.push({ host, name, prevInline })
          host.style.setProperty(name, value)
        }
      }
    }

    // 0.1. Скрываем элементы, помеченные как "не печатать"
    const hiddenNodes = Array.from(
      document.querySelectorAll<HTMLElement>('.print-hidden, [data-print-hidden="true"]'),
    )
    const prevVisibility = hiddenNodes.map(el => el.style.display)
    hiddenNodes.forEach((el) => {
      el.style.display = 'none'
    })

    updateLoaderProgress(targetWindow, 5, 'Подготовка графиков…')

    // 2) ждём анимации
    updateLoaderProgress(targetWindow, 25, 'Ожидание завершения анимаций…')
    await waitForAnimationsAndTransitions(1000)

    // 3) стабилизация
    updateLoaderProgress(targetWindow, 45, 'Фиксация макета страницы…')
    await waitForStabilization(stabilizationFrames, waitBeforeScreenshotMs)

    // 4) готовим скрин
    const prevHeight = root.style.height
    const prevOverflow = root.style.overflow

    root.style.height = 'auto'
    root.style.overflow = 'visible'

    const rect = root.getBoundingClientRect()

    // virtual viewport: размеры захвата + windowWidth/windowHeight
    const captureWidth = virtualViewport?.width ?? rect.width
    const captureHeight = virtualViewport?.height ?? rect.height

    const windowWidth = virtualViewport?.width ?? document.documentElement.clientWidth
    const windowHeight = virtualViewport?.height ?? document.documentElement.clientHeight

    updateLoaderProgress(targetWindow, 65, 'Создание снимка страницы…')

    const rawCanvas = await html2canvas(root, {
      scale,
      width: captureWidth,
      height: captureHeight,
      useCORS: true,

      scrollX: window.scrollX,
      scrollY: window.scrollY,

      windowWidth,
      windowHeight,

      onclone: (clonedDoc) => {
        ensureBaseTag(clonedDoc)

        if (bodyPrintClass)
          clonedDoc.body.classList.add(bodyPrintClass)

        applyVirtualViewport(clonedDoc, rootSelector, virtualViewport)
      },
    })

    updateLoaderProgress(targetWindow, 80, 'Пост-обработка изображения…')

    // 5) Кроп (опционально)
    const cropEnabled = crop?.enabled ?? true
    const finalCanvas = cropEnabled
      ? cropCanvasToContent(rawCanvas, {
          padding: crop?.padding ?? 24,
          whiteThreshold: crop?.whiteThreshold ?? 252,
          alphaThreshold: crop?.alphaThreshold ?? 5,
        })
      : rawCanvas

    updateLoaderProgress(targetWindow, 90, 'Подготовка печати…')

    // откатываем root
    root.style.height = prevHeight
    root.style.overflow = prevOverflow

    // возвращаем скрытые элементы
    hiddenNodes.forEach((el, i) => {
      el.style.display = prevVisibility[i]
    })

    if (bodyPrintClass)
      body.classList.remove(bodyPrintClass)

    const dataUrl = finalCanvas.toDataURL('image/png')

    // печать
    const printWindow = targetWindow ?? window.open('', '_blank')
    if (!printWindow)
      return

    updateLoaderProgress(printWindow, 100, 'Готово! Открываем диалог печати…')

    openPrintWindowWithImage({
      dataUrl,
      paperSize,
      orientation,
      windowTitle,
      targetWindow: printWindow,
      imageFit,
    })
  }
  catch (e) {
    console.log(e)
  }
  finally {
    // В ЛЮБОМ случае откатываем CSS-переменные
    for (const { host, name, prevInline } of overriddenVars) {
      if (prevInline && prevInline.trim() !== '') {
        host.style.setProperty(name, prevInline)
      }
      else {
        host.style.removeProperty(name)
      }
    }
  }
}
