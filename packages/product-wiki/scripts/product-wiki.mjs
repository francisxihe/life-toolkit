import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(packageRoot, '../..');
const wikiRoot = join(packageRoot, 'wiki');
const srcRoot = join(packageRoot, 'src');
const serverRoot = join(packageRoot, '../product-server');
const schemaPath = join(serverRoot, 'src/spec.schema.json');
const changelogSchemaPath = join(serverRoot, 'src/changelog.schema.json');
const changelogPath = join(wikiRoot, 'changelog.json');
const generatedReferencesPath = join(srcRoot, 'references.generated.ts');
const generatedCatalogPath = join(srcRoot, 'catalog.generated.ts');
const desktopRenderRoot = join(repoRoot, 'apps/desktop/src/render');
const write = process.argv.includes('--write') || process.argv.includes('sync');
const versionArgumentIndex = process.argv.indexOf('--version');
const requestedVersion = versionArgumentIndex === -1
  ? undefined
  : process.argv.slice(versionArgumentIndex + 1).find((argument) => argument !== '--' && !argument.startsWith('--'));
const jsonOutput = process.argv.includes('--json');
const errors = [];
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const changelogSchema = JSON.parse(readFileSync(changelogSchemaPath, 'utf8'));

function filesIn(directory, name) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(path, name);
    return entry.name === name ? [path] : [];
  });
}

function parseSpecification(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${relative(packageRoot, path)} is not valid JSON: ${error.message}`);
    return undefined;
  }
}

function required(object, key, type, path) {
  if (object[key] === undefined || typeof object[key] !== type) {
    errors.push(`${path}: ${key} must be a ${type}`);
    return false;
  }
  return true;
}

function resolveSchema(schemaNode, rootSchema = schema) {
  if (!schemaNode.$ref) return schemaNode;
  const parts = schemaNode.$ref.replace(/^#\//, '').split('/');
  return parts.reduce((current, key) => current?.[key], rootSchema);
}

function validateAgainstSchema(value, schemaNode, path, rootSchema = schema) {
  const definition = resolveSchema(schemaNode, rootSchema);
  if (!definition) {
    errors.push(`${path}: unresolved schema reference ${schemaNode.$ref}`);
    return;
  }
  if (definition.enum && !definition.enum.includes(value)) {
    errors.push(`${path}: expected one of ${definition.enum.join(', ')}`);
    return;
  }
  if (definition.type === 'string') {
    if (typeof value !== 'string') errors.push(`${path}: expected string`);
    else if (definition.minLength && value.length < definition.minLength) errors.push(`${path}: must not be empty`);
    else if (definition.pattern && !new RegExp(definition.pattern).test(value)) errors.push(`${path}: does not match ${definition.pattern}`);
    return;
  }
  if (definition.type === 'boolean') {
    if (typeof value !== 'boolean') errors.push(`${path}: expected boolean`);
    return;
  }
  if (definition.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${path}: expected array`);
      return;
    }
    if (definition.minItems && value.length < definition.minItems) errors.push(`${path}: requires at least ${definition.minItems} items`);
    value.forEach((item, index) => validateAgainstSchema(item, definition.items, `${path}[${index}]`, rootSchema));
    return;
  }
  if (definition.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${path}: expected object`);
      return;
    }
    definition.required?.forEach((key) => {
      if (value[key] === undefined) errors.push(`${path}: missing required property ${key}`);
    });
    Object.entries(value).forEach(([key, item]) => {
      const childSchema = definition.properties?.[key];
      if (!childSchema) {
        if (definition.additionalProperties === false) errors.push(`${path}: unknown property ${key}`);
        return;
      }
      validateAgainstSchema(item, childSchema, `${path}.${key}`, rootSchema);
    });
  }
}

function validateSpecification(specification, path) {
  const label = relative(packageRoot, path);
  validateAgainstSchema(specification, schema, label);
  if (!specification || typeof specification !== 'object' || Array.isArray(specification)) {
    errors.push(`${label}: specification must be an object`);
    return;
  }
  for (const key of ['id', 'kind', 'title']) required(specification, key, 'string', label);
  if (!Array.isArray(specification.references) || specification.references.length === 0) {
    errors.push(`${label}: references must be a non-empty array`);
  } else {
    specification.references.forEach((reference, index) => {
      required(reference, 'id', 'string', `${label}.references[${index}]`);
      required(reference, 'title', 'string', `${label}.references[${index}]`);
      required(reference, 'body', 'string', `${label}.references[${index}]`);
    });
  }
  for (const collection of ['dependencies', 'entities', 'views', 'rules']) {
    if (specification[collection] !== undefined && !Array.isArray(specification[collection])) {
      errors.push(`${label}: ${collection} must be an array when provided`);
    }
  }
}

function generatedReferences(references) {
  const list = references.map((reference) => `  '${reference}',`).join('\n');
  return `// This file is generated by scripts/product-wiki.mjs. Do not edit by hand.\nexport const productReferenceIds = [\n${list}\n] as const;\n\nexport type ProductReferenceId = (typeof productReferenceIds)[number];\n`;
}

function specImportName(specPath) {
  const id = relative(wikiRoot, dirname(specPath)).replaceAll('\\', '/').replace(/[^a-z0-9]+/gi, '_');
  return `spec_${id}`;
}

function generatedCatalog(specPaths) {
  const imports = specPaths.map((path) => ({
    name: specImportName(path),
    specifier: `../wiki/${relative(wikiRoot, path).replaceAll('\\', '/')}`,
  }));
  const importLines = [
    ...imports.map(({ name, specifier }) => `import ${name} from '${specifier}';`),
    "import productHistory from '../wiki/changelog.json';",
  ];
  const specList = imports.map(({ name }) => `  ${name},`).join('\n');
  return `// This file is generated by scripts/product-wiki.mjs. Do not edit by hand.\n${importLines.join('\n')}\n\nexport const productSpecs = [\n${specList}\n];\n\nexport { productHistory };\n`;
}

function featureKey(moduleId, scope, localPath) {
  return `${moduleId}:${scope}:${localPath}`;
}

function collectActiveFeatures(specifications) {
  const features = [];
  const add = (specification, scope, localPath, item, parentName) => {
    features.push({
      key: featureKey(specification.id, scope, localPath),
      scope,
      moduleId: specification.id,
      moduleTitle: specification.title,
      name: item.name || specification.title,
      ...(parentName ? { parentName } : {}),
      ...(item.reference ? { reference: item.reference } : {}),
      productStatus: item.productStatus,
      surfaceCoverage: item.surfaceCoverage,
    });
  };
  specifications.forEach((specification) => {
    add(specification, 'module', specification.id, specification);
    specification.entities?.forEach((entity) => {
      add(specification, 'entity', entity.id, entity);
      entity.fields.forEach((field) => add(specification, 'field', `${entity.id}.${field.id}`, field, entity.name));
    });
    specification.views?.forEach((view) => add(specification, 'view', view.id, view));
    specification.rules?.forEach((rule) => add(specification, 'rule', rule.id, rule));
  });
  return features;
}

function latestChange(changes) {
  return changes.reduce((latest, change, index) => {
    if (!latest || latest.change.date < change.date || (latest.change.date === change.date && latest.index < index)) return { change, index };
    return latest;
  }, undefined)?.change;
}

function validateChangeLog(history, activeFeatures) {
  validateAgainstSchema(history, changelogSchema, 'product-wiki/changelog.json', changelogSchema);
  if (!history || typeof history !== 'object' || Array.isArray(history) || !Array.isArray(history.changes)) return;
  const changesByFeature = new Map();
  history.changes.forEach((change, index) => {
    const changes = changesByFeature.get(change.feature?.key) || [];
    changes.push({ ...change, index });
    changesByFeature.set(change.feature?.key, changes);
  });
  activeFeatures.forEach((feature) => {
    const changes = changesByFeature.get(feature.key) || [];
    const current = latestChange(changes);
    if (!current) return;
    if (current.event === 'removed') errors.push(`product-wiki/changelog.json: active feature ${feature.key} cannot end with a removed event`);
    if (current.productStatus !== feature.productStatus || current.surfaceCoverage !== feature.surfaceCoverage) {
      errors.push(`product-wiki/changelog.json: latest lifecycle values for ${feature.key} must match the current specification`);
    }
  });
  history.changes.forEach((change, index) => {
    if (!change?.feature?.key || !change?.version || !change?.date) return;
    const earlier = history.changes.slice(0, index).filter((item) => item.feature?.key === change.feature.key);
    const previous = latestChange(earlier);
    if (previous && previous.date > change.date) errors.push(`product-wiki/changelog.json.changes[${index}]: feature history must be chronological`);
  });
}

function versionResult(history, version) {
  return {
    version,
    changes: history.changes
      .filter((change) => change.version === version)
      .slice()
      .sort((left, right) => left.feature.moduleTitle.localeCompare(right.feature.moduleTitle, 'zh-CN') || left.date.localeCompare(right.date) || left.feature.name.localeCompare(right.feature.name, 'zh-CN')),
  };
}

function sourceFilesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFilesIn(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function collectDesktopSurfaceIds() {
  const counts = new Map();
  const productRefPattern = /productRef\(\s*['"]([a-z][a-z0-9.-]*)['"]\s*\)/g;
  sourceFilesIn(desktopRenderRoot).forEach((path) => {
    const source = readFileSync(path, 'utf8');
    for (const match of source.matchAll(productRefPattern)) {
      counts.set(match[1], (counts.get(match[1]) || 0) + 1);
    }
  });
  return counts;
}

function validateDesktopSurfaces(specifications, knownReferences) {
  if (!existsSync(desktopRenderRoot)) {
    errors.push('apps/desktop/src/render is missing');
    return;
  }
  const counts = collectDesktopSurfaceIds();
  counts.forEach((count, reference) => {
    if (!knownReferences.has(reference)) {
      errors.push(`apps/desktop/src/render: product reference ${reference} is not defined in spec references`);
    }
  });
  specifications.forEach((specification) => {
    const items = [
      ...(specification.views || []).map((view) => ({ kind: 'view', item: view })),
      ...(specification.rules || []).map((rule) => ({ kind: 'rule', item: rule })),
    ];
    items.forEach(({ kind, item }) => {
      const count = counts.get(item.reference) || 0;
      const label = `${specification.id} ${kind} ${item.id} (${item.reference})`;
      if (item.surfaceCoverage === 'complete' && count !== 1) {
        errors.push(`${label}: surfaceCoverage complete requires exactly one desktop surface (found ${count})`);
      }
      if (item.surfaceCoverage === 'none' && count !== 0) {
        errors.push(`${label}: surfaceCoverage none must not appear in desktop render (found ${count})`);
      }
      if (item.surfaceCoverage === 'partial' && count < 1) {
        errors.push(`${label}: surfaceCoverage partial requires at least one desktop surface (found ${count})`);
      }
    });
  });
}

const history = parseSpecification(changelogPath);
if (versionArgumentIndex !== -1 && (!requestedVersion || !/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(requestedVersion))) {
  errors.push('product-wiki:version requires a version in v<major>.<minor>.<patch> form');
}

const specifications = filesIn(wikiRoot, 'spec.json').slice().sort().map((path) => ({ path, specification: parseSpecification(path) })).filter((item) => item.specification);
specifications.forEach(({ path, specification }) => validateSpecification(specification, path));
const allSpecificationIds = new Set();
const allReferences = [];
const allEntityIds = new Set();

specifications.forEach(({ path, specification }) => {
  if (allSpecificationIds.has(specification.id)) errors.push(`${relative(packageRoot, path)}: duplicate specification id ${specification.id}`);
  allSpecificationIds.add(specification.id);
  specification.references.forEach((reference) => allReferences.push(reference.id));
  specification.entities?.forEach((entity) => allEntityIds.add(entity.id));
});

if (history) validateChangeLog(history, collectActiveFeatures(specifications.map(({ specification }) => specification)));

const seenReferences = new Set();
allReferences.forEach((reference) => {
  if (seenReferences.has(reference)) errors.push(`duplicate product reference ${reference}`);
  seenReferences.add(reference);
});

specifications.forEach(({ specification }) => {
  if (specification.parentId && !allSpecificationIds.has(specification.parentId)) errors.push(`${specification.id}: missing parent specification ${specification.parentId}`);
  specification.dependencies?.forEach((dependency) => {
    if (!allSpecificationIds.has(dependency)) errors.push(`${specification.id}: missing dependency ${dependency}`);
  });
  const references = new Set(specification.references.map((item) => item.id));
  const entityIds = new Set(specification.entities?.map((item) => item.id) || []);
  const viewIds = new Set(specification.views?.map((item) => item.id) || []);
  specification.views?.forEach((view) => {
    if (!references.has(view.reference)) errors.push(`${specification.id}: view ${view.id} references undefined product reference ${view.reference}`);
  });
  specification.rules?.forEach((rule) => {
    if (!references.has(rule.reference)) errors.push(`${specification.id}: rule ${rule.id} references undefined product reference ${rule.reference}`);
    rule.entities.forEach((entity) => {
      if (!entityIds.has(entity) && !allEntityIds.has(entity)) errors.push(`${specification.id}: rule ${rule.id} references undefined entity ${entity}`);
    });
    rule.views?.forEach((view) => {
      if (!viewIds.has(view)) errors.push(`${specification.id}: rule ${rule.id} references undefined local view ${view}`);
    });
  });
});

const expectedReferences = generatedReferences(allReferences);
const expectedCatalog = generatedCatalog(specifications.map(({ path }) => path));
if (write) {
  writeFileSync(generatedReferencesPath, expectedReferences, 'utf8');
  writeFileSync(generatedCatalogPath, expectedCatalog, 'utf8');
} else {
  if (!existsSync(generatedReferencesPath) || readFileSync(generatedReferencesPath, 'utf8') !== expectedReferences) {
    errors.push('src/references.generated.ts is stale; run product-wiki:sync');
  }
  if (!existsSync(generatedCatalogPath) || readFileSync(generatedCatalogPath, 'utf8') !== expectedCatalog) {
    errors.push('src/catalog.generated.ts is stale; run product-wiki:sync');
  }
}

validateDesktopSurfaces(specifications.map(({ specification }) => specification), seenReferences);

if (requestedVersion && history && !history.changes.some((change) => change.version === requestedVersion)) {
  errors.push(`product-wiki:version found no entries for ${requestedVersion}`);
}

if (errors.length) {
  console.error(`ProductWiki check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  if (requestedVersion) {
    const result = versionResult(history, requestedVersion);
    if (jsonOutput) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`${result.version} (${result.changes.length} changes)`);
      result.changes.forEach((change) => console.log(`- ${change.feature.moduleTitle} / ${change.feature.scope} / ${change.feature.name}: ${change.summary}`));
    }
  } else {
    console.log(write ? 'ProductWiki synchronized successfully.' : 'ProductWiki check passed.');
  }
}
