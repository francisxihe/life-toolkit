import type { ProductReferenceId } from './references.generated';

export type ProductSpecKind = 'global' | 'domain' | 'module';
export type ProductStatus = 'roadmap' | 'released' | 'deprecated';
export type PrototypeCoverage = 'none' | 'partial' | 'complete';
export type ProductFeatureScope = 'module' | 'entity' | 'field' | 'view' | 'rule';
export type ProductChangeEvent = 'baseline' | 'introduced' | 'changed' | 'released' | 'deprecated' | 'removed';
export type ProductChangeLogEntry = {
  version: string;
  date: string;
  event: ProductChangeEvent;
  summary: string;
  productStatus: ProductStatus;
  prototypeCoverage: PrototypeCoverage;
  feature: ProductFeatureSnapshot;
};
export type ProductFeatureSnapshot = {
  key: string;
  scope: ProductFeatureScope;
  moduleId: string;
  moduleTitle: string;
  name: string;
  parentName?: string;
  reference?: string;
};
export type ProductChangeLog = { changes: ProductChangeLogEntry[] };

export type ProductFieldSpec = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  values?: string[];
  description: string;
  productStatus: ProductStatus;
  prototypeCoverage: PrototypeCoverage;
};

export type ProductEntitySpec = { id: string; name: string; productStatus: ProductStatus; prototypeCoverage: PrototypeCoverage; fields: ProductFieldSpec[] };
export type ProductViewSpec = {
  id: string;
  name: string;
  prototypePage: string;
  scenario: string;
  productStatus: ProductStatus;
  prototypeCoverage: PrototypeCoverage;
  reference: string;
};
export type ProductRuleSpec = {
  id: string;
  name: string;
  entities: string[];
  description: string;
  views?: string[];
  reference: string;
  productStatus: ProductStatus;
  prototypeCoverage: PrototypeCoverage;
};
export type ProductDocumentationReference = { id: ProductReferenceId; heading: string };

export type ProductSpec = {
  id: string;
  kind: ProductSpecKind;
  title: string;
  document: string;
  parentId?: string;
  route?: string;
  positioning?: string;
  productStatus: ProductStatus;
  prototypeCoverage: PrototypeCoverage;
  dependencies?: string[];
  entities?: ProductEntitySpec[];
  views?: ProductViewSpec[];
  rules?: ProductRuleSpec[];
  references: ProductDocumentationReference[];
};

export type ResolvedProductReference = {
  id: ProductReferenceId;
  title: string;
  module: string;
  path: string;
  markdown: string;
  spec: ProductSpec;
  productStatus: ProductStatus;
  prototypeCoverage: PrototypeCoverage;
  latestChange?: ProductChangeLogEntry;
};
