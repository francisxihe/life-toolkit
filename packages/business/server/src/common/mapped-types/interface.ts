import { Type } from "./types";

/**
 * @publicApi
 */
export interface MappedType<T> extends Type<T> {
  new (): T;
}
