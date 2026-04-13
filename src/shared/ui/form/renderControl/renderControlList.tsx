import React from 'react'
import { observer } from 'mobx-react'

import { cn } from '@/shared/lib/classNames'

import type { UiControlSchema } from './config/control.types'

import cls from './renderControl.module.scss'
import { renderControl } from './renderControl'

type Getter = (key: string, fallback?: unknown) => unknown
type Setter = (key: string, value: unknown) => void

interface Props {
  items: UiControlSchema[]
  getValue: Getter
  setValue: Setter
  /** Включить группировку по .group (по умолчанию true) */
  groupBy?: boolean
  classNames?: {
    groupClassName?: string
    labelAboveClassName?: string
    controlClassName?: string
  }
}

export const RenderControlsList: React.FC<Props> = observer(({ items, getValue, setValue, groupBy = true, classNames }) => {
  if (!items?.length)
    return null

  const values: Record<string, unknown> = {}
  for (const item of items) {
    values[item.key] = getValue(item.key, item.default)
  }

  const visibleItems = items.filter((item) => {
    if (!item.visibleWhen)
      return true
    try {
      return item.visibleWhen(values)
    }
    catch {
      return true
    }
  })

  if (!visibleItems.length)
    return null

  const renderSimpleControl = (item: UiControlSchema) => (
    <div
      key={item.key}
      className={cn(cls.controlItem, classNames?.controlClassName)}
      style={item.span && item.span > 1 ? { gridColumn: `span ${item.span}` } : undefined}
    >
      {item.labelAbove && <div className={cn(cls.labelAbove, classNames?.labelAboveClassName)}>{item.labelAbove}</div>}
      {renderControl({
        item,
        modelValue: getValue(item.key, item.default),
        onChange: setValue,
      })}
    </div>
  )

  const renderTableBlock = (tableItems: UiControlSchema[], blockKey: string) => {
    if (!tableItems.length)
      return null

    const rows: string[] = []
    const columns: string[] = []
    const cells = new Map<string, UiControlSchema>()

    for (const item of tableItems) {
      const meta = item.table
      if (!meta)
        continue

      if (!rows.includes(meta.row))
        rows.push(meta.row)
      if (!columns.includes(meta.column))
        columns.push(meta.column)

      cells.set(`${meta.row}:::${meta.column}`, item)
    }

    return (
      <div className={cn(cls.tableBlock, 'renderControl-table')} key={blockKey}>
        <table className={cls.settingsTable}>
          <thead>
            <tr>
              <th className={cls.settingsTableCorner} />
              {columns.map(column => (
                <th key={`${blockKey}-column-${column}`} className={cls.settingsTableColumnHeader}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={`${blockKey}-row-${row}`}>
                <th className={cls.settingsTableRowHeader}>{row}</th>
                {columns.map((column) => {
                  const cell = cells.get(`${row}:::${column}`)
                  return (
                    <td key={`${blockKey}-cell-${row}-${column}`} className={cls.settingsTableCell}>
                      {cell
                        ? renderControl({
                            item: cell,
                            modelValue: getValue(cell.key, cell.default),
                            onChange: setValue,
                            hideLabel: true,
                          })
                        : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderControls = (controls: UiControlSchema[], blockPrefix: string) => {
    const result: React.ReactNode[] = []
    let index = 0

    while (index < controls.length) {
      const current = controls[index]
      const table = current.table

      if (!table) {
        result.push(renderSimpleControl(current))
        index += 1
        continue
      }

      const start = index
      while (index < controls.length && controls[index].table?.id === table.id)
        index += 1

      const block = controls.slice(start, index)
      const blockLabel = block.find(item => item.labelAbove)?.labelAbove
      if (blockLabel) {
        result.push(
          <div className={cn(cls.labelAbove, classNames?.labelAboveClassName)} key={`${blockPrefix}-label-${start}`}>
            {blockLabel}
          </div>,
        )
      }

      result.push(renderTableBlock(block, `${blockPrefix}-table-${table.id}-${start}`))
    }

    return result
  }

  if (!groupBy) {
    return <>{renderControls(visibleItems, 'ungrouped')}</>
  }

  // группируем
  const groups = new Map<string, UiControlSchema[]>()
  for (const it of visibleItems) {
    const g = it.group ?? 'default'
    if (!groups.has(g))
      groups.set(g, [])
    groups.get(g)!.push(it)
  }

  return (
    <>
      {[...groups.entries()].map(([g, controls]) => (
        <div key={g} className={classNames?.groupClassName}>
          {renderControls(controls, `group-${g}`)}
        </div>
      ))}
    </>
  )
})
