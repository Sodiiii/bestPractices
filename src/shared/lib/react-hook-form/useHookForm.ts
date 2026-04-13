import type { z } from 'zod'
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface UseZodHookFormOptions<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<UseFormProps<TFieldValues, TContext>, 'resolver'> {
  schema?: z.ZodType<TFieldValues, TFieldValues>
}

export function useZodHookForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  schema,
  ...rest
}: UseZodHookFormOptions<TFieldValues, TContext>): UseFormReturn<TFieldValues, TContext> {
  const resolver = schema ? zodResolver(schema) : undefined

  return useForm<TFieldValues, TContext>({
    ...rest,
    resolver: resolver as UseFormProps<TFieldValues, TContext>['resolver'],
  })
}
