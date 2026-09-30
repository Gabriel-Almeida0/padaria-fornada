import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type Props<T extends ElementType> = {
  as?: T
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

/** Largura máxima de 1120px com gutter de 20px (mobile) e 32px (≥ md). */
export function Container<T extends ElementType = 'div'>({ as, className = '', children, ...resto }: Props<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag className={`mx-auto w-full max-w-(--maxw) px-5 md:px-8 ${className}`} {...resto}>
      {children}
    </Tag>
  )
}
