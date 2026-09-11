import { AiPlatformError } from '../ai-error';

export type ResolvedEntity = {
  type: string;
  id: string;
  name: string;
};

export type EntityResolver = {
  type: string;
  resolve(id: string): Promise<ResolvedEntity>;
};

export class EntityResolverRegistry {
  private readonly resolvers = new Map<string, EntityResolver>();

  register(resolver: EntityResolver) {
    if (this.resolvers.has(resolver.type)) {
      throw new Error(`重复注册实体解析器: ${resolver.type}`);
    }
    this.resolvers.set(resolver.type, resolver);
  }

  async resolve(type: string, id: string): Promise<ResolvedEntity> {
    const resolver = this.resolvers.get(type);
    if (!resolver) {
      throw AiPlatformError.internal(`未知实体类型: ${type}`);
    }
    return resolver.resolve(id);
  }
}

export const entityResolverRegistry = new EntityResolverRegistry();
