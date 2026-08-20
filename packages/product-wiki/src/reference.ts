import type { ProductReferenceId } from './references.generated';

export type ProductRef = ProductReferenceId;

export function productRef(reference: ProductReferenceId): ProductRef {
  return reference;
}
