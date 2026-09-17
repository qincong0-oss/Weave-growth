# 织见 Weave

面料企业持续售前增长 Demo。基于现有产品持续发现和背调客户，将触达反馈转化为销售机会、产品方向和公司知识。

这是可运行的交互原型。所有企业、产品、回复、发送与 CRM 回写均为演示数据；没有真实邮件、模型或企业系统连接。

## 快速体验

打开根目录 `index.html`，或在 Node.js 20 及以上环境中运行：

```bash
npm run build
npm run dev
```

访问 `http://localhost:4173`。点击“看一次完整闭环”体验 8 个业务步骤。直接访问 `#/fusion` 可进入客户与产品依据页面。状态保存于当前浏览器，可在“演示控制”中重置。

项目没有 npm 运行依赖，无需安装依赖包。根目录 `index.html` 是由可维护源码构建的单文件发布版本，可以独立分享。

## 团队与共享上下文

- 产品与商业负责人：Nick，GitHub `@qincong0-oss`。
- 项目协调人：`@0xrelander`，负责议题拆分、技术衔接、评审组织与上下文整理。首位为数字 0。
- 成员邀请和代码评审规则仍待配置；文档中的角色声明不会自动授予 GitHub 权限。

任何成员或 AI 开始工作前，依次阅读 [AGENTS.md](AGENTS.md)、[当前状态](context/current-state.md)、[产品共识](docs/product-context.md)，再按任务阅读 [PRD](docs/prd.md) 与相关决策。

## 目录

| 位置 | 内容 |
| --- | --- |
| `src/data.mjs` | 脱敏演示数据与初始状态 |
| `src/engine.mjs` | 匹配、事件、失效传播、发送与交接规则 |
| `src/app.mjs` | 页面、导航、对话框与引导演示 |
| `src/styles.css` | 响应式界面与面料示意纹理 |
| `scripts/` | 构建、预览和 GitHub 初始化脚本 |
| `tests/` | 关键业务行为验证 |
| `context/` | 新成员和 AI 的工作入口与当前状态 |
| `docs/` | 产品共识、PRD、架构、决策和演示脚本 |
| `.github/` | 代码负责人、Issue/PR 模板、CI 和手动发布工作流 |

## 修改与验证

```bash
npm test
npm run build
```

修改 `src` 后必须重新生成 `index.html`。构建脚本仅处理本项目的简单模块结构：导入语句单独占一行，使用具名导出，不使用动态导入或默认导出。业务扩展到真实后端时再升级构建体系。

业务指标全部从状态计算。模拟发现只会新增一次候选客户；“没有新信息”是合法状态。发送、拒收、交接与产品变更需要通过业务规则验证。

## 远程仓库接入状态

远程仓库：[qincong0-oss/Weave-growth](https://github.com/qincong0-oss/Weave-growth)，由项目所有者创建为公开仓库。当前代码、PRD 和协作上下文在本仓库共同维护。

GitHub Pages 首次设置待完成。进入仓库 Settings → Pages，选择 **Deploy from a branch → main → /(root) → Save**。之后 `main` 的静态文件会自动发布。根目录 `.nojekyll` 让 Pages 直接提供已经构建好的 HTML。

预期演示地址：`https://qincong0-oss.github.io/Weave-growth/`。只有 Pages 部署成功且访问确认后，才能将其标为已上线。仓库名称中的 `W` 为大写。

`@0xrelander` 的实际成员邀请和强制评审规则仍待仓库所有者配置。已有 `scripts/bootstrap-github.sh` 保留为最初的初始化参考；本仓库已创建，无需再执行。

`.github/workflows/pages.yml` 是备用的手动 Actions 发布方式，使用前需将 Pages Source 切换为 GitHub Actions。当前推荐直接从 `main` 分支发布。

## 设计来源

延续 [原织见 Demo](https://0xrelander.github.io/weave-demo/#/fusion) 的企业产品与市场信息结合思路，重新组织为持续售前循环。当前代码为独立重构，没有直接编辑原站压缩产物。面料图形为界面示意，不能作为真实产品质感或性能依据。
