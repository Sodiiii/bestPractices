import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import { useController } from 'react-hook-form'
import { Form as $Form } from '@tinkerbells/xenon-ui'
import { Children, cloneElement, isValidElement, useEffect } from 'react'

type $FormItemProps = React.ComponentProps<typeof $Form.Item>
interface FormChildProps {
  onChange?: (...values: unknown[]) => void
  onBlur?: () => void
}

export type FormItemProps<TFieldValues extends FieldValues = FieldValues> = {
  children: React.ReactNode
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  disabled?: boolean
  overrideFieldOnChange?: (...values: unknown[]) => void
} & Omit<$FormItemProps, 'name' | 'rules' | 'validateStatus'>

export function FormItem<TFieldValues extends FieldValues = FieldValues>({
  children,
  control,
  name,
  disabled,
  help,
  valuePropName,
  overrideFieldOnChange,
  ...props
}: FormItemProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, disabled })
  const form = $Form.useFormInstance()

  useEffect(() => {
    form.setFieldValue(name, field.value)
  }, [field.value, form, name])

  return (
    <$Form.Item
      {...props}
      name={name as string}
      initialValue={field.value}
      validateStatus={fieldState.invalid ? 'error' : undefined}
      help={fieldState.error?.message ?? help}
    >
      {Children.map(
        children,
        (child) => {
          if (!isValidElement<FormChildProps>(child))
            return child

          const childProps: Record<string, unknown> = {
            ...field,
            onChange: (...params: unknown[]) => {
              child.props.onChange?.(...params)
              overrideFieldOnChange
                ? overrideFieldOnChange(...params)
                : field.onChange(...params)
            },
            onBlur: () => {
              child.props.onBlur?.()
              field.onBlur()
            },
          }

          if (valuePropName) {
            childProps[valuePropName] = field.value
          }

          return cloneElement(child, childProps)
        },
      )}
    </$Form.Item>
  )
}
