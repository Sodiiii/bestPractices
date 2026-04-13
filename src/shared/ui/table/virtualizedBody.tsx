import type { Column, RowData, Table as TableInstance } from '@tanstack/react-table'

import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

const VIRTUALIZED_TABLE_MIN_BOTTOM_GUTTER_PX = 56

export interface VirtualizedBodyProps<TData extends RowData = RowData> {
  table: TableInstance<TData>
  /**
   * Высота контейнера в px. По умолчанию 350.
   */
  height?: number
  /**
   * Оценка высоты строки для virtualizer. По умолчанию 36.
   */
  rowHeight?: number
  /**
   * Минимальное количество строк, после которого включается виртуализация.
   * По умолчанию 30.
   */
  virtualizeAfter?: number
  /**
   * Нужно ли измерять DOM-высоту строк в runtime.
   * Для таблиц с фиксированной высотой строк лучше выключать, чтобы не провоцировать layout thrash при скролле.
   */
  measureRows?: boolean

  classNames?: {
    tableContainer?: string
  }
}

type CellAlign = 'left' | 'center' | 'right'

interface ColumnViewMeta {
  width?: number | string
  weight?: number
  className?: string
  alignHeader?: CellAlign
  alignCell?: CellAlign
}

function getColumnViewMeta<TData extends RowData>(column: Column<TData, unknown>): ColumnViewMeta {
  return (column.columnDef.meta ?? {}) as ColumnViewMeta
}

function getColumnWidth<TData extends RowData>(column: Column<TData, unknown>): number | string | undefined {
  const meta = getColumnViewMeta(column)
  if (typeof meta.width === 'number' || typeof meta.width === 'string')
    return meta.width
  const size = column.columnDef?.size
  return typeof size === 'number' ? size : undefined
}

function getColumnWeight<TData extends RowData>(column: Column<TData, unknown>): number {
  const meta = getColumnViewMeta(column)
  const weight = Number(meta.weight)

  if (Number.isFinite(weight) && weight > 0)
    return weight

  return 1
}

function getColumnFlexStyle<TData extends RowData>(column: Column<TData, unknown>, align?: CellAlign): React.CSSProperties {
  const width = getColumnWidth(column)

  if (typeof width === 'number' && width > 0) {
    return {
      minWidth: width,
      width,
      maxWidth: width,
      flex: `0 0 ${width}px`,
      textAlign: align,
    }
  }

  if (typeof width === 'string' && width.length > 0) {
    return {
      minWidth: width,
      width,
      maxWidth: width,
      flex: '0 0 auto',
      textAlign: align,
    }
  }

  return {
    minWidth: 0,
    flex: `${getColumnWeight(column)} 1 0`,
    textAlign: align,
  }
}

/**
 * Изолированный виртуализированный TableBody.
 * - Не содержит бизнес-логики; только рендер TableHeader + виртуальные строки TableBody.
 * - Работает с любой таблицей TanStack Table той же модели строк.
 */
export function VirtualizedBody<TData extends RowData = RowData>({
  table,
  height = 350,
  rowHeight = 36,
  virtualizeAfter = 30,
  measureRows = true,
  classNames,
}: VirtualizedBodyProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const allRows = table.getRowModel().rows
  const shouldVirt = allRows.length > virtualizeAfter
  const [headerHeight, setHeaderHeight] = useState(0)
  /**
   * Вычисляет нижний запас scroll-контейнера виртуализированной таблицы.
   *
   * Алгоритм:
   * - берёт минимум 16px как базовый страховочный gutter;
   * - если строка выше, использует её высоту целиком, чтобы последняя строка могла
   *   полностью выйти в viewport и не пряталась под нижней кромкой контейнера;
   * - не влияет на фактическую высоту строк, т.к. добавляет только хвост scroll-area.
   *
   */
  const bottomGutterPx = Math.max(VIRTUALIZED_TABLE_MIN_BOTTOM_GUTTER_PX, rowHeight)

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: allRows.length,
    estimateSize: () => rowHeight,
    getScrollElement: () => parentRef.current,
    measureElement:
      measureRows && typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')
        ? el => el?.getBoundingClientRect().height
        : undefined,
    overscan: 6,
    enabled: shouldVirt,
  })

  const rows = table.getRowModel().rows
  /**
   * Замеряет высоту header отдельно от scroll-body.
   *
   * Алгоритм:
   * - берёт реальную высоту DOM-обёртки header;
   * - подписывается на `ResizeObserver`, чтобы пересчитать высоту при смене заголовков,
   *   ширины контейнера или плотности таблицы;
   * - использует это значение для вычисления высоты scrollable body.
   */
  useLayoutEffect(() => {
    const element = headerRef.current
    if (!element)
      return

    const syncHeaderHeight = () => {
      setHeaderHeight(Math.ceil(element.getBoundingClientRect().height))
    }

    syncHeaderHeight()

    const observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [table])

  /**
   * Добавляет постоянный нижний запас для виртуализированного тела таблицы.
   *
   * Алгоритм:
   * - В виртуализированном режиме берёт `rowVirtualizer.getTotalSize()`.
   * - Добавляет нижний gutter размером не меньше высоты одной строки, чтобы последняя строка не пряталась
   *   под нижней кромкой scroll-container или системным scrollbar-overlay.
   * - Не зависит от estimate size строки, поэтому визуальная плотность таблицы
   *   остаётся прежней при смене `rowHeight`.
   *
   * Сложность: O(1), т.к. использует уже вычисленный размер virtualizer.
   */
  const bodyStyle: React.CSSProperties = shouldVirt
    ? { height: `${rowVirtualizer.getTotalSize() + bottomGutterPx}px`, position: 'relative', overflow: 'visible', width: '100%', display: 'block' }
    : { position: 'relative', overflow: 'visible', width: '100%', display: 'block' }
  const scrollBodyHeight = Math.max(0, height - headerHeight)

  if (!shouldVirt) {
    return (
      <div
        ref={parentRef}
        className={cn('x-table', classNames?.tableContainer)}
        style={{
          height,
          position: 'relative',
          overflow: 'hidden auto',
        }}
      >
        <Table size="md" style={{ width: '100%' }}>
          <TableHeader style={{ width: '100%', display: 'block' }}>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} style={{ display: 'flex', width: '100%' }}>
                {hg.headers.map((h) => {
                  const meta = getColumnViewMeta(h.column)
                  return (
                    <TableHead
                      key={h.id}
                      colSpan={h.colSpan}
                      align={meta.alignHeader ?? 'left'}
                      className={meta.className}
                      style={getColumnFlexStyle(h.column, meta.alignHeader)}
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody style={{ position: 'relative', overflow: 'visible', width: '100%', display: 'block' }}>
            {rows.map(row => (
              <TableRow key={row.id} style={{ display: 'flex', width: '100%' }}>
                {row.getVisibleCells().map((cell) => {
                  const meta = getColumnViewMeta(cell.column)
                  return (
                    <TableCell
                      key={cell.id}
                      className={meta.className}
                      style={getColumnFlexStyle(cell.column, meta.alignCell)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className={cn('x-table', classNames?.tableContainer)} style={{ height, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div ref={headerRef} style={{ flex: '0 0 auto', width: '100%' }}>
        <Table size="md" style={{ width: '100%' }}>
          <TableHeader style={{ width: '100%', display: 'block' }}>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} style={{ display: 'flex', width: '100%' }}>
                {hg.headers.map((h) => {
                  const meta = getColumnViewMeta(h.column)
                  return (
                    <TableHead
                      key={h.id}
                      colSpan={h.colSpan}
                      align={meta.alignHeader ?? 'left'}
                      className={meta.className}
                      style={getColumnFlexStyle(h.column, meta.alignHeader)}
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>

      <div
        ref={parentRef}
        style={{
          flex: '1 1 auto',
          height: scrollBodyHeight,
          position: 'relative',
          overflow: 'hidden auto',
          scrollPaddingBottom: bottomGutterPx,
          minHeight: 0,
        }}
      >
        <Table size="md" style={{ width: '100%' }}>
          <TableBody style={bodyStyle}>
            {shouldVirt
              ? rowVirtualizer.getVirtualItems().map((vr) => {
                  const row = rows[vr.index]
                  return (
                    <TableRow
                      key={row.id}
                      data-index={vr.index}
                      ref={node => rowVirtualizer.measureElement(node)}
                      style={{
                        position: 'absolute',
                        left: 0,
                        transform: `translateY(${vr.start}px)`,
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = getColumnViewMeta(cell.column)
                        return (
                          <TableCell
                            key={cell.id}
                            className={meta.className}
                            style={getColumnFlexStyle(cell.column, meta.alignCell)}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              : rows.map(row => (
                  <TableRow key={row.id} style={{ display: 'flex', width: '100%' }}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = getColumnViewMeta(cell.column)
                      return (
                        <TableCell
                          key={cell.id}
                          className={meta.className}
                          style={getColumnFlexStyle(cell.column, meta.alignCell)}

                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
