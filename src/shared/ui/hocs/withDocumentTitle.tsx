import type {
  ComponentProps,
  ComponentRef,
  ComponentType,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react'

import {
  createElement,
  forwardRef,
  useEffect,
} from 'react'

import { useDocumentTitle } from '@/shared/lib/hooks/useDocumentTitle'

export function withDocumentTitle<T extends ComponentType<any>>(
  WrappedComponent: T,
  options: { title: string },
): ForwardRefExoticComponent<
  PropsWithoutRef<ComponentProps<T>> & RefAttributes<ComponentRef<T>>
> {
  const Wrapped = forwardRef<ComponentRef<T>, ComponentProps<T>>(
    (props, ref) => {
      const { set } = useDocumentTitle()

      useEffect(() => {
        set(options.title)
      }, [set])

      return createElement(WrappedComponent, { ...props, ref })
    },
  )

  const wrappedComponentName
    = WrappedComponent.displayName || WrappedComponent.name || 'Unknown'
  Wrapped.displayName = `withDocumentTitle(${wrappedComponentName})`

  return Wrapped
}
