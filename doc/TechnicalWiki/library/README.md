# Library 技术域

本地收藏是网页 Markdown 的可检索索引。正文与图片仍由 `saveExtractedDocument` 落到 `~/Documents/知止/extract`；数据库只保存标题、URL、摘要、路径和落盘状态。

## 代码落点

```
packages/business/enum/library/
packages/business/vo/library/
packages/business/web-service/controller/library.ts
apps/desktop/src/service/library/
apps/desktop/src/service/extract/save.ts
apps/desktop/src/render/features/library/
apps/desktop/src/render/features/library/workbench/extract.ts  # Workbench 抽出后收藏适配器
apps/desktop/src/service/library/capture.adopter.ts           # Activity 收集采纳
```

同一 URL 再次收藏时提示更新或另存。文件被移走或删除时标记 `MISSING`，不删除索引。Workbench 浏览器标签抽出正文成功后，由 Library 注入的 extract handler 写入 Bookmark，并生成活动卡。页面入口为 `/activity/library`。
