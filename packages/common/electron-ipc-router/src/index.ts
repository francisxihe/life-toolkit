export { registerIpcHandlers } from "./ipc-handlers";
export type { RegisterIpcHandlersOptions } from "./ipc-handlers";

export type { RouteDef, RestHandler, RestHandlerCtx } from "./rest-router";

export {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  buildRoutesFromControllers,
} from "./rest-decorators";

export type { HttpMethod } from "./rest-decorators";
