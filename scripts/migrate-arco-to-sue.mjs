#!/usr/bin/env node
/**
 * Mechanical migration: Arco / francis → @sue/design-web-react + @/components
 * (historical; @true-north/components-ui has been inlined into apps/desktop)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WALK_ROOTS = [
  path.join(ROOT, 'apps/desktop'),
  path.join(ROOT, 'packages/components/mind'),
  path.join(ROOT, 'packages/share-web'),
];

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);
const STYLE_EXT = new Set(['.less', '.css', '.module.less']);

const COMPAT_FROM_UI = new Set(['Grid', 'Typography', 'List', 'Result', 'Steps']);
const SUE = '@sue/design-web-react';
const UI = '@/components';

const TYPE_IMPORT_MAP = [
  [/['"]@arco-design\/web-react\/es\/Modal\/confirm['"]/g, `'${SUE}'`],
  [/['"]@arco-design\/web-react\/es\/Form['"]/g, `'${SUE}'`],
  [/['"]@arco-design\/web-react\/es\/Table\/interface['"]/g, `'${SUE}'`],
  [/['"]@arco-design\/web-react\/es\/Table['"]/g, `'${SUE}'`],
  [/['"]@arco-design\/web-react\/es\/Layout\/interface['"]/g, `'${SUE}'`],
];

const TYPE_SPECIFIER_MAP = {
  ConfirmProps: 'ModalFuncProps',
  ColumnProps: 'TableColumnProps',
  FooterProps: 'BasicProps',
};

let filesChanged = 0;

function walk(dir, visitor) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visitor);
    else visitor(full);
  }
}

function splitSpecifiers(specText) {
  return specText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^type\s+(.+)$/);
      if (m) {
        const inner = m[1].trim();
        const asMatch = inner.match(/^(\w+)\s+as\s+(\w+)$/);
        if (asMatch) return { name: asMatch[1], alias: asMatch[2], isType: true };
        return { name: inner, alias: inner, isType: true };
      }
      const asMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
      if (asMatch) return { name: asMatch[1], alias: asMatch[2], isType: false };
      return { name: part, alias: part, isType: false };
    });
}

function formatImport(specs, source, isTypeOnly = false) {
  if (!specs.length) return '';
  const parts = specs.map((s) => {
    const mappedName = TYPE_SPECIFIER_MAP[s.name] ?? s.name;
    const display = mappedName === s.alias ? mappedName : `${mappedName} as ${s.alias}`;
    return s.isType || isTypeOnly ? `type ${display}` : display;
  });
  const prefix = isTypeOnly ? 'import type' : 'import';
  return `${prefix} { ${parts.join(', ')} } from '${source}';\n`;
}

function mergeImports(existing, newLine) {
  return existing.endsWith('\n') ? existing + newLine : existing + '\n' + newLine;
}

function processTsFile(filePath, content) {
  let out = content;
  let changed = false;

  if (out.includes('francis-component-react')) {
    out = out.replace(/from\s+['"]francis-component-react['"]/g, `from '${UI}'`);
    changed = true;
  }

  out = out.replace(
    /import\s+zhCN\s+from\s+['"]@arco-design\/web-react\/es\/locale\/zh-CN['"]/g,
    `import zhCN from '${SUE}/locale/zh_CN'`,
  );
  out = out.replace(
    /import\s+enUS\s+from\s+['"]@arco-design\/web-react\/es\/locale\/en-US['"]/g,
    `import enUS from '${SUE}/locale/en_US'`,
  );

  out = out.replace(
    /from\s+['"]@arco-design\/web-react\/icon['"]/g,
    `from '${UI}'`,
  );

  for (const [re, repl] of TYPE_IMPORT_MAP) {
    if (re.test(out)) {
      out = out.replace(re, repl);
      changed = true;
    }
  }

  const importRe =
    /import\s+(type\s+)?\{([^}]+)\}\s*from\s*['"]@arco-design\/web-react['"]\s*;?/g;

  const newImports = [];
  let m;
  const replacements = [];
  while ((m = importRe.exec(out)) !== null) {
    const isTypeOnly = Boolean(m[1]);
    const specs = splitSpecifiers(m[2]);
    const sueSpecs = [];
    const uiSpecs = [];
    let hasMessage = false;

    for (const s of specs) {
      let name = s.name;
      if (name === 'Message') {
        hasMessage = true;
        if (!sueSpecs.some((x) => x.alias === 'message')) {
          sueSpecs.push({ name: 'message', alias: 'message', isType: false });
        }
        continue;
      }
      if (COMPAT_FROM_UI.has(name)) {
        uiSpecs.push(s);
        continue;
      }
      sueSpecs.push(s);
    }

    let block = '';
    if (sueSpecs.length) block += formatImport(sueSpecs, SUE, isTypeOnly);
    if (uiSpecs.length) block += formatImport(uiSpecs, UI, isTypeOnly);
    replacements.push({ start: m.index, end: m.index + m[0].length, block });
    if (hasMessage || sueSpecs.length || uiSpecs.length) changed = true;
  }

  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    out = out.slice(0, r.start) + r.block.trimEnd() + out.slice(r.end);
  }

  const defaultImportRe = /import\s+(\w+)\s+from\s+['"]@arco-design\/web-react['"]\s*;?/g;
  out = out.replace(defaultImportRe, `import $1 from '${SUE}';`);
  if (/import\s+\w+\s+from\s+['"]@arco-design\/web-react['"]/.test(content)) changed = true;

  if (/\bMessage\.(error|success|warning|info)\b/.test(out)) {
    out = out.replace(/\bMessage\.(error|success|warning|info)\b/g, 'message.$1');
    changed = true;
  }

  out = out.replace(/\barco-theme\b/g, 'data-theme');
  out = out.replace(/setAttribute\(\s*['"]arco-theme['"]/g, "setAttribute('data-theme'");
  out = out.replace(/removeAttribute\(\s*['"]arco-theme['"]/g, "removeAttribute('data-theme'");

  if (out !== content) changed = true;
  return { out, changed };
}

function processStyleFile(_filePath, content) {
  let out = content;
  out = out.replace(/\.arco-/g, '.sue-');
  out = out.replace(/body\[arco-theme='dark'\]/g, "body[data-theme='dark']");
  out = out.replace(/body\[arco-theme="dark"\]/g, 'body[data-theme="dark"]');
  const changed = out !== content;
  return { out, changed };
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  const isModuleLess = filePath.endsWith('.module.less');
  if (!CODE_EXT.has(ext) && !STYLE_EXT.has(ext) && !isModuleLess) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let result;

  if (CODE_EXT.has(ext)) result = processTsFile(filePath, content);
  else result = processStyleFile(filePath, content);

  if (result.changed) {
    fs.writeFileSync(filePath, result.out, 'utf8');
    filesChanged++;
    console.log('updated:', path.relative(ROOT, filePath));
  }
}

for (const root of WALK_ROOTS) {
  walk(root, processFile);
}

console.log(`\nDone. ${filesChanged} file(s) updated.`);
