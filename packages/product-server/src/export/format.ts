import type {
  ProductChangeLogEntry,
  ProductSpec,
  ProductStatus,
  ResolvedProductReference,
  SurfaceCoverage,
} from '../types';

export function childProductSpecs(specs: readonly ProductSpec[], parentId: string): ProductSpec[] {
  return specs
    .filter((spec) => spec.parentId === parentId)
    .slice()
    .sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'));
}

export function statusLabel(status: ProductStatus): string {
  return ({ roadmap: '规划中', released: '已发布', deprecated: '已废弃' })[status];
}

export function coverageLabel(coverage: SurfaceCoverage): string {
  return coverage === 'complete' ? '实现' : '未实现';
}

export function eventLabel(event: ProductChangeLogEntry['event']): string {
  return ({
    baseline: '基线',
    introduced: '新增',
    changed: '修改',
    released: '发布',
    deprecated: '废弃',
    removed: '移除',
  })[event] || event;
}

export function specificationMarkdown(specification: ProductSpec, allSpecs: readonly ProductSpec[] = []): string {
  const lines = [
    `# ${specification.title}`,
    '',
    '## 产品规格',
    '',
    `- 标识：\`${specification.id}\``,
    `- 类型：${specification.kind}`,
    `- 产品状态：${statusLabel(specification.productStatus)}`,
    `- 实现：${coverageLabel(specification.surfaceCoverage)}`,
  ];
  if (specification.route) lines.push(`- 产品入口：\`${specification.route}\``);
  if (specification.positioning) lines.push(`- 产品定位：${specification.positioning}`);
  if (specification.dependencies?.length) {
    lines.push(`- 依赖：${specification.dependencies.map((item) => `\`${item}\``).join('、')}`);
  }

  if (specification.entities?.length) {
    lines.push('', '### 产品对象', '', '| 对象 | 产品状态 | 实现 |', '| --- | --- | --- |');
    specification.entities.forEach((entity) => {
      lines.push(`| ${entity.name} | ${statusLabel(entity.productStatus)} | ${coverageLabel(entity.surfaceCoverage)} |`);
    });
    lines.push('', '### 字段与枚举', '', '| 实体 | 字段 | 类型 | 必填 | 可选值 | 产品状态 | 实现 | 说明 |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
    specification.entities.forEach((entity) => {
      entity.fields.forEach((field, index) => {
        lines.push(`| ${index === 0 ? entity.name : ''} | \`${field.id}\` | ${field.type} | ${field.required ? '是' : '否'} | ${(field.values || []).join(' / ')} | ${statusLabel(field.productStatus)} | ${coverageLabel(field.surfaceCoverage)} | ${field.description} |`);
      });
    });
  }

  if (specification.views?.length) {
    lines.push('', '### 视图矩阵', '', '| 视图 | 桌面路由 | 场景 | 产品状态 | 实现 | 产品引用 |', '| --- | --- | --- | --- | --- | --- |');
    specification.views.forEach((view) => {
      lines.push(`| ${view.name} | \`${view.desktopRoute}\` | ${view.scenario} | ${statusLabel(view.productStatus)} | ${coverageLabel(view.surfaceCoverage)} | \`${view.reference}\` |`);
    });
  }

  if (specification.rules?.length) {
    lines.push('', '### 规则索引', '', '| 规则 | 实体 | 说明 | 产品状态 | 实现 | 产品引用 |', '| --- | --- | --- | --- | --- | --- |');
    specification.rules.forEach((rule) => {
      lines.push(`| ${rule.name} | ${rule.entities.join('、')} | ${rule.description} | ${statusLabel(rule.productStatus)} | ${coverageLabel(rule.surfaceCoverage)} | \`${rule.reference}\` |`);
    });
  }

  specification.references.forEach((reference) => {
    lines.push('', `## ${reference.title}`, '');
    lines.push(reference.body.trim() || '（暂无正文）');
  });

  const children = childProductSpecs(allSpecs, specification.id);
  if (children.length) {
    lines.push('', '## 子模块', '');
    children.forEach((child) => {
      const detail = child.positioning ? `：${child.positioning}` : '';
      lines.push(`- ${child.title}（\`${child.id}\`）${detail}`);
    });
  }

  return `${lines.join('\n').trim()}\n`;
}

export function topicMarkdown(topic: Pick<ResolvedProductReference, 'title' | 'markdown'>): string {
  const body = topic.markdown.trim();
  return [`# ${topic.title}`, '', body || '（暂无正文）', ''].join('\n');
}

export function topicJson(topic: ResolvedProductReference): string {
  return `${JSON.stringify({
    id: topic.id,
    title: topic.title,
    module: topic.module,
    breadcrumb: topic.breadcrumb,
    body: topic.markdown,
    productStatus: topic.productStatus,
    surfaceCoverage: topic.surfaceCoverage,
  }, null, 2)}\n`;
}

export function specificationJson(specification: ProductSpec): string {
  return `${JSON.stringify(specification, null, 2)}\n`;
}

export function changelogMarkdown(version: string, changes: readonly ProductChangeLogEntry[]): string {
  const lines = [
    `# ProductWiki ${version}`,
    '',
    '| 日期 | 模块 | 层级 | 功能 | 事件 | 产品状态 | 实现 | 摘要 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  changes.forEach((change) => {
    const name = change.feature.parentName ? `${change.feature.parentName}.${change.feature.name}` : change.feature.name;
    lines.push(`| ${change.date} | ${change.feature.moduleTitle} | ${change.feature.scope} | ${name} | ${eventLabel(change.event)} | ${statusLabel(change.productStatus)} | ${coverageLabel(change.surfaceCoverage)} | ${change.summary.replace(/\|/g, '\\|')} |`);
  });
  return `${lines.join('\n')}\n`;
}

export function changelogJson(version: string, changes: readonly ProductChangeLogEntry[]): string {
  return `${JSON.stringify({ version, changes }, null, 2)}\n`;
}

export function downloadText(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
