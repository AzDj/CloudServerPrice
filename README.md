# 云商比价

云商比价是一个用于横向比较云服务厂商公开价格与规格的单页前端工具。页面聚焦云服务器、对象存储、云数据库、带宽流量与 CDN 等常见资源。当前表格价格与规格为前端静态比价口径，不是爬虫直接生成的结构化价格数据；构建前爬虫优先抓取各云商中国站或中文官方公开文档，生成前端只读的官方文档资讯，作为后续核对和结构化采集入口。

## 项目定位

- 项目英文名：Cloud Server Price
- 推荐简写：CSPC
- 页面类型：内部工具式价格指数面板
- 表格数据：前端静态比价口径，当前不是爬虫直接生成
- 资讯数据：构建前爬虫优先抓取中国站或中文官方公开文档后生成
- 前端安全边界：页面不保存、不读取、不展示任何云厂商密钥
- 迁移策略：无迁移，直接替换

## 当前功能

- 多云厂商横向比价：阿里云、腾讯云、华为云、AWS、Azure、Google Cloud。
- 多资源类型对比：云服务器、对象存储、云数据库、带宽与流量、CDN。
- 云服务器常见规格筛选：`1C2G`、`2C4G`、`4C8G`、`4C16G`、`8C16G`、`8C32G`。
- 支持地域、计费方式、资源类型、币种和排序筛选。
- 支持紧凑模式、暗色模式、只看最低价。
- 支持最低价绿色标记和 `最低` 标签。
- 支持就近地域、非筛选地域、就近规格、非筛选规格红色提醒。
- 支持在官方文档资讯中搜索 GCP `e2-medium` 等结构化实例规格。
- 支持云商官网、官方文档和 GitHub 仓库跳转。
- 移动端保留横向滚动表格，不降级为卡片。

## 技术栈

- Vite
- React
- Cheerio
- Node.js 原生 `fetch`
- 原生 CSS Grid / Table / CSS 变量

## 快速开始

安装依赖：

```bash
npm install
```

抓取官方文档资讯：

```bash
npm run docs:crawl
```

启动本地开发服务：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

`npm run build` 会先执行 `prebuild`，自动运行 `npm run docs:crawl` 并刷新 `src/generated/official-docs-data.js`。

本地预览构建产物：

```bash
npm run preview
```

运行测试：

```bash
npm run test
npm run test:coverage
```

## 目录结构

```text
.
├── .github
│   └── workflows
│       └── deploy.yml
├── index.html
├── package.json
├── package-lock.json
├── scripts
│   ├── crawl-official-docs.mjs
│   └── crawl-official-docs.test.mjs
├── src
│   ├── generated
│   │   └── official-docs-data.js
│   ├── main.jsx
│   └── styles.css
└── README.md
```

## 官方文档爬虫

爬虫入口为 `scripts/crawl-official-docs.mjs`。脚本只抓取配置在 `官方文档来源` 中的 HTTPS 官方域名白名单地址，来源优先级为“中国站中文页面 > 官方中文页面 > 官方公开价格页”。默认来源包括：

- 阿里云：`help.aliyun.com`
- 腾讯云：`cloud.tencent.com`
- 华为云：`huaweicloud.com`
- AWS 中国：`amazonaws.cn`
- Azure 中国：`azure.cn`
- Google Cloud 中文：`docs.cloud.google.com/compute/docs/general-purpose-machines?hl=zh-CN`

爬虫会用 Cheerio 移除脚本、样式、导航和页脚等非正文内容，再按价格、计费、实例、存储、网络、带宽、CDN 等关键词抽取摘要、正文摘录和命中关键词。该流程不会把官方页面价格自动解析成表格行列，也不会替代表格中的静态价格口径。
GCP 主入口直接使用 Compute Engine 通用机器系列官方文档，确保 `e2-medium` 的 E2 共享核心规格可被页面和源码搜索命中；虚拟机实例价格页作为相关官方链接保留。

退避策略：

- HTTP 429：固定等待 20 秒后重试一次。
- HTTP 5xx 或超时：等待 2 秒后重试一次。
- 默认不因为单个来源失败中断构建；失败会写入生成数据并在页面显示失败状态。
- 若需要所有来源失败时让 CI 失败，可设置 `CRAWLER_STRICT=1`。

## 生成数据模型

`src/generated/official-docs-data.js` 由爬虫生成，字段包括：

```text
id
名称
url
最终地址
标题
摘要
正文摘录
命中关键词
相关链接
实例规格
状态
http状态
内容类型
抓取时间
```

该文件只保存公开网页抽取结果，不保存请求签名、账号、密钥、Cookie 或登录态响应。

## GitHub Actions 与 Pages

当前仓库内置 `.github/workflows/deploy.yml`。推送到 `main` 或 `master` 后会执行：

1. 拉取仓库代码。
2. 安装 Node.js 与 npm 依赖。
3. 运行 `npm run build`。
4. `prebuild` 自动抓取官方文档资讯并生成静态数据。
5. Vite 构建静态页面。
6. 上传并部署 GitHub Pages。

当前 Pages 使用自定义域名 `csps.zeroding.com`，工作流固定以 `/` 作为 Vite 资源路径构建，避免页面在自定义域名根路径下加载 `/CloudServerPrice/assets/...` 失败。Pages 只发布 `dist` 中的静态文件。浏览器端不会执行爬虫，也不会读取云厂商密钥。

## 密钥情况

当前实现只读取公开官方文档，不需要云厂商 AccessKey、SecretKey、Token 或服务账号。

- 本地开发：不需要密钥。
- 官方文档爬虫：不需要密钥。
- GitHub Pages 构建与发布：只使用 GitHub Actions 自动注入的 `GITHUB_TOKEN`。
- 不要使用 `VITE_` 前缀保存任何密钥，`VITE_` 变量会进入浏览器端构建产物。
- 若某价格只能通过登录态、验证码、专属协议或非公开接口获得，不应在本项目中绕过访问控制。

## 价格口径

当前表格价格仍为展示口径，官方文档资讯用于提示来源与人工核对方向；尚未完成“官方文档/API -> 结构化价格 JSON -> 前端表格”的自动链路。后续若继续推进真实价格结构化，应统一以下口径：

- 地域与可用区
- 资源规格
- 计费方式
- 币种
- 单价单位
- 包年包月折算方式
- 网络流量价格
- 存储价格
- 免费额度
- SLA
- 是否为就近地域
- 是否为就近规格

## 免责声明

官方文档资讯由公开网页抓取生成，表格价格仍需按来源文档逐项核对。实际成交价受采购规模、专属协议、定向优惠影响，仅供选型参考，非最终结算价。

## 开发约束

- 所有代码、注释和文档使用中文。
- 新文件使用 UTF-8 无 BOM。
- 前端不得包含云厂商账号、密钥、签名逻辑或登录态信息。
- 页面优先保持表格横向对比形态，不改成营销页或卡片列表。
- 无迁移，直接替换。
