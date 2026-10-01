# Technology Atlas V3 手动更新到现有 GitHub 仓库

目标仓库：`Alumgs/alu-tech-atlas`

## 推荐：直接覆盖 V2 文件

V3 继续使用同一个 GitHub Pages 架构，不需要新建仓库。

需要替换/新增：

- `index.html`
- `404.html`
- `styles.css`
- `app.js`
- `package.json`
- `README.md`
- `data/content.js`
- `data/daily.json`
- `scripts/update-feed.mjs`
- `.github/workflows/main.yml`
- `.github/workflows/daily-refresh.yml`
- `.nojekyll`

## 网页上传注意

GitHub 网页上传普通文件时，macOS Finder 默认看不到 `.github` 与 `.nojekyll`。

可以先上传可见文件，然后在 GitHub 网页中分别编辑：

### 部署 workflow

进入 `.github/workflows/main.yml`，用 V3 包中的同名文件全文覆盖。

### 每日刷新 workflow

如不存在：

`Add file -> Create new file`

文件名输入：

`.github/workflows/daily-refresh.yml`

然后粘贴 V3 包中的内容。

## 发布

1. Settings → Pages
2. Source 保持 `GitHub Actions`
3. 提交 V3 文件后进入 Actions
4. 等待 `Deploy Technology Atlas to GitHub Pages` 绿色勾
5. 访问：

`https://alumgs.github.io/alu-tech-atlas/`

## 验收重点

- 首页出现“不是追热点。是持续构建技术地图。”
- AIDC → 知识手册：10 个卡片全部可以点击
- 具身智能 → 世界模型：能看到 4 种模型对比表
- AIDC → 案例实验室：拖动 IT Load 后 Facility Load 等数值实时变化
- 点击“CDU 故障”：Cooling 路径出现故障高亮
- 手机访问：底部出现「今日 / AIDC / 具身 / ML」导航
