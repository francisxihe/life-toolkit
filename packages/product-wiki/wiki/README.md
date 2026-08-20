# True North ProductWiki

ProductWiki 是 True North 的产品事实来源。每个模块的 `spec.json` 定义可校验的产品对象、字段、视图、规则、生命周期和变更记录；同目录 README 保留用户价值、流程、业务语义和决策背景。

产品规格区块由脚本生成，不能手工编辑。修改规格后运行：

```bash
pnpm --filter @true-north/product-wiki product-wiki:sync
pnpm --filter @true-north/product-wiki product-wiki:check
```

## 导航

- [产品总览](./global/README.md)
- [个人成长系统](./growth/README.md)
- [目标管理](./growth/goal/README.md)
- [任务管理](./growth/task/README.md)
- [待办管理](./growth/todo/README.md)
- [习惯管理](./growth/habit/README.md)
- [专注与时间追踪](./growth/track-time/README.md)
- [AI 能力](./ai/README.md)
- [AI 会话](./ai/session/README.md)

工程实现、接口和数据传输模型见 [TechnicalWiki](../../../doc/TechnicalWiki/TechnicalWiki.md)。
