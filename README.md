# 知域 ATLAS · GitHub + Cloudflare

正式应用源码从最新 Sites 手机适配版完整迁移。GitHub `main` 为唯一生产源，Cloudflare Workers 承载页面与服务端接口；不是 GitHub Pages 静态站。

## 保留的功能

- AIDC、具身智能、机器学习三个领域；总览、知识手册、产业动态、企业观察、案例研习、研报中心六个栏目。
- 40 篇专题、知识百科词条、图解、公式、工程核对、原始资料链接。
- 完整液冷机房机器人巡检交互案例与参数计算。
- 中英文资讯分源采集、中国区与时间筛选、来源健康状态、浏览器缓存、打开后自动更新。
- 世界银行 / FRED / OpenRouter 数据接口及报告期标识。
- 当前领域 HTML 研报导出，可打印为 PDF。
- 手机底部导航、折叠筛选、横滑分类、阅读目录与安全区。
- 独立密码登录：不依赖 ChatGPT、Sites 或知识库登录会话。

## 对齐 Knowledge Studio 的部署结构

| 层 | 知域 ATLAS | Knowledge Studio |
|---|---|---|
| 代码 | `Alumgs/alu-tech-atlas` 的 `main` | `Alumgs/AIDC_Robot_Battle` 的 `main` 下 `knowledge-studio/` |
| 部署 | GitHub Actions → Cloudflare Worker `alu-tech-atlas` | GitHub Actions → Worker `alu-knowledge-studio` |
| 页面与 API | React / Vinext + Worker | 静态页面 + Worker |
| 数据 | 公开资讯源 + 原创手册 + 浏览器缓存 | 私人知识资产与持久存储 |
| 访问 | 独立密码，12 小时签名会话 | 知识库原有独立鉴权 |

知域目前没有可编辑个人资产，因此不额外创建 D1/R2/Durable Objects。两个站点不共享密码、令牌或私人文件。当前知识库生产分支未验证存在发布 Feed，本迁移不声称已完成双向联动。

## 首次发布：在本仓库设置三个 Actions Secrets

GitHub → Settings → Secrets and variables → Actions：

| Secret | 内容 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 对目标账户有 Workers Scripts 编辑权限的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID |
| `ATLAS_ACCESS_PASSWORD` | 自己设置的网站访问密码，12–256 个字符 |

知识库仓库中的 Secrets 不会自动共享到本仓库，也无法从 GitHub 反向读出。不要把它们写进源码、Issue 或聊天消息。

配置后 Actions → `Validate and deploy Atlas to Cloudflare` → Run workflow。之后推送 main 自动更新。仅需这一个自动部署链路，不要再添加重复的 Cloudflare Git 自动构建。

流程依次执行锁文件安装、TypeScript 检查、鉴权测试、构建、Worker dry run、部署、写入密码派生值、线上冒烟测试。缺少密码配置时 Worker 返回 503，不会开放访问。每次部署重建签名密钥，现有登录需重新登录。

预计使用原账户子域名：`https://alu-tech-atlas.alumgs-lab-b74ee9.workers.dev`。这只是配置目标，不代表已经发布成功；以 Actions 的 Deploy 和 Verify production 步骤为准。使用其他账户或自定义域名时，将 Repository Variable `ATLAS_BASE_URL` 改为实际地址。

## 本地开发

Node.js 22.13+；使用 package.json 指定的 pnpm 版本。

```bash
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm deploy:check
```

正式密码可通过 GitHub Actions Secret 设置。也可以在已登录 Cloudflare 的本地终端运行 `pnpm setup:password`，隐藏输入密码并直接写入 Worker Secrets。不要保存明文密码文件。

`pnpm dev` 使用 Vite；`pnpm preview` 使用打包后的 Worker。运行访问鉴权测试时需在未提交的 `.dev.vars` 中配置有效的 `ATLAS_PASSWORD_HASH` 和至少 32 字符的 `ATLAS_SESSION_SECRET`，生产值不要用于测试。

## 目录

- `app/`：门户、文章、案例、`api/updates`、`api/indicators`。
- `lib/`：完整知识内容、来源目录、研报生成。
- `hooks/`、`components/`：刷新状态、图表、搜索及界面组件。
- `worker/`：入口鉴权、密码派生校验、签名 Cookie、限流与安全响应头。
- `scripts/`：密码配置、CI 配置及冒烟检查。
- `.github/workflows/cloudflare.yml`：唯一 CI/CD。

## 迁移边界与安全

- 原 Sites 网站保持运行；其 `chatgpt.site` 地址不能作为自己的 Cloudflare Worker 地址直接继承。
- 迁移提交前应先创建 `backup/pre-sites-migration-20261007` 备份分支。本次 GitHub 插件创建分支返回 403，尚未创建备份、写入源码或变更旧 Pages。新工程仅包含 Cloudflare 工作流；实际迁移时需删除旧 Pages 工作流。
- GitHub 仓库当前公开，源码和手册可直接在 GitHub 阅读。网站密码保护运行站点，不会让公开仓库变私有；私有资产和凭据不包含在本次迁移中。
- 所有网页、静态资源、RSC 请求、资讯和指标接口都经过密码鉴权；仅 `/api/health` 和登录入口公开。
- 密码采用随机盐 PBKDF2-SHA256（100,000 轮）；Cookie 为 HttpOnly、Secure、SameSite=Strict、host-only；登录和退出校验同源；登录与资讯 API 有速率限制。
- 登录密码更新使旧会话失效。退出会清除本机 Cookie；无状态会话没有服务端逐个撤销列表，疑似泄露时应更新密码或签名密钥。
- 只从源码固定信息源抓取；不提供任意 URL 代理。服务端失败保留状态，不伪造最新日期。
- 当前仍是“打开页面刷新”，没有新设后台定时任务；浏览器缓存不跨设备迁移。
- 本地验证并不代表所有外部信息源在 Cloudflare 上都可用，最终查看线上来源状态。
