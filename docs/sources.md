# 项目资料索引

| 来源 | 用途 | 证据边界 |
| --- | --- | --- |
| [原 Weave Demo](https://0xrelander.github.io/weave-demo/#/fusion) | 现有页面、Context 变化影响工作的方法 | 前端演示不证明已接入真实模型或企业系统 |
| [原代码仓库](https://github.com/0xrelander/weave-demo) | 设计参考与项目作者身份 | 该仓库当前只有读取权限 |
| [OKKI AiReach](https://www.xiaoman.cn/products/ai_reach.html) | 客户背调、历史整合、获客与触达的功能对标 | 厂商功能介绍不是本项目的效果证据 |
| [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) | 评审负责人配置 | 实际生效依赖仓库权限、计划和规则 |

产品方向还来自本项目用户讨论，已经确认的内容整理在 product-context。未验证的商业判断不得引用为行业既定结论。源码中的数据均为演示 fixtures。

## v0.2 外贸背调方法参考（2026-09-17 核对）

- [中国信保：资信服务](https://www.sinosure.com.cn/ywjs/gdyw/zxfw/index.shtml)：企业身份、经营财务、信用与交易信息；提单报告的采购发现用途。用于定义报告维度，不声称已获 API 授权。
- [中国信保：短期出口贸易险](https://www.sinosure.com.cn/ywjs/myxcp/dqckxybx/dqckxybxjj/index.shtml)：应收汇商业/政治风险与出口前风险存在不同保障范围。Demo 不自动批准保险额度或推算赔款。
- [Companies House：企业信息](https://www.gov.uk/get-information-about-a-company)：登记地址、董事、历史名称、抵押与破产信息等查询字段；仅英国示例，不推广为全球统一覆盖。
- [美国商务部 ITA：付款方式](https://www.trade.gov/methods-payment)：预付、信用证、托收、赊销与寄售的风险结构。用于付款条件解释，不直接套用美国法律要求到中国出口商。
- [OFAC FAQ 5：名称匹配核实](https://ofac.treasury.gov/faqs/5)：潜在同名线索需要额外主体标识核验；具体适用性按交易法域确定。

上述是设计方法来源，不是 Seabrook、North 等虚构公司的信用报告。真实背调必须获取对应主体、时间与授权范围内的证据。


## 2026-09-18 商业及开源调研

[订单确认推荐 PRD](order-confirmation-prd.md) 第 02–06 节记录 14 个商业产品及 12 个开源或源码可见项目的原始链接、证据口径及选型边界。调研支持工作流取舍，不证明织见已经实现同类收益。
