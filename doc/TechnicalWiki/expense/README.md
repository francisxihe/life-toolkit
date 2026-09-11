# Expense 技术域

记账数据与成长平级，页面从 `/activity/expense` 进入。渲染层复用原交易 / 预算 / 总览页面与 VO，主进程改为 TypeORM + SQLite，不再把交易和预算只放在 React Context 内存里。

## 代码落点

```
packages/business/vo/expense/
packages/business/web-service/controller/expense.ts
apps/desktop/src/service/expense/           # Transaction / Budget Entity、Service、IPC
apps/desktop/src/render/features/expense/   # 页面仍通过 ExpenseController 读写
```

创建交易后由活动卡记录服务写一张支出/收入卡。Capture 采纳走同一 `expenseService`，可 `skipActivity` 以免与活动卡事务重复建卡。
