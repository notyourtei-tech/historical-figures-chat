# 万古灵犀 · Historical Figures Chat

> 一个以隐私优先、角色边界清晰为原则的历史人物对话体验。让用户与思想家、艺术家、科学家和历史人物展开有上下文的交流，同时明确区分创意角色扮演与可核验史实。

[在线体验（Vercel）](https://historical-figures-chat-pi.vercel.app) · [备用部署（Render）](https://historical-figures-chat.onrender.com) · [产品架构](docs/architecture.md) · [生产运行手册](docs/production-setup.md)

## 为什么做这个项目

历史人物对话不应该只是换一张头像的通用聊天机器人。万古灵犀将人物生平、作品、核心思想、语言风格与安全边界组合成可维护的人物档案；界面则以即时通讯的可读性服务一段段严肃、轻松或富有想象力的对话。

产品默认采用本地人物引擎，不调用第三方大模型服务。需要模型增强、Google 登录、邮箱魔法链接、云端会话或错误监控时，运营方必须显式配置并取得相应用户同意。

## 产品能力

- **人物驱动对话**：人物档案、行为契约、上下文压缩与分段回复协同工作，避免“同一个机器人换名字”的体验。
- **鲜活的对话节奏**：支持流式输出、角色插话、多条连续回复、可读的消息分组与一键回到最新消息。
- **移动端优先的聊天体验**：输入区始终留在可视区域；长对话只在消息区滚动；触控设备上复制与反馈操作始终可达。
- **隐私优先**：AI 处理和分析均为明确选择；分析事件不收集聊天正文；本机体验登录不保存或上传密码。
- **可选的真实账号与云端会话**：配置 Supabase 后，可启用 Google OAuth、邮箱魔法链接、行级权限保护的跨设备会话和账户数据导出/删除。
- **内容与运行保障**：输入校验、频率限制、内容治理、结构化安全日志、Sentry 隐私化错误监控以及健康检查端点。
- **多语言界面**：简体中文、英语、日语、越南语与缅甸语。

## 体验原则

| 原则 | 在产品中的落实 |
| --- | --- |
| 角色鲜活，但不伪造史实 | 人物口吻来自结构化档案；重要事实应查证，产品不会把角色扮演当成历史引文。 |
| 对话顺手，不牺牲阅读 | 连续消息自动分组；时间以段落显示；输入区、跳转最新消息和手机触控操作有明确边界。 |
| 隐私不是开关后的附加项 | 默认关闭分析；模型调用必须同意；事件属性禁止包含聊天正文、邮箱、IP 或自由文本。 |
| 先可用，再接入供应商 | 未配置任何第三方服务时，核心浏览和本地人物对话仍然可运行。 |

## 技术栈

| 层级 | 选型 |
| --- | --- |
| 应用框架 | Next.js 16（App Router） + React 18 + TypeScript |
| 界面与动效 | Tailwind CSS、Framer Motion、Lucide |
| 对话运行时 | 本地人物引擎；可选 OpenRouter 兼容模型流式调用 |
| 认证与同步 | 可选 Supabase Auth、Postgres 与 Row Level Security |
| 防护与观测 | Zod、Upstash Redis（可选）、Sentry（可选）、`/api/health` |
| 质量保障 | Jest、Playwright（桌面 Chromium + Pixel 7 模拟）、axe-core、GitHub Actions |

## 架构概览

```text
Browser
  ├─ 本机档案：语言、同意状态、匿名本地会话
  └─ Next.js App Router
       ├─ /api/chat、/api/greeting → 人物契约 → 本地引擎或已同意的模型服务
       ├─ /api/conversations → Supabase（仅已认证且 RLS 允许时）
       ├─ /api/analytics → 明确同意的最小化事件
       └─ /api/health → 高层运行状态，不返回密钥或用户内容
```

完整的数据边界、失败策略和 API 说明见 [架构文档](docs/architecture.md)。

## 本地启动

### 前置要求

- Node.js 20 LTS 或更高版本
- npm 10 或兼容版本

### 运行

```bash
git clone https://github.com/notyourtei-tech/historical-figures-chat.git
cd historical-figures-chat
npm ci
Copy-Item .env.example .env.local # PowerShell
npm run dev
```

打开 `http://localhost:3001`。默认配置是 `HISTORICAL_CHAT_MODE=offline`，无需模型 API Key。

macOS/Linux 可使用：

```bash
cp .env.example .env.local
npm run dev
```

## 环境变量

所有集成都是可选的。不要提交 `.env.local`、服务角色密钥或 OAuth Secret。

| 变量 | 用途 | 默认行为 |
| --- | --- | --- |
| `HISTORICAL_CHAT_MODE` | `offline` 或显式 `online` | `offline`，不调用第三方模型服务 |
| `OPENROUTER_API_KEY` | 可选的在线模型增强 | 未配置时回退到本地人物引擎 |
| `NEXT_PUBLIC_APP_URL` | 公开应用 URL，用于外部模型 Referer 与站点元数据 | 本地开发 URL / 已部署默认 URL |
| `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 浏览器侧 Supabase 配置 | 不启用云端登录与会话同步 |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端的受控账户操作 | 必须保密，绝不加 `NEXT_PUBLIC_` 前缀 |
| `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN` | 生产环境分布式限流 | 使用内存级退化策略 |
| `SENTRY_DSN`、`NEXT_PUBLIC_SENTRY_DSN` | 隐私化错误监控 | 不上报到 Sentry |

关于 Google、邮箱、短信、Supabase 和模型服务的成本及安全边界，请先阅读 [生产配置清单](docs/production-setup.md)。免费套餐可能改变，项目不会将任何第三方免费额度描述为永久承诺。

## 质量门禁

提交前请运行：

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build
npm run test:e2e
```

`npm run test:e2e` 覆盖桌面 Chromium 和 Pixel 7 模拟，验证关键路径：无横向溢出、发送/接收/持久化、长对话输入区可达、首次隐私提示不遮挡输入区、WCAG AA 自动扫描、密码不离开浏览器、以及未经同意不调用 AI 接口。GitHub Actions 会在推送与 Pull Request 上重复执行这些门禁。

真实 Android 与 iOS 仍需要发布前人工验收，步骤见 [真实设备 E2E 清单](docs/real-device-e2e.md)。模拟器不等同于真机签收。

## 部署与运营

- **Vercel / Render**：连接 `main` 分支并配置可选环境变量即可自动部署；部署后检查 `/api/health`。
- **监控与告警**：按 [运行手册](docs/operations.md) 配置健康检查和 Sentry；不要在告警或工单中粘贴用户对话。
- **数据与指标**：事件字典、允许字段和复盘频率写在 [指标计划](docs/measurement-plan.md)。
- **数据库迁移**：云端账号与会话的 RLS 迁移位于 `supabase/migrations/`，上线前必须在独立 Supabase 项目中审阅和执行。

## 贡献

欢迎通过 Issue 和 Pull Request 改进人物档案、可访问性、性能、测试与文档。开始前请阅读 [贡献指南](CONTRIBUTING.md)；安全漏洞请遵循 [安全政策](SECURITY.md)，不要公开发布敏感细节。

## 产品边界

万古灵犀是教育与创意对话产品，不是医疗、法律、心理治疗或金融建议服务。角色的表达可以富有想象力，但不应替代专业意见、原始史料或对当前事实的核验。

## 许可

本仓库当前尚未发布开源许可授权。除适用法律另有规定外，请在复用代码、素材或人物档案前先取得仓库维护者的书面许可。
