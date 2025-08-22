import "reflect-metadata";
import type { RouteDef, RestHandler, RestHandlerCtx } from "./rest-router";

// --- Metadata keys ---
const CTL_PREFIX = Symbol("rest:controller:prefix");
const ROUTES = Symbol("rest:routes");
const PARAMS = Symbol("rest:params");

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RouteMeta = {
  key: string | symbol;
  method: HttpMethod;
  path?: string;
};

type ParamKind = "param" | "query" | "body";

type ParamMeta = {
  index: number;
  kind: ParamKind;
  name?: string;
};

// --- Decorators ---
export function Controller(prefix = ""): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CTL_PREFIX, normalizePrefix(prefix), target);
  };
}

function normalizePrefix(prefix: string) {
  let p = String(prefix || "");
  if (!p) return "";
  if (!p.startsWith("/")) p = "/" + p;
  if (p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function normalizePath(path?: string) {
  let p = String(path || "");
  if (!p) return "";
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}

function createMethodDecorator(method: HttpMethod) {
  return (path = ""): MethodDecorator => {
    return (target, propertyKey) => {
      const metas: RouteMeta[] = Reflect.getMetadata(ROUTES, target) || [];
      metas.push({ key: propertyKey, method, path });
      Reflect.defineMetadata(ROUTES, metas, target);
    };
  };
}

export const Get = createMethodDecorator("GET");
export const Post = createMethodDecorator("POST");
export const Put = createMethodDecorator("PUT");
export const Delete = createMethodDecorator("DELETE");

function pushParamMeta(
  target: any,
  propertyKey: string | symbol,
  meta: ParamMeta
) {
  const all: Record<string | symbol, ParamMeta[]> =
    Reflect.getMetadata(PARAMS, target) || {};
  const list = all[propertyKey] || [];
  list.push(meta);
  all[propertyKey] = list;
  Reflect.defineMetadata(PARAMS, all, target);
}

export function Param(name?: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    pushParamMeta(target, propertyKey!, {
      index: parameterIndex,
      kind: "param",
      name,
    });
  };
}

export function Query(name?: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    pushParamMeta(target, propertyKey!, {
      index: parameterIndex,
      kind: "query",
      name,
    });
  };
}

export function Body(name?: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    pushParamMeta(target, propertyKey!, {
      index: parameterIndex,
      kind: "body",
      name,
    });
  };
}

// --- Builder ---
export function buildRoutesFromControllers(
  controllers: Array<any>
): RouteDef[] {
  const routes: RouteDef[] = [];

  for (const C of controllers) {
    const instance = isConstructor(C) ? new C() : C;
    const proto = Object.getPrototypeOf(instance);

    const prefix: string = Reflect.getMetadata(CTL_PREFIX, C) || "";
    const metas: RouteMeta[] = Reflect.getMetadata(ROUTES, proto) || [];
    const paramsAll: Record<string | symbol, ParamMeta[]> =
      Reflect.getMetadata(PARAMS, proto) || {};

    for (const meta of metas) {
      const methodName = meta.key as keyof typeof instance;
      const handlerMethod: Function = instance[methodName] as any;
      if (typeof handlerMethod !== "function") continue;

      const paramMetas = (paramsAll[meta.key] || []).sort(
        (a, b) => a.index - b.index
      );

      const fullPath = (prefix || "") + normalizePath(meta.path);
      const handler: RestHandler = async (ctx: RestHandlerCtx) => {
        const args: any[] = [];
        for (const pm of paramMetas) {
          if (pm.kind === "param") {
            args[pm.index] = pm.name ? ctx.params?.[pm.name] : ctx.params;
          } else if (pm.kind === "query") {
            // 在当前实现中，query 通过 payload 透传
            const q = ctx.payload as any;
            args[pm.index] = pm.name ? q?.[pm.name] : q;
          } else if (pm.kind === "body") {
            const b = ctx.payload as any;
            args[pm.index] = pm.name ? b?.[pm.name] : b;
          }
        }
        return await handlerMethod.apply(instance, args);
      };

      routes.push({ method: meta.method, path: fullPath || "/", handler });
    }
  }

  return routes;
}

function isConstructor(fn: any): fn is new (...args: any[]) => any {
  return (
    typeof fn === "function" && fn.prototype && fn.prototype.constructor === fn
  );
}
