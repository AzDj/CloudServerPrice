# 云商比价

云商比价是一个用于横向比较云服务厂商公开价格与规格的单页前端模板。当前页面聚焦云服务器、对象存储、云数据库、带宽流量与 CDN 等常见资源，适合作为后续 GitHub Actions 定时采集数据并发布到 GitHub Pages 的展示层。

## 项目定位

- 项目英文名：Cloud Server Price
- 推荐简写：CSPC
- 页面类型：内部工具式价格指数面板
- 当前数据：前端模拟数据
- 后续数据来源：GitHub Actions 使用私有环境密钥调用云厂商 API 后生成静态数据
- 前端安全边界：Pages 页面不保存、不读取、不展示任何云厂商密钥

## 当前功能

- 多云厂商横向比价：阿里云、腾讯云、华为云、AWS、Azure、Google Cloud。
- 多资源类型对比：云服务器、对象存储、云数据库、带宽与流量、CDN。
- 云服务器常见规格筛选：`1C2G`、`2C4G`、`4C8G`、`4C16G`、`8C16G`、`8C32G`。
- 支持地域、计费方式、资源类型、币种和排序筛选。
- 支持紧凑模式、暗色模式、只看最低价。
- 支持最低价绿色标记和 `最低` 标签。
- 支持单项低价绿色标记。
- 支持就近地域、非筛选地域、就近规格、非筛选规格红色提醒。
- 支持云商官网跳转与 GitHub 仓库跳转。
- 移动端保留横向滚动表格，不降级为卡片。

## 技术栈

- Vite
- React
- 原生 CSS Grid / Table / CSS 变量
- 少量浏览器端状态逻辑

## 快速开始

安装依赖：

```bash
npm install
```

启动本地开发服务：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## 目录结构

```text
.
├── index.html
├── package.json
├── package-lock.json
├── src
│   ├── main.jsx
│   └── styles.css
└── README.md
```

## 数据模型建议

后续从 GitHub Actions 生成静态数据时，建议输出统一 JSON 字段：

```text
vendor
resource_type
region
zone
instance_family
instance_type
cpu
memory_gib
architecture
billing_mode
price
currency
unit
is_lowest
is_good_price
is_nearest_region
is_nearest_spec
source_url
collected_at
```

## GitHub Actions 与 Pages 操作

当前仓库已内置 `.github/workflows/deploy.yml`，页面仍使用前端模拟数据；接入真实采集前，GitHub Actions 只负责安装依赖、构建 Vite 静态产物并发布到 GitHub Pages。

### Actions 操作

1. 在 GitHub 仓库进入 `Settings` -> `Pages`，将 `Build and deployment` 的 `Source` 设为 `GitHub Actions`。
2. 推送到 `main` 或 `master` 分支会自动触发部署；也可以在仓库 `Actions` -> `部署 GitHub Pages` -> `Run workflow` 手动触发。
3. 工作流权限已经配置为 `contents: read`、`pages: write`、`id-token: write`，用于读取仓库、上传 Pages 构件和部署 Pages。
4. 工作流会执行 `npm ci`、计算 Vite `base`、执行 `npm run build -- --base "$VITE_BASE"`，并上传 `dist` 目录。
5. 发布完成后，在 workflow 的 `Deploy to GitHub Pages` 步骤或 `github-pages` 环境中查看部署地址。
6. 当前没有采集脚本，不要在 workflow 中配置伪采集命令；后续新增真实采集脚本后，只允许在采集步骤读取 GitHub Secrets，并输出脱敏后的静态 JSON。
7. 生成数据建议落到 `public/prices.json` 或构建前生成到 `src/generated/prices.json`，文件内容只保留公开价格、规格、来源链接和采集时间，不保留请求签名、账号、密钥或原始鉴权响应。

### Pages 操作

1. 如果站点发布到 `https://<USERNAME>.github.io/` 或自定义域名，Vite `base` 使用 `/`。
2. 如果站点发布到 `https://<USERNAME>.github.io/<REPO>/`，Vite `base` 必须使用 `/<REPO>/`；例如仓库名为 `CloudServerPrice` 时使用 `/CloudServerPrice/`。
3. 当前项目未配置 `vite.config.js`，发布到 GitHub 项目页前需要补齐 `base` 配置或在构建命令中传入对应 `--base`，否则构建后的资源路径可能在 Pages 上 404。
4. Pages 只发布 `dist` 中的静态文件，入口文件必须位于构件根目录，也就是 `dist/index.html`。
5. 发布完成后，在 Actions 的 `github-pages` 环境链接或仓库 `Settings` -> `Pages` 中查看线上地址。

### 密钥情况

当前静态展示与 Pages 发布不需要人工配置云商密钥；`GITHUB_TOKEN` 由 GitHub Actions 自动注入，用于 Pages 部署，不需要写入 Secrets。

| 场景 | 是否需要密钥 | 配置位置 | 说明 |
| --- | --- | --- | --- |
| 本地开发模拟数据 | 不需要 | 无 | 执行 `npm run dev` 即可。 |
| 构建并发布 GitHub Pages | 不需要云商密钥 | 无 | 仅使用 GitHub 自动注入的 `GITHUB_TOKEN`。 |
| 读取公开价格页面或公开价格 API | 通常不需要 | 无 | 若官方公开接口无需鉴权，不配置对应云商密钥。 |
| 调用云商鉴权 API 采集价格 | 需要 | `Settings` -> `Secrets and variables` -> `Actions` | 只放 Repository Secrets 或 Environment Secrets。 |

真实采集时建议按云商拆分密钥，未启用的云商不配置对应密钥：

| 云商 | 建议密钥名 | 用途 |
| --- | --- | --- |
| 阿里云 | `ALIYUN_ACCESS_KEY_ID`、`ALIYUN_ACCESS_KEY_SECRET`、`ALIYUN_REGION_ID` | 查询 ECS、OSS、RDS 等公开价目或账号可见报价。 |
| 腾讯云 | `TENCENTCLOUD_SECRET_ID`、`TENCENTCLOUD_SECRET_KEY`、`TENCENTCLOUD_REGION` | 查询 CVM、COS、TencentDB 等价格接口。 |
| 华为云 | `HUAWEICLOUD_ACCESS_KEY`、`HUAWEICLOUD_SECRET_KEY`、`HUAWEICLOUD_REGION`、`HUAWEICLOUD_PROJECT_ID` | 查询 ECS、OBS、RDS 等价格接口。 |
| AWS | `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_REGION` | 查询 AWS 价格 API 或账号可见报价。 |
| Azure | `AZURE_CLIENT_ID`、`AZURE_CLIENT_SECRET`、`AZURE_TENANT_ID`、`AZURE_SUBSCRIPTION_ID` | 使用服务主体查询 Azure 零售价或订阅报价。 |
| Google Cloud | `GCP_SERVICE_ACCOUNT_JSON`、`GCP_PROJECT_ID` | 使用服务账号查询 Google Cloud 价格或账单目录。 |

密钥约束：

- 云厂商 `AccessKey`、`SecretKey`、Token 只允许保存在 GitHub Actions Secrets 或 Environment Secrets。
- 不要把真实密钥写入源码、README、提交历史、构建产物或浏览器端环境变量。
- 不要使用 `VITE_` 前缀保存密钥，`VITE_` 变量会进入浏览器端构建产物。
- Pages 前端只读取构建后的公开静态 JSON。
- 若某价格只能通过登录态、验证码、专属协议或非公开接口获得，不应在前端绕过访问控制。
- 无迁移，直接替换。

## 价格口径

当前页面以公开价目和模拟数据为模板，后续真实采集时需要统一以下口径：

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

比价数据取自各厂商公开价目文档，实际成交价受采购规模、专属协议、定向优惠影响，仅供选型参考，非最终结算价。

## 开发约束

- 所有代码、注释和文档使用中文。
- 新文件使用 UTF-8 无 BOM。
- 前端不得包含云厂商账号、密钥、签名逻辑或登录态信息。
- 页面优先保持表格横向对比形态，不改成营销页或卡片列表。
- 无迁移，直接替换。
