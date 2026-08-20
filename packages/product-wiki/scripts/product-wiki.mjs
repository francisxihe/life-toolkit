import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(packageRoot, '../..');
const wikiRoot = join(packageRoot, 'wiki');
const schemaPath = join(wikiRoot, 'spec.schema.json');
const changelogSchemaPath = join(wikiRoot, 'changelog.schema.json');
const changelogPath = join(wikiRoot, 'changelog.json');
const generatedChangelogPath = join(wikiRoot, 'CHANGELOG.md');
const generatedReferencesPath = join(packageRoot, 'src/references.generated.ts');
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
  for (const key of ['id', 'kind', 'title', 'document']) required(specification, key, 'string', label);
  if (!Array.isArray(specification.references) || specification.references.length === 0) {
    errors.push(`${label}: references must be a non-empty array`);
  } else {
    specification.references.forEach((reference, index) => {
      required(reference, 'id', 'string', `${label}.references[${index}]`);
      required(reference, 'heading', 'string', `${label}.references[${index}]`);
    });
  }
  for (const collection of ['dependencies', 'entities', 'views', 'rules']) {
    if (specification[collection] !== undefined && !Array.isArray(specification[collection])) {
      errors.push(`${label}: ${collection} must be an array when provided`);
    }
  }
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function marker(reference) {
  return `<!-- product-ref: ${reference} -->`;
}

function statusLabel(status) {
  return ({ roadmap: '路线图', released: '已发布', deprecated: '已废弃' })[status] || status;
}

function coverageLabel(coverage) {
  return ({ none: '未覆盖', partial: '部分覆盖', complete: '完整覆盖' })[coverage] || coverage;
}

function productTable(specification) {
  const lines = [
    '<!-- product-wiki:managed:start -->',
    '## 产品规格（受管）',
    '',
    `- 标识：\`${specification.id}\``,
    `- 类型：${specification.kind}`,
    `- 产品状态：${statusLabel(specification.productStatus)}`,
    `- 表面覆盖：${coverageLabel(specification.surfaceCoverage)}`,
  ];
  if (specification.route) lines.push(`- 产品入口：\`${specification.route}\``);
  if (specification.positioning) lines.push(`- 产品定位：${specification.positioning}`);
  if (specification.dependencies?.length) lines.push(`- 依赖：${specification.dependencies.map((item) => `\`${item}\``).join('、')}`);

  if (specification.entities?.length) {
    lines.push('', '### 产品对象', '', '| 对象 | 产品状态 | 表面覆盖 |', '| --- | --- | --- |');
    specification.entities.forEach((entity) => lines.push(`| ${entity.name} | ${statusLabel(entity.productStatus)} | ${coverageLabel(entity.surfaceCoverage)} |`));
    lines.push('', '### 字段与枚举', '', '| 实体 | 字段 | 类型 | 必填 | 可选值 | 产品状态 | 表面覆盖 | 说明 |', '| --- | --- | --- | --- | --- | --- | --- |');
    specification.entities.forEach((entity) => {
      entity.fields.forEach((field, index) => {
        lines.push(`| ${index === 0 ? entity.name : ''} | \`${field.id}\` | ${field.type} | ${field.required ? '是' : '否'} | ${(field.values || []).join(' / ')} | ${statusLabel(field.productStatus)} | ${coverageLabel(field.surfaceCoverage)} | ${field.description} |`);
      });
    });
  }

  if (specification.views?.length) {
    lines.push('', '### 视图矩阵', '', '| 视图 | 桌面路由 | 场景 | 产品状态 | 表面覆盖 | 产品引用 |', '| --- | --- | --- | --- | --- | --- |');
    specification.views.forEach((view) => lines.push(`| ${view.name} | \`${view.desktopRoute}\` | ${view.scenario} | ${statusLabel(view.productStatus)} | ${coverageLabel(view.surfaceCoverage)} | \`${view.reference}\` |`));
  }

  if (specification.rules?.length) {
    lines.push('', '### 规则索引', '', '| 规则 | 实体 | 说明 | 产品状态 | 表面覆盖 | 产品引用 |', '| --- | --- | --- | --- | --- | --- |');
    specification.rules.forEach((rule) => lines.push(`| ${rule.name} | ${rule.entities.join('、')} | ${rule.description} | ${statusLabel(rule.productStatus)} | ${coverageLabel(rule.surfaceCoverage)} | \`${rule.reference}\` |`));
  }

  lines.push('', '<!-- product-wiki:managed:end -->', '');
  return lines.join('\n');
}

function insertMarkers(markdown, specification) {
  const referencesByHeading = new Map();
  specification.references.forEach((reference) => {
    const items = referencesByHeading.get(reference.heading) || [];
    items.push(reference.id);
    referencesByHeading.set(reference.heading, items);
  });

  let output = markdown;
  for (const [heading, references] of referencesByHeading) {
    const missing = references.filter((reference) => !output.includes(marker(reference)));
    if (!missing.length) continue;
    const match = new RegExp(`^${escapePattern(heading)}\\s*$`, 'm').exec(output);
    if (!match || match.index === undefined) {
      errors.push(`${specification.document}: cannot insert references for missing heading "${heading}"`);
      continue;
    }
    output = `${output.slice(0, match.index)}${missing.map(marker).join('\n')}\n${output.slice(match.index)}`;
  }
  return output;
}

function syncDocument(markdown, specification) {
  let output = insertMarkers(markdown, specification);
  const generated = productTable(specification);
  const managed = /<!-- product-wiki:managed:start -->[\s\S]*?<!-- product-wiki:managed:end -->\n?/;
  if (managed.test(output)) return output.replace(managed, generated);
  const title = /^# .+\n?/m.exec(output);
  if (!title || title.index === undefined) {
    errors.push(`${specification.document}: document needs one level-one title`);
    return output;
  }
  const position = title.index + title[0].length;
  return `${output.slice(0, position)}\n${generated}\n${output.slice(position)}`;
}

function checkDocument(markdown, specification) {
  const knownReferences = new Set(specification.references.map((reference) => reference.id));
  const foundReferences = [...markdown.matchAll(/<!--\s*product-ref:\s*([a-z][a-z0-9.-]*)\s*-->/g)].map((match) => match[1]);
  specification.references.forEach((reference) => {
    const count = foundReferences.filter((item) => item === reference.id).length;
    if (count !== 1) errors.push(`${specification.document}: ${reference.id} must have exactly one marker (found ${count})`);
  });
  foundReferences.forEach((reference) => {
    if (!knownReferences.has(reference)) errors.push(`${specification.document}: ${reference} has no specification entry`);
  });
  const headings = new Set();
  specification.references.forEach((reference) => {
    if (headings.has(reference.heading)) errors.push(`${specification.document}: references must not share heading ${reference.heading}`);
    headings.add(reference.heading);
    const expected = `${marker(reference.id)}\n${reference.heading}`;
    if (!markdown.includes(expected)) errors.push(`${specification.document}: ${reference.id} marker must immediately precede ${reference.heading}`);
  });
  const managedless = markdown.replace(/<!-- product-wiki:managed:start -->[\s\S]*?<!-- product-wiki:managed:end -->/g, '');
  const forbidden = [/^#{1,6}\s*.*(?:API|接口契约|技术架构|数据模型|核心字段|视图矩阵（当前状态）)/m, /^---\s*$/m];
  forbidden.forEach((pattern) => {
    if (pattern.test(managedless)) errors.push(`${specification.document}: contains legacy technical or YAML content outside the managed block`);
  });
  const expectedManaged = productTable(specification);
  const existingManaged = markdown.match(/<!-- product-wiki:managed:start -->[\s\S]*?<!-- product-wiki:managed:end -->\n?/);
  if (!existingManaged || existingManaged[0].trim() !== expectedManaged.trim()) {
    errors.push(`${specification.document}: managed product block is stale; run product-wiki:sync`);
  }
}

function generatedReferences(references) {
  const list = references.map((reference) => `  '${reference}',`).join('\n');
  return `// This file is generated by scripts/product-wiki.mjs. Do not edit by hand.\nexport const productReferenceIds = [\n${list}\n] as const;\n\nexport type ProductReferenceId = (typeof productReferenceIds)[number];\n`;
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

function compareVersionsDescending(left, right) {
  const leftParts = left.slice(1).split('.').map(Number);
  const rightParts = right.slice(1).split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) return rightParts[index] - leftParts[index];
  }
  return 0;
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

function changelogTable(history) {
  const versions = [...new Set(history.changes.map((change) => change.version))].sort(compareVersionsDescending);
  const eventLabel = { baseline: '基线', introduced: '新增', changed: '修改', released: '发布', deprecated: '废弃', removed: '移除' };
  const lines = ['# ProductWiki Changelog', '', '> 此文件由 `scripts/product-wiki.mjs` 生成，请编辑 `changelog.json`。', ''];
  versions.forEach((version) => {
    lines.push(`## ${version}`, '', '| 日期 | 模块 | 层级 | 功能 | 事件 | 产品状态 | 表面覆盖 | 摘要 |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
    history.changes
      .filter((change) => change.version === version)
      .slice()
      .sort((left, right) => left.feature.moduleTitle.localeCompare(right.feature.moduleTitle, 'zh-CN') || left.date.localeCompare(right.date) || left.feature.name.localeCompare(right.feature.name, 'zh-CN'))
      .forEach((change) => {
        const name = change.feature.parentName ? `${change.feature.parentName}.${change.feature.name}` : change.feature.name;
        lines.push(`| ${change.date} | ${change.feature.moduleTitle} | ${change.feature.scope} | ${name} | ${eventLabel[change.event]} | ${statusLabel(change.productStatus)} | ${coverageLabel(change.surfaceCoverage)} | ${change.summary.replace(/\|/g, '\\|')} |`);
      });
    lines.push('');
  });
  return `${lines.join('\n')}\n`;
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

const specifications = filesIn(wikiRoot, 'spec.json').map((path) => ({ path, specification: parseSpecification(path) })).filter((item) => item.specification);
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
  const documentPath = join(wikiRoot, specification.document);
  if (!existsSync(documentPath)) {
    errors.push(`${specification.id}: document ${specification.document} does not exist`);
    return;
  }
  const current = readFileSync(documentPath, 'utf8');
  const synced = syncDocument(current, specification);
  if (write && synced !== current) writeFileSync(documentPath, synced, 'utf8');
  if (!write) checkDocument(current, specification);
});

const expectedReferences = generatedReferences(allReferences);
if (write) writeFileSync(generatedReferencesPath, expectedReferences, 'utf8');
else if (!existsSync(generatedReferencesPath) || readFileSync(generatedReferencesPath, 'utf8') !== expectedReferences) {
  errors.push('src/references.generated.ts is stale; run product-wiki:sync');
}

if (history) {
  const expectedChangelog = changelogTable(history);
  if (write) writeFileSync(generatedChangelogPath, expectedChangelog, 'utf8');
  else if (!existsSync(generatedChangelogPath) || readFileSync(generatedChangelogPath, 'utf8') !== expectedChangelog) {
    errors.push('product-wiki/CHANGELOG.md is stale; run product-wiki:sync');
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
