# 知域 · Technology Atlas V3

Technology Atlas V3 是一个可直接部署到 GitHub Pages 的纯静态技术学习站点，目标是把「专业技术杂志 + 知识地图 + 工程实验室 + 每日情报」放在一个入口里。

## V3 重点升级

- 全面重做首页：杂志化编辑视觉、今日学习、变化雷达、跨领域 System Spine。
- 26 个知识节点全部有完整正文，不再存在“点击没反应”的空节点。
- 每个知识专题统一包含：
  - 概念与工程定义
  - 系统流程图
  - 3 个快速事实
  - 4 个以上正文小节
  - 核心公式/关系
  - 工程参数表
  - 常见误区
  - 关联知识
  - 原始/参考来源
- 世界模型专题增加 VLM / VLA / World Model / World-Action Model 对比。
- 100MW AI Factory Lab 增强：
  - IT Load / PUE / 单柜功率 / CDU / ΔT 参数联动
  - Facility Load / 机柜 / CDU / 水流量 / 年耗电实时计算
  - Power / Cooling / Fabric 系统图
  - 故障注入与传播说明
  - 一键回到关联知识手册
- 市场洞察采用“来源 + 报告期 + 核验时间”结构，不把预测值写成已发生事实。
- 手机端重做为纵向学习流，并增加底部导航。
- 保留 GitHub Pages 和每日自动情报刷新。

## 本地预览

无需安装依赖：

```bash
python3 -m http.server 8080
```

浏览器打开：

```text
http://localhost:8080/
```

## 部署到 GitHub Pages

1. 把本目录所有文件上传到仓库根目录。
2. 确认 `.github/workflows/main.yml` 存在。
3. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
4. 推送/提交后，到 Actions 查看 `Deploy Technology Atlas to GitHub Pages`。
5. 成功后访问：

```text
https://<你的GitHub用户名>.github.io/<仓库名>/
```

例如：

```text
https://alumgs.github.io/alu-tech-atlas/
```

## 每日自动刷新

`.github/workflows/daily-refresh.yml` 每天 00:10 UTC（北京时间/台北时间 08:10）运行：

```bash
npm run refresh
```

自动发现层只更新 `data/daily.json`，不会未经核验就覆盖长期知识手册。

## 数据说明

- IEA 2026 数据中心用电：2025 约 485 TWh，2030 中央情景约 950 TWh。
- NVIDIA NVL72 AI Factory 参考架构公开：full rack up to 142 kW。
- NVIDIA Spectrum-6 2026 公开容量：102.4 Tb/s。
- OpenAI Agents API：2026-09-10 公测发布。
- NVIDIA Cosmos 3：2026-05-31 发布。

站点中的工程计算为学习/设计推演用途，不替代正式工程设计或设备选型。
