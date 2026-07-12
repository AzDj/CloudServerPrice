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

## GitHub Actions 与 Pages 设计

建议数据流：

```text
GitHub Actions 私有环境密钥
        |
        v
调用云厂商 API / 读取公开价目数据
        |
        v
生成标准化 JSON
        |
        v
构建 Vite 静态页面
        |
        v
发布到 GitHub Pages
```

密钥约束：

- 云厂商 `AccessKey`、`SecretKey`、Token 只允许保存在 GitHub Actions Secrets 或 Environment Secrets。
- 不要把真实密钥写入源码、README、提交历史、构建产物或浏览器端环境变量。
- Pages 前端只读取构建后的公开静态 JSON。
- 若某价格只能通过登录态、验证码、专属协议或非公开接口获得，不应在前端绕过访问控制。

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
