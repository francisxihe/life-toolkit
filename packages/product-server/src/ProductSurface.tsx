import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { mergeProductRefAttribute, type ProductSurfaceHostProps } from './product-ref-attr';

type ProductSurfaceProps = {
  id: string;
  children: ReactNode;
};

export function ProductSurface({ id, children }: ProductSurfaceProps) {
  if (!import.meta.env.DEV) return children;

  const child = Children.only(children);
  if (!isValidElement(child)) return children;

  const element = child as ReactElement<ProductSurfaceHostProps>;
  return cloneElement(element, {
    'data-product-ref': mergeProductRefAttribute(element.props['data-product-ref'], id),
  });
}
