import type { z } from 'zod'
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type UseZoodHookForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = {
  schema?: z.ZodType<TTransformedValues>
} & Omit<UseFormProps<TFieldValues, TContext, TTransformedValues>, 'resolver'>

export function useZodHookForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({
  schema,
  ...rest
}: UseZoodHookForm<TFieldValues, TContext, TTransformedValues>): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  return useForm<TFieldValues, TContext, TTransformedValues>({
    // TODO: поправить as any
    resolver: schema ? zodResolver(schema as any) : undefined,
    ...rest,
  })
}
