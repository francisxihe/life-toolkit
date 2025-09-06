import {
  inheritPropertyInitializers,
  inheritValidationMetadata,
  inheritTransformationMetadata,
} from "./helpers";
import { RemoveFieldsWithType, Type } from "./types";
import { MappedType } from "./interface";

export function OmitType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[]
) {
  const isInheritedPredicate = (propertyKey: string) =>
    !keys.includes(propertyKey as K);

  abstract class OmitClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef, isInheritedPredicate);
    }
  }

  inheritValidationMetadata(classRef, OmitClassType, isInheritedPredicate);
  inheritTransformationMetadata(classRef, OmitClassType, isInheritedPredicate);

  return OmitClassType as MappedType<
    RemoveFieldsWithType<Omit<T, (typeof keys)[number]>, Function>
  >;
}
