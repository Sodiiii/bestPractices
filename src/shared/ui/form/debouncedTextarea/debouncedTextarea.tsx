import type { TextareaHTMLAttributes } from 'react'

import { useEffect } from 'react'

import { cn } from '@/shared/lib/classNames'
import { useDebouncedInput } from '@/shared/lib/hooks/useDebounceInput'

import cls from './debouncedTextarea.module.scss'

type DebouncedTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  value: string
  onChange: (value: string) => void
  delay?: number
}

export function DebouncedTextarea({
  value,
  className,
  onChange,
  delay = 300,
  ...props
}: DebouncedTextareaProps) {
  const [realValue, setRealValue, debouncedValue] = useDebouncedInput(value, delay)

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue])

  return (
    <textarea
      className={cn(cls.debouncedTextarea, className)}
      {...props}
      value={realValue}
      onChange={e => setRealValue(e.target.value)}
    />
  )
}
