export type AiCapability<I = unknown, O = unknown> = {
  key: string;
  execute(input: I): Promise<O>;
};

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, AiCapability>();

  register(capability: AiCapability) {
    if (this.capabilities.has(capability.key)) {
      throw new Error(`重复注册 capability: ${capability.key}`);
    }
    this.capabilities.set(capability.key, capability);
  }

  get<I = unknown, O = unknown>(key: string): AiCapability<I, O> {
    const capability = this.capabilities.get(key);
    if (!capability) {
      throw new Error(`未知 capability: ${key}`);
    }
    return capability as AiCapability<I, O>;
  }

  has(key: string): boolean {
    return this.capabilities.has(key);
  }
}
