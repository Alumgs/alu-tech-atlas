# 知域 · Technology Atlas V2

面向长期学习与技术观察的静态知识站点，覆盖：

- AIDC 智算中心
- 具身智能
- 机器学习

核心能力：

1. 统一知识地图与知识手册；
2. “今日学习”按日期轮换；
3. 100MW AI Factory 交互案例实验室；
4. 产业动态 / 科研进展 / 企业观察 / 市场洞察统一结构；
5. GitHub Actions 每日刷新官方 RSS 情报；
6. GitHub Pages 自动部署；
7. 桌面端与手机端自适应。

## 本地预览

无需构建：

```bash
python3 -m http.server 8080
```

打开 `http://localhost:8080`。

## GitHub Pages

推送到 `main` 后，`.github/workflows/pages.yml` 会自动部署。

首次使用需要在仓库 `Settings -> Pages -> Build and deployment` 中选择 **GitHub Actions**。

## 每日刷新

`.github/workflows/daily-refresh.yml` 每天 00:10 UTC（亚洲台北 08:10）执行：

```bash
npm run refresh
```

当前自动刷新层优先发现官方源内容，并写入 `data/daily.json`。主知识图谱中的“高价值变化”仍应经过人工核验再写入 `data/content.js`，避免把普通新闻等同于技术路线变化。

## URL 结构

兼容 query 参数：

- `?domain=home&view=today`
- `?domain=aidc&view=knowledge`
- `?domain=aidc&view=case`
- `?domain=embodied&view=research`
- `?domain=ml&view=news`

## 数据说明

初始市场数据和动态条目均在页面中标注来源、发布时间和核验日期。市场预测与实际值应明确区分。
