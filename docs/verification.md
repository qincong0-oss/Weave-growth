# v0.1 验证记录

日期：2026-09-17。范围：本地交互演示、远程 CI 和 GitHub Pages 发布。

## 已通过

- Node.js 业务规则测试：16 项通过，0 失败。覆盖暂停、拒收、重复事件、发送额度、资料冲突、需求变化、草稿失效、历史保留、交接及 CRM 回写失败恢复。
- Chromium 桌面浏览器：1440 × 1000；手机视口：390 × 844。六个页面均能导航，未出现页面整体横向溢出。
- 八步演示完成后：1 次模拟发送、1 次销售交接、3 条客户回复、已确认替代产品，状态与演示脚本一致。
- 原混纺草稿失效，确认纯麻替代产品后生成的新草稿使用 HX-L210；已发送记录不被覆盖。
- 搜索、手机导航、暂停状态刷新后保留、演示重置、产品冲突确认、模拟回写通过交互检查。
- 浏览器无未处理 JavaScript 错误；独立 HTML 运行过程中无外部 HTTP 请求。
- 桌面与手机截图已人工检查。手机客户推荐采用完整卡片显示，无须横向滑动才能阅读推荐依据。
- Word PRD 共 13 页，已渲染逐页检查。

## 验证边界

业务数据为固定演示样本。此记录不代表真实模型效果、真实邮件送达率、ERP/CRM 接口可用性或商业转化率已经得到验证。

## 远程仓库检查

完整项目提交 `4e7a131a60cee27ecf4ba055c6c7a05c26a560df` 已推送到 `qincong0-oss/Weave-growth`。31 个远程文件的 Git blob SHA 与本地内容逐项一致。[GitHub Check 工作流](https://github.com/qincong0-oss/Weave-growth/actions/runs/35247382567) 已成功通过测试、构建和生成文件一致性检查。

用户启用 Pages 后，[发布工作流](https://github.com/qincong0-oss/Weave-growth/actions/runs/35247777023) 已成功完成，对应提交 `f0cc41c44d4d3a914deb1eabcedb351929a3c2ad`。[同一提交的 CI](https://github.com/qincong0-oss/Weave-growth/actions/runs/35247587492) 也已通过。

公开地址 [在线 Demo](https://qincong0-oss.github.io/Weave-growth/) 返回 HTTP 200。获取到的 HTML 为 102,040 字节，与本地已通过桌面、手机和业务规则验证的 `index.html` 逐字节一致。此前的 HTTP 404 已随首次发布解决。

## 复现

运行 `npm test` 和 `npm run build`，然后在浏览器打开 `index.html`。按照 `docs/demo-script.md` 体验完整循环；通过“演示控制”单独检查冲突、回复、同步失败与重置。

## v0.2 发布前验证

本轮新增外贸回款背调与产品接入。业务规则测试 30 项通过（原 16 项 + 新增 14 项）。覆盖缺失证据不授信、逾期/部分回款/币种口径、付款方案情景、财务复核幂等、CSV 格式与字段校验、仅相关草稿失效、确认与拒绝、原始行溯源、纯麻要求与料号变更、旧状态迁移。

Chromium 已验证桌面 1440 × 1050 与手机 390 × 844：八个页面、六个报告章节无页面整体横向溢出，原有八步增长演示正常。检查过证据详情、摘要下载、付款方式变更、财务复核、字段映射、API 示例导入、真实本地 CSV 上传、模板下载、规格单样例、接受/拒绝冲突及刷新后保留。导入的 HTML 样本文本被转义，没有执行；浏览器无未处理错误。关键桌面与手机截图已人工检查。

真实征信、ERP/API、OCR、财务审批及多用户数据库未接入。真实 CSV 保存在当前浏览器，未上传任何外部系统。远程 PR、CI 与发布结果以对应 GitHub 记录为准。

### v0.2 上线回执

[PR #2](https://github.com/qincong0-oss/Weave-growth/pull/2) 已合并，提交 `4c1c7af1c2cbe737ef6d5c363d49b689bd33715c`。[PR 检查](https://github.com/qincong0-oss/Weave-growth/actions/runs/35251398719)、[主分支检查](https://github.com/qincong0-oss/Weave-growth/actions/runs/35251466590) 与 [Pages 发布](https://github.com/qincong0-oss/Weave-growth/actions/runs/35251465294) 均成功。

线上 HTML 返回 HTTP 200，162,300 字节，与本地构建逐字节一致。SHA-256：`35473161c576ae84f1a8c319d20c8372bb577918327da6f0612c6f549f568ed4`。本次发布未改变原仓库、未发送客户消息、未接入真实征信或 ERP。


## v0.3 发布前验证

日期：2026-09-18。范围：订单确认、轻量客诉证据、老板价值 HTML、售前回归。

- `npm test`：47 项通过，0 失败（新增 17 项订单规则）。覆盖关键项未解决时禁止批准、人工驳回 AI、草稿编辑与过期版本保护、导出快照、数量变更失效、历史保留、回执不代表执行、客户接受与内部批准分离、未知客诉责任和重复事件。
- `npm run build` 成功生成 `index.html` 与 `boss.html`；`git diff --check` 无空白错误。CI 已同时检查两个生成文件。
- Chromium：桌面 1440 × 1050、手机 390 × 844 的 10 个路由无页面整体横向溢出。检查来源面板与返回焦点、三项确认、草稿手动编辑和刷新保存、内部复核、模拟客户接受、模拟 ERP 暂存回执、真实本地 JSON / CSV 下载、数量变更后的重新确认、客诉与补证。特殊 HTML 文本保持转义。
- 原八步售前演示回归通过，仍为一次模拟发送和一次交接；产品接入字段映射保持正常。
- 老板 HTML：桌面 1440 × 1000 和手机 390 × 844 六幕无横向溢出。播放 / 暂停 / 重播、章节、键盘、减少动画偏好、变更交互、角色与知识标签、价值测算正数 / 负数 / 零 / 空值均通过。关键截图已人工检查。
- 两个独立页面运行中均无未处理 JavaScript 错误；本地演示没有发起外部 HTTP 请求。

### 验证边界

订单、原文和确认事件是内置虚构样例。没有真实 AI、OCR、邮件、ERP、审批身份服务或多人数据库。浏览器内的内部批准只是流程演示。ERP 回执仅为模拟暂存，不证明生产、出货、验收或回款。客诉不是实际已发货事件。测算数字是假设，释放工时价值不等于现金节省或利润；未计入接入培训费用，也未计入无法归因的损失避免。

### v0.3 上线回执

[PR #4](https://github.com/qincong0-oss/Weave-growth/pull/4) 已合并，发布提交 `c751fb22542c6bc84c6fdbef482714eb18392568`。[PR Check](https://github.com/qincong0-oss/Weave-growth/actions/runs/35317911500)、[main Check](https://github.com/qincong0-oss/Weave-growth/actions/runs/35317967387) 与 [Pages 发布](https://github.com/qincong0-oss/Weave-growth/actions/runs/35317966755) 均成功。

2026-09-18 实测两个公开地址均 HTTP 200，且与通过交互验证的本地构建逐字节一致：

| 文件 | 字节数 | SHA-256 |
| --- | ---: | --- |
| `index.html` | 250,146 | `6e84dd408c65c170742fd4344873df6433bae9419f878cc892e8977fcafd7b76` |
| `boss.html` | 52,536 | `b0f4183b6b69213c1f367f4eecf230ed27031f8f963b229da5a17e7f8e57a1b8` |

[老板价值演示](https://qincong0-oss.github.io/Weave-growth/boss.html) 与 [订单工作台](https://qincong0-oss.github.io/Weave-growth/#/orders) 已公开。GitHub 远程提交树与本地验证树一致（`ed30892e036215125d9c649d468b3f96ddb3ee9b`）。本回执仅记录部署证据，不改变生成文件或业务行为。
