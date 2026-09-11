# Activity 技术域

活动卡是跨领域索引，不是万能父实体。领域事实仍保存在成长、记账、采购、收藏各自的表中；`Activity` 只记录发生时间、标题/摘要、来源和可选 capture message，`ActivityLink` 指向同一生活事件下的领域对象。

Activity 是宿主 Plugin Platform 能力，不是 `@true-north/plugin-*` 包。插件中心首页的「最近活动」展示时间线；`/plugins/activity` 与 `/activity` 兼容跳转到 `/plugins`。

## 代码落点

```
packages/business/enum/activity/            # ActivityDomain、ActivityCaptureKey 等
packages/business/vo/activity/              # Activity VO、capture suggestion / adopt VO
packages/business/web-service/controller/activity.ts
packages/plugin-sdk/src/activity.ts         # ActivityPort、Today、entity ref
apps/desktop/src/service/activity/          # Entity、Service、RouteController、AI
apps/desktop/src/render/plugin/activity/    # 时间线与收集工作台
```

## 采纳事务

AI 会话里的记录意图经 `activity.capture` 工作台确认后，走 **`POST /activity/adopt`** → `ActivityService.adoptCapture`。Adopter 由各领域插件贡献；workspace 写回通过注入的 `workspaceWriter`。

插件先在自己的存储里写入领域记录，再由宿主在 AI/Activity 库事务中创建活动卡、链接，并把 workspace 建议标为已采纳。插件写入与宿主写入不再共享同一 SQLite 事务；宿主后失败时，允许留下尚未挂到活动卡上的领域行。

领域页直接创建走各领域 Service，成功后经 `ActivityPort.record` 补一张单链接卡。

删除活动卡不级联删除领域数据；删除领域数据时失效对应链接。

## 查询

- `GET /activity/list`：按时间、领域、关键词列活动卡
- `GET /activity/home-today`：侧栏「今天」清单与插件中心今日摘要
- `POST /activity/adopt`：收集工作台采纳
