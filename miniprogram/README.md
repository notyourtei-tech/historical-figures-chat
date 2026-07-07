# 万古灵犀 · 微信小程序

> 与历史伟人对话 — 跨越时空的枷锁，探寻千年的智慧

基于原 Next.js Web 应用 `historical-ai-platform` 完整迁移至微信小程序。

---

## 项目结构

```
miniprogram/
├── app.json              # 小程序配置
├── app.ts                # 小程序入口
├── app.wxss              # 全局样式
├── project.config.json   # 开发者工具配置
├── sitemap.json          # 站点地图
│
├── pages/
│   ├── index/            # 主页：古人选择/搜索/筛选
│   │   ├── index.json
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.ts
│   ├── chat/             # 聊天页面
│   │   ├── chat.json
│   │   ├── chat.wxml
│   │   ├── chat.wxss
│   │   └── chat.ts
│   └── onboarding/       # 引导页：语言/兴趣/姓名
│       ├── onboarding.json
│       ├── onboarding.wxml
│       ├── onboarding.wxss
│       └── onboarding.ts
│
├── components/
│   ├── celebrity-card/   # 古人卡片组件
│   └── chat-message/     # 聊天消息组件
│
├── utils/
│   ├── types.ts          # 类型定义
│   ├── i18n.ts           # 多语言翻译（zh/en/ja/vi/my）
│   ├── celebrities.ts    # 58位古人数据
│   └── ai-service.ts     # AI 聊天服务 + 本地存储
│
└── cloudfunctions/
    └── aiChat/           # 云函数：代理 OpenRouter API 调用
        ├── index.js
        ├── package.json
        └── config.json
```

## 功能特性

| 功能 | 说明 |
|------|------|
| 🌐 **5 语言支持** | 中文/English/日本語/Tiếng Việt/မြန်မာ |
| 👤 **58 位历史古人** | 从孔子到乔布斯，涵盖哲学/科学/文学/军事/艺术 |
| 💬 **AI 实时对话** | 通过云函数调用 OpenRouter API，免费模型 |
| 🎨 **水墨风设计** | 古典朱红配色，适配微信小程序设计规范 |
| 📱 **引导流程** | 语言选择 → 兴趣标签 → 姓名输入 |
| 💾 **本地存储** | 聊天记录和历史列表持久化 |
| 🔄 **重试机制** | 消息发送失败可重试 |
| ⌨️ **键盘适配** | 自动调整输入框位置 |

## 部署步骤

### 1. 注册微信小程序

1. 前往 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序账号
2. 获取 AppID

### 2. 配置开发者工具

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开项目，选择 `miniprogram/` 目录
3. 在 `project.config.json` 中填写你的 `appid`

### 3. 获取 OpenRouter API Key

1. 前往 [openrouter.ai](https://openrouter.ai/) 注册账号
2. 在 [Keys](https://openrouter.ai/keys) 页面创建 API Key
3. 免费额度足够日常使用

### 4. 配置云函数

1. 在微信开发者工具中，点击「云开发」开通云环境
2. 右键 `cloudfunctions/aiChat` → 上传并部署
3. 在云函数环境变量中添加 `OPENROUTER_API_KEY`：
   - 进入云开发控制台 → 云函数 → aiChat → 版本与配置 → 环境变量
   - 添加 Key: `OPENROUTER_API_KEY`，Value: 你的 API Key

### 5. 配置服务器域名白名单

在微信公众平台后台：
- 开发 → 开发管理 → 开发设置 → 服务器域名
- 添加 request 合法域名：
  - `https://openrouter.ai`（云函数内部调用，可能不需要）

### 6. 预览和发布

1. 点击「编译」查看效果
2. 点击「预览」在手机上测试
3. 确认无误后，点击「上传」提交审核

## 替代方案（不使用云函数）

如果不想使用微信云开发，可以将 `utils/ai-service.ts` 中的 `callCloudFunction` 改为 `callHttpApi`，然后：

1. 部署 Next.js 项目到 Vercel（项目根目录已有 `vercel.json`）
2. 配置环境变量 `OPENROUTER_API_KEY`
3. 在小程序后台添加 Vercel 域名为合法 request 域名
4. 修改 `ai-service.ts` 中的 `https://your-proxy-server.com/api/chat` 为你的 Vercel 域名

## 与原 Next.js 项目的差异

| 方面 | Next.js (Web) | 微信小程序 |
|------|--------------|-----------|
| 框架 | React + Next.js | 原生小程序 |
| 路由 | 文件路由 (App Router) | pages 配置 |
| 样式 | Tailwind CSS | WXSS |
| AI 调用 | 直接 fetch → OpenRouter | 云函数代理 |
| 存储 | localStorage | wx.setStorageSync |
| 组件 | React Components | 自定义组件 |
| 动画 | Framer Motion | CSS transition/animation |
| 状态管理 | React Context | App.globalData |

## 开发注意事项

1. **TypeScript 支持**：小程序原生支持 TypeScript，无需额外配置
2. **WXS**：模板中无法直接调用 JS 方法，需要 WXS 或提前计算
3. **图片**：头像使用 dicebear API，需要在后台添加域名白名单
4. **云函数超时**：默认 3 秒，建议在云开发控制台设置为 20 秒
5. **免费模型限流**：OpenRouter 免费模型有速率限制，如果经常失败，考虑升级或添加更多模型

## 后续优化建议

- [ ] 添加 MBTI 性格测试功能
- [ ] 支持流式输出（SSE → WebSocket）
- [ ] 添加分享卡片功能
- [ ] 支持深色模式
- [ ] 添加语音输入
- [ ] 聊天记录云端同步
- [ ] 添加古人专属背景图
