# True North v0.2.0

AI 会话壳 + 目标/任务拆解工作台（真实模型）；会话聊天走本机编码 Agent（可切换；本版 ChatGPT）；拆解 Capability 非流式 JSON；任务建议仅子任务与待办；拆解密钥主进程配置写死；无 AI 设置页。

| 文档 | 说明 |
| --- | --- |
| [PRD.md](./PRD.md) | 本版本产品范围与验收 |
| [TDD.md](./TDD.md) | 本版本技术设计与实施顺序 |
| [TechnicalWiki · AI](../TechnicalWiki/ai/README.md) | AI 平台设计基线 |
| ProductWiki v0.2.0 变更 | `pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json` |

**状态：** 原型已覆盖目标/任务拆解工作台与编码 Agent 选择器；桌面端按本版 TDD 将聊天从自研 loop 改为本机 Agent Runtime，拆解仍走 Capability。
