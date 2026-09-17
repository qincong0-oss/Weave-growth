# 项目协作与协调人职责

| 角色 | 人员 | 职责 |
| --- | --- | --- |
| 产品与商业负责人 | Nick `@qincong0-oss` | 客户访谈、价值判断、范围与商业承诺、最终产品决定 |
| 项目协调人 | `@0xrelander` | 拆分 Issue、组织开发和技术评审、维护里程碑与共享上下文 |
| 实现成员与 AI | 按具体 Issue 确定 | 在相应分支实现、验证、提交证据并更新交接状态 |

协调人负责让工作可衔接，产品负责人决定优先级。重大分歧记录在 Issue，达成决定后写入决策记录，避免决定只存在某个人与 AI 的聊天中。

## 一轮协作

需求或客户反馈进入 Issue，说明证据、预期行为和验收条件。协调人确定范围和负责成员。实现者读取共享上下文、创建分支、实现并提交 PR。技术影响由协调人评审，产品边界变化由 Nick 确认。合并后更新当前状态；重要决定进入 ADR。

## GitHub 配置状态

远程仓库 `qincong0-oss/Weave-growth` 已创建，角色文件和 CODEOWNERS 随源码提交。成员邀请尚未由本次工具操作发送。实际协作者权限由仓库所有者授予，收到邀请后由对方接受。

个人账号仓库采用所有者与协作者权限；不能把“coordinator”当成 GitHub 自带权限级别。根据实际需要授予协作者写入能力，协调人不需要因此获得账号所有权。

CODEOWNERS 只有在被列出的人员具备所需仓库权限、功能适用于当前计划且基础分支有对应文件时，才能参与自动评审请求。是否要求代码负责人批准，由仓库规则另外配置；文件本身不强制禁止合并。

参考：[GitHub 仓库权限](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)、[CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)。
