import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import { useController } from 'react-hook-form'
import { Form as $Form } from '@tinkerbells/xenon-ui'
import { Children, cloneElement, isValidElement, useEffect } from 'react'

type $FormItemProps = React.ComponentProps<typeof $Form.Item>

export type FormItemProps<TFieldValues extends FieldValues = FieldValues> = {
  children: React.ReactNode
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  disabled?: boolean
  overrideFieldOnChange?: (...values: any[]) => void
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
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      name={name}
      initialValue={field.value}
      validateStatus={fieldState.invalid ? 'error' : undefined}
      help={fieldState.error?.message ?? help}
    >
      {Children.map(
        children,
        child =>
          isValidElement(child)
          && cloneElement(child, {
            ...field,
            // @ts-expect-error onChange type safe is not necessary here
            onChange: (...params) => {
              child.props.onChange && child.props.onChange(...params)
              overrideFieldOnChange
                ? overrideFieldOnChange(...params)
                : field.onChange(...params)
            },
            onBlur: () => {
              child.props.onBlur && child.props.onBlur()
              field.onBlur()
            },
            ...(valuePropName && {
              [valuePropName]: field.value,
            }),
          }),
      )}
    </$Form.Item>
  )
}
