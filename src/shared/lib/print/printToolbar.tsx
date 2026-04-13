import type { FC } from 'react'

import { useCallback, useState } from 'react'
import { PrinterOutlined } from '@ant-design/icons'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@tinkerbells/xenon-ui'

import type { PaperSize } from '@/shared/lib/print/printPageAsImage'

import { printPageAsImage } from '@/shared/lib/print/printPageAsImage'

import { cn } from '../classNames'
import cls from './printToolbar.module.scss'

export const PrintToolbar: FC = () => {
  const [dpdOpen, setDpdOpen] = useState(false)

  const startPrint = useCallback((paperSize: PaperSize) => {
    setDpdOpen(false)

    // 1. Открываем окно синхронно, чтобы не словить popup-blocker
    const printWindow = window.open('', 'print-preview')
    if (!printWindow) {
      // eslint-disable-next-line no-alert
      alert('Разреши всплывающие окна для этого сайта, чтобы работала печать.')
      return
    }

    // 2. Вставляем временный лоадер
    printWindow.document.open()
    printWindow.document.write(`
  <html>
    <head>
      <title>Печать…</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
        }
        body {
          display: flex;
          height: 100%;
          align-items: center;
          position: relative;
          justify-content: center;
          flex-direction: column;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f5f5f5;
        }
        .loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: absolute;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid #ccc;
          border-top-color: #1890ff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .loader-text {
          font-size: 14px;
          color: #555;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .progress {
          width: 220px;
          height: 6px;
          border-radius: 999px;
          background: #e5e5e5;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          width: 0;
          border-radius: 999px;
          background: #1890ff;
          transition: width 0.25s ease;
        }
        .progress-label {
          font-size: 12px;
          color: #777;
        }

        .edit {
          position: absolute;
          bottom: 40px;
          left: 50%;
          translate: -50% 0;
        }
      </style>
    </head>
    <body>
      <div class="loader-wrapper">
        <!-- <div class="spinner"></div> -->
        <div class="loader-text">
          <div>Готовим страницу к печати (${paperSize})…</div>
          <div class="progress">
            <div class="progress-bar" id="print-progress-bar"></div>
          </div>
          <div class="progress-label" id="print-progress-label">
            Подготовка…
          </div>
        </div>
      </div>
      <sub class="edit">Пожалуйста, подождите, это может занять некоторое время</sub>

    </body>
  </html>
`)
    printWindow.document.close()

    // 3. Асинхронно готовим скрин и подменяем содержимое вкладки
    void printPageAsImage({
      rootSelector: '#root',
      paperSize, // 'A4' или 'A3'
      orientation: 'landscape',
      scale: 2,
      targetWindow: printWindow,
      windowTitle: `Печать (${paperSize})`,
    })
  }, [])

  return (
    <Dropdown open={dpdOpen} onOpenChange={o => setDpdOpen(o)} offset={8}>
      <DropdownTrigger asChild className={cn(cls.dropdownBtn, { [cls.dropdownOpen]: dpdOpen })} data-print-hidden>
        <Button variant="ghost">
          <PrinterOutlined />
        </Button>
      </DropdownTrigger>

      <DropdownContent>

        <DropdownItem

          style={{ justifyContent: 'flex-start' }}
          onClick={() => startPrint('A4')}
        >
          Формат A4
        </DropdownItem>

        <DropdownItem
          style={{ justifyContent: 'flex-start', marginTop: 4 }}
          onClick={() => startPrint('A3')}
        >
          Формат A3
        </DropdownItem>

      </DropdownContent>
    </Dropdown>
  )
}
