import type { FC } from 'react'
import type { Color, MenuProps } from '@tinkerbells/xenon-ui'

import { Dropdown } from 'antd'
import { useMemo, useState } from 'react'
import { DownOutlined } from '@ant-design/icons'
import { Button, ColorPicker } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'
import { resolveColorString } from '@/shared/lib/helpers/colorHelpers'
import { chartsColorPalette } from '@/shared/lib/constants/chartsColorPalette'

import cls from './selectColorPicker.module.scss'
import { availableColors } from './availableColors'

interface selectColorPickerProps {
  className?: string
  colors?: { color: string, label: string }[]
  value?: string
  defaultValue?: string
  onChange: (color: string) => void
  onClear?: () => void

}

function toPickerColor(color?: string): string {
  if (!color)
    return ''
  return resolveColorString(color) || color
}

export const SelectColorPicker: FC<selectColorPickerProps> = ({ className, colors, onChange, defaultValue, value, onClear }) => {
  const isControlled = value !== undefined
  const [internalColor, setInternalColor] = useState<string>(toPickerColor(defaultValue))
  const [open, setOpen] = useState(false)

  const currentColor = isControlled ? toPickerColor(value) : internalColor

  const updateColor = (newColor: string, pickerColor?: string) => {
    if (!isControlled) {
      setInternalColor(pickerColor ?? toPickerColor(newColor))
    }
    onChange(newColor)
  }

  const handleColorChange = (newColor: Color) => {
    const hexColor = newColor.toHexString()
    updateColor(hexColor, hexColor)
  }

  const handlePresetSelect = (presetColor: string) => {
    updateColor(presetColor, toPickerColor(presetColor))
    setOpen(false)
  }

  const items: MenuProps['items'] = useMemo(() => (colors || [...availableColors, ...chartsColorPalette]).map(c => ({
    key: c.color,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            backgroundColor: c.color,
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '1px solid #ccc',
          }}
        />
        {c.label}
      </div>
    ),
    onClick: () => handlePresetSelect(c.color),
  })), [colors])

  return (
    <div className={cn(cls.selectColorPicker, className)} data-keep-open>
      <ColorPicker value={currentColor} onChangeComplete={handleColorChange} onClear={onClear} />

      <Dropdown
        menu={{ items }}
        trigger={['click']}
        open={open}
        onOpenChange={setOpen}
      >
        <Button className={cls.btn} onClick={e => e.preventDefault()}><DownOutlined /></Button>
      </Dropdown>
    </div>
  )
}
