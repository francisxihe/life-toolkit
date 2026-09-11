# Purchase 技术域

家庭采购清单，替换原先不符合产品语义的 ERP 演示路由。状态：待购 / 已购 / 取消。已购可关联一条记账交易。

## 代码落点

```
packages/business/enum/purchase/
packages/business/vo/purchase/
packages/business/web-service/controller/purchase.ts
apps/desktop/src/service/purchase/
apps/desktop/src/render/features/purchase/
apps/desktop/src/render/router/routes/purchase.routes.ts
```

第一版只做清单与购买记录，不扩展供应商、库存或进销存。页面入口为 `/activity/purchase`，不再注册 `/erp/page`。
