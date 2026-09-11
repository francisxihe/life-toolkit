import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(packageRoot, '../..');
const wikiRoot = join(packageRoot, 'wiki');
const srcRoot = join(packageRoot, 'src');
const desktopRenderRoot = join(repoRoot, 'apps/desktop/src/render');
const wikiRoots = [
  { pluginId: 'host', root: wikiRoot },
  { pluginId: 'growth', root: join(repoRoot, 'packages/plugins/growth/wiki') },
  { pluginId: 'expense', root: join(repoRoot, 'packages/plugins/expense/wiki') },
  { pluginId: 'purchase', root: join(repoRoot, 'packages/plugins/purchase/wiki') },
  { pluginId: 'library', root: join(repoRoot, 'packages/plugins/library/wiki') },
];
const desktopSurfaceRoots = [
  desktopRenderRoot,
  join(repoRoot, 'packages/plugins'),
];
const schemaPath = require.resolve('@ylib/product-server/wiki.schema.json');
const changelogSchemaPath = require.resolve('@ylib/product-server/changelog.schema.json');
const changelogPath = join(wikiRoot, 'changelog.json');
const generatedCatalogPath = join(srcRoot, 'catalog.generated.ts');
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
  for (const collection of ['views', 'rules']) {
    if (specification[collection] !== undefined && !Array.isArray(specification[collection])) {
      errors.push(`${label}: ${collection} must be an array when provided`);
    }
  }
}

function specImportName(specPath) {
  const id = relative(repoRoot, dirname(specPath)).replaceAll('\\', '/').replace(/[^a-z0-9]+/gi, '_');
  return `spec_${id}`;
}

function generatedCatalog(specPaths) {
  const imports = specPaths.map((path) => {
    let specifier = relative(srcRoot, path).replaceAll('\\', '/');
    if (!specifier.startsWith('.')) specifier = `./${specifier}`;
    return {
      name: specImportName(path),
      specifier,
    };
  });
  const importLines = [
    ...imports.map(({ name, specifier }) => `import ${name} from '${specifier}';`),
    "import productHistory from '../wiki/changelog.json';",
  ];
  const specList = imports.map(({ name }) => `  ${name},`).join('\n');
  return `// This file is generated by scripts/product-wiki.mjs. Do not edit by hand.\n${importLines.join('\n')}\n\nexport const productWikis = [\n${specList}\n];\n\nexport { productHistory };\n`;
}

function featureKey(wikiId, scope, localPath) {
  return `${wikiId}:${scope}:${localPath}`;
}

function collectActiveFeatures(wikis) {
  const features = [];
  const add = (wiki, scope, localPath, item, parentName) => {
    features.push({
      key: featureKey(wiki.id, scope, localPath),
      scope,
      wikiId: wiki.id,
      wikiTitle: wiki.title,
      name: item.name || wiki.title,
      ...(parentName ? { parentName } : {}),
      ...(item.reference ? { reference: item.reference } : {}),
      productStatus: item.productStatus,
    });
  };
  wikis.forEach((wiki) => {
    add(wiki, 'module', wiki.id, wiki);
    wiki.views?.forEach((view) => add(wiki, 'view', view.id, view));
    wiki.rules?.forEach((rule) => add(wiki, 'rule', rule.id, rule));
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
    if (current.productStatus !== feature.productStatus) {
      errors.push(`product-wiki/changelog.json: latest productStatus for ${feature.key} must match the current wiki`);
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
      .sort((left, right) => left.feature.wikiTitle.localeCompare(right.feature.wikiTitle, 'zh-CN') || left.date.localeCompare(right.date) || left.feature.name.localeCompare(right.feature.name, 'zh-CN')),
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
  desktopSurfaceRoots.forEach((root) => {
    sourceFilesIn(root).forEach((path) => {
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(productRefPattern)) {
        counts.set(match[1], (counts.get(match[1]) || 0) + 1);
      }
    });
  });
  return counts;
}

function validateDesktopSurfaces(wikis, knownReferences) {
  if (!existsSync(desktopRenderRoot)) {
    errors.push('apps/desktop/src/render is missing');
    return;
  }
  const viewReferences = new Set();
  const ruleReferences = new Set();
  wikis.forEach((wiki) => {
    wiki.views?.forEach((view) => viewReferences.add(view.reference));
    wiki.rules?.forEach((rule) => ruleReferences.add(rule.reference));
  });
  const counts = collectDesktopSurfaceIds();
  counts.forEach((count, reference) => {
    if (!knownReferences.has(reference)) {
      errors.push(`apps/desktop/src/render: product reference ${reference} is not defined in wiki references`);
    } else if (ruleReferences.has(reference)) {
      errors.push(`apps/desktop/src/render: product reference ${reference} is a rule and must not be pinned with ProductSurface`);
    } else if (!viewReferences.has(reference)) {
      errors.push(`apps/desktop/src/render: product reference ${reference} is not a view.reference`);
    }
  });
}

const history = parseSpecification(changelogPath);
if (history && Array.isArray(history.changes)) {
  wikiRoots.forEach((entry) => {
    if (entry.pluginId === 'host') return;
    const fragmentPath = join(entry.root, 'changes.json');
    if (!existsSync(fragmentPath)) return;
    const fragment = parseSpecification(fragmentPath);
    if (fragment && Array.isArray(fragment.changes) && fragment.changes.length) {
      history.changes.push(...fragment.changes);
    }
  });
}
if (versionArgumentIndex !== -1 && (!requestedVersion || !/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(requestedVersion))) {
  errors.push('product-wiki:version requires a version in v<major>.<minor>.<patch> form');
}

const specifications = wikiRoots.flatMap((entry) => {
  if (!existsSync(entry.root)) return [];
  return filesIn(entry.root, 'spec.json').map((path) => ({ path, pluginId: entry.pluginId, specification: parseSpecification(path) }));
}).filter((item) => item.specification).slice().sort((left, right) => left.path.localeCompare(right.path));
specifications.forEach(({ path, specification }) => validateSpecification(specification, path));
const allSpecificationIds = new Set();
const allReferences = [];

specifications.forEach(({ path, specification }) => {
  if (allSpecificationIds.has(specification.id)) errors.push(`${relative(packageRoot, path)}: duplicate wiki id ${specification.id}`);
  allSpecificationIds.add(specification.id);
  specification.references.forEach((reference) => allReferences.push(reference.id));
});

if (history) validateChangeLog(history, collectActiveFeatures(specifications.map(({ specification }) => specification)));

const seenReferences = new Set();
allReferences.forEach((reference) => {
  if (seenReferences.has(reference)) errors.push(`duplicate product reference ${reference}`);
  seenReferences.add(reference);
});

specifications.forEach(({ specification }) => {
  if (specification.parentId && !allSpecificationIds.has(specification.parentId)) errors.push(`${specification.id}: missing parent wiki ${specification.parentId}`);
  const references = new Set(specification.references.map((item) => item.id));
  const viewIds = new Set(specification.views?.map((item) => item.id) || []);
  specification.views?.forEach((view) => {
    if (!references.has(view.reference)) errors.push(`${specification.id}: view ${view.id} references undefined product reference ${view.reference}`);
    view.tests?.forEach((test) => {
      if (!references.has(test.reference)) errors.push(`${specification.id}: view ${view.id} test ${test.id} references undefined product reference ${test.reference}`);
      if (test.rule && !specification.rules?.some((rule) => rule.id === test.rule)) {
        errors.push(`${specification.id}: view ${view.id} test ${test.id} references undefined local rule ${test.rule}`);
      }
    });
  });
  specification.rules?.forEach((rule) => {
    if (!references.has(rule.reference)) errors.push(`${specification.id}: rule ${rule.id} references undefined product reference ${rule.reference}`);
    rule.views?.forEach((view) => {
      if (!viewIds.has(view)) errors.push(`${specification.id}: rule ${rule.id} references undefined local view ${view}`);
    });
  });
});

const expectedCatalog = generatedCatalog(specifications.map(({ path }) => path));
if (write) {
  writeFileSync(generatedCatalogPath, expectedCatalog, 'utf8');
} else if (!existsSync(generatedCatalogPath) || readFileSync(generatedCatalogPath, 'utf8') !== expectedCatalog) {
  errors.push('src/catalog.generated.ts is stale; run product-wiki:sync');
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
      result.changes.forEach((change) => console.log(`- ${change.feature.wikiTitle} / ${change.feature.scope} / ${change.feature.name}: ${change.summary}`));
    }
  } else {
    console.log(write ? 'ProductWiki synchronized successfully.' : 'ProductWiki check passed.');
  }
}
