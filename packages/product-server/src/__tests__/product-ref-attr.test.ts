import { collectProductRefsFromElement, findProductRefHost } from '../inspector/collect-refs';
import { mergeProductRefAttribute, parseProductRefAttribute } from '../product-ref-attr';
import { productRef } from '../reference';

function node(reference: string | null, parent: { getAttribute: (name: string) => string | null; parentElement: unknown } | null = null) {
  return {
    getAttribute: (name: string) => (name === 'data-product-ref' ? reference : null),
    parentElement: parent,
  };
}

describe('product-ref attributes', () => {
  it('parses space-separated refs and drops duplicates', () => {
    expect(parseProductRefAttribute('growth.goal.view.tree  growth.goal.view.tree growth.goal.rule.type')).toEqual([
      'growth.goal.view.tree',
      'growth.goal.rule.type',
    ]);
    expect(parseProductRefAttribute('')).toEqual([]);
    expect(parseProductRefAttribute(undefined)).toEqual([]);
  });

  it('merges a nested surface onto the same host without duplicating', () => {
    const view = productRef('growth.goal.view.ai-decomposition');
    const generation = productRef('growth.goal.rule.ai-decompose-generation');
    const merged = mergeProductRefAttribute(undefined, view);
    expect(mergeProductRefAttribute(merged, generation)).toBe(`${view} ${generation}`);
    expect(mergeProductRefAttribute(`${view} ${generation}`, generation)).toBe(`${view} ${generation}`);
  });

  it('collects merged refs on one node then ancestor refs outward', () => {
    const outer = node('ai.session.view.shell');
    const inner = node('growth.goal.view.ai-decomposition growth.goal.rule.ai-decompose-generation', outer);
    expect(collectProductRefsFromElement(inner as unknown as Element)).toEqual([
      'growth.goal.view.ai-decomposition',
      'growth.goal.rule.ai-decompose-generation',
      'ai.session.view.shell',
    ]);
  });

  it('finds the nearest product-ref host', () => {
    const host = node('growth.goal.view.tree');
    const inner = node(null, host);
    expect(findProductRefHost(inner as unknown as Element)).toBe(host);
    expect(findProductRefHost(host as unknown as Element)).toBe(host);
  });
});
