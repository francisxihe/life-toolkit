export type ProductSpecKind = 'global' | 'domain' | 'module';
export type ProductStatus = 'roadmap' | 'released' | 'deprecated';
export type SurfaceCoverage = 'none' | 'partial' | 'complete';
export type ProductFeatureScope = 'module' | 'entity' | 'field' | 'view' | 'rule';
export type ProductChangeEvent = 'baseline' | 'introduced' | 'changed' | 'released' | 'deprecated' | 'removed';
export type ProductChangeLogEntry = {
  version: string;
  date: string;
  event: ProductChangeEvent;
  summary: string;
  productStatus: ProductStatus;
  surfaceCoverage: SurfaceCoverage;
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
  surfaceCoverage: SurfaceCoverage;
};

export type ProductEntitySpec = { id: string; name: string; productStatus: ProductStatus; surfaceCoverage: SurfaceCoverage; fields: ProductFieldSpec[] };
export type ProductViewSpec = {
  id: string;
  name: string;
  desktopRoute: string;
  scenario: string;
  productStatus: ProductStatus;
  surfaceCoverage: SurfaceCoverage;
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
  surfaceCoverage: SurfaceCoverage;
};
export type ProductDocumentationReference = { id: string; title: string; body: string };

export type ProductSpec = {
  id: string;
  kind: ProductSpecKind;
  title: string;
  parentId?: string;
  route?: string;
  positioning?: string;
  productStatus: ProductStatus;
  surfaceCoverage: SurfaceCoverage;
  dependencies?: string[];
  entities?: ProductEntitySpec[];
  views?: ProductViewSpec[];
  rules?: ProductRuleSpec[];
  references: ProductDocumentationReference[];
};

export type ResolvedProductReference = {
  id: string;
  title: string;
  module: string;
  path: string;
  markdown: string;
  spec: ProductSpec;
  productStatus: ProductStatus;
  surfaceCoverage: SurfaceCoverage;
  latestChange?: ProductChangeLogEntry;
};

export type ProductWikiData = {
  specs: readonly ProductSpec[];
  history: ProductChangeLog;
  specSourcePath?: (specId: string) => string;
};
