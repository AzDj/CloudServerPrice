import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const 更新日期 = '2026-07-12';
const GITHUB_ICON_URL =
  'https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-svg/svg/filled/github.svg';

const 云商列表 = [
  {
    id: 'aliyun',
    名称: '阿里云',
    官网: 'https://www.aliyun.com/',
    图标:
      'https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-svg/svg/outlined/aliyun.svg',
  },
  {
    id: 'tencent',
    名称: '腾讯云',
    官网: 'https://cloud.tencent.com/',
    图标:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBful9R5AgkgsqDMvEr1Qe27H87oOMwqfGJSyZJ5tsjw&s=10',
  },
  {
    id: 'huawei',
    名称: '华为云',
    官网: 'https://www.huaweicloud.com/',
    图标:
      'https://raw.githubusercontent.com/elax46/custom-brand-icons/main/icon-svg/huawei.svg',
  },
  {
    id: 'aws',
    名称: 'AWS',
    官网: 'https://aws.amazon.com/',
    图标:
      'https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/aws.svg',
  },
  {
    id: 'azure',
    名称: 'Azure',
    官网: 'https://azure.microsoft.com/',
    图标:
      'https://raw.githubusercontent.com/teenyicons/teenyicons/master/src/outline/azure.svg',
  },
  {
    id: 'gcp',
    名称: 'Google Cloud',
    官网: 'https://cloud.google.com/',
    图标:
      'https://raw.githubusercontent.com/Keyamoon/IcoMoon-Free/master/SVG/395-google3.svg',
  },
];

const 地域选项 = ['华东', '华北', '华南', '新加坡', '东京', '美国西部'];
const 计费选项 = ['按量', '包月', '包年'];
const 资源类型选项 = ['全部', '服务器', '存储', '数据库', '网络'];
const 服务器规格选项 = ['1C2G', '2C4G', '4C8G', '4C16G', '8C16G', '8C32G'];
const 币种选项 = ['CNY', 'USD'];
const 排序选项 = [
  '按最低月价排序',
  '按 CPU 性价比排序',
  '按内存性价比排序',
  '按 SLA 排序',
];

const 地域映射 = {
  华东: {
    aliyun: '华东 1 杭州',
    tencent: '华东 上海',
    huawei: '华东 上海一',
    aws: 'ap-east-1 香港',
    azure: 'East Asia',
    gcp: 'asia-east2 香港',
  },
  华北: {
    aliyun: '华北 2 北京',
    tencent: '华北 北京',
    huawei: '华北 北京四',
    aws: 'cn-north-1 北京',
    azure: 'China North 3',
    gcp: 'asia-northeast1',
  },
  华南: {
    aliyun: '华南 1 深圳',
    tencent: '华南 广州',
    huawei: '华南 广州',
    aws: 'ap-southeast-1 新加坡',
    azure: 'Southeast Asia',
    gcp: 'asia-southeast1',
  },
  新加坡: {
    aliyun: 'ap-southeast-1 新加坡',
    tencent: 'ap-singapore',
    huawei: '亚太-新加坡',
    aws: 'ap-southeast-1',
    azure: 'Southeast Asia',
    gcp: 'asia-southeast1',
  },
  东京: {
    aliyun: 'ap-northeast-1 东京',
    tencent: 'ap-tokyo',
    huawei: '亚太-东京',
    aws: 'ap-northeast-1',
    azure: 'Japan East',
    gcp: 'asia-northeast1',
  },
  美国西部: {
    aliyun: 'us-west-1 硅谷',
    tencent: 'na-siliconvalley',
    huawei: '美西-圣地亚哥',
    aws: 'us-west-2',
    azure: 'West US 3',
    gcp: 'us-west1',
  },
};

const 精确地域云商 = {
  aliyun: ['华东', '华北', '华南', '新加坡', '东京', '美国西部'],
  tencent: ['华东', '华北', '华南', '新加坡', '东京', '美国西部'],
  huawei: ['华东', '华北', '华南', '新加坡', '东京', '美国西部'],
  aws: ['华北', '新加坡', '东京', '美国西部'],
  azure: ['华北', '新加坡', '东京', '美国西部'],
  gcp: ['新加坡', '东京', '美国西部'],
};

const 精确规格云商 = {
  compute: ['aliyun', 'tencent', 'huawei'],
  storage: ['aliyun', 'tencent', 'huawei'],
  database: ['aliyun', 'tencent', 'huawei'],
  bandwidth: ['aliyun', 'tencent', 'huawei'],
  cdn: ['aliyun', 'tencent', 'huawei'],
};

const 服务器规格档位 = {
  '1C2G': {
    cpu: 1,
    memory: 2,
    月价: { aliyun: 65.20, tencent: 62.40, huawei: 59.80, aws: 86.50, azure: 89.20, gcp: 78.60 },
    实例: {
      aliyun: { 文本: 'ecs.u1-c1m2.small', 标签: ['入门'] },
      tencent: { 文本: 'S6.SMALL2', 标签: ['低价'] },
      huawei: 's7.small.2',
      aws: 't4g.small',
      azure: 'B1ms',
      gcp: 'e2-small',
    },
  },
  '2C4G': {
    cpu: 2,
    memory: 4,
    月价: { aliyun: 118.42, tencent: 112.80, huawei: 109.60, aws: 155.20, azure: 162.40, gcp: 149.70 },
    实例: {
      aliyun: { 文本: 'ecs.u1-c1m2.large', 标签: ['均衡'] },
      tencent: { 文本: 'S6.MEDIUM4', 标签: ['低价'] },
      huawei: 's7.large.2',
      aws: 't4g.medium',
      azure: 'B2s',
      gcp: 'e2-medium',
    },
  },
  '4C8G': {
    cpu: 4,
    memory: 8,
    月价: { aliyun: 232.00, tencent: 220.00, huawei: 214.00, aws: 302.00, azure: 314.00, gcp: 288.00 },
    实例: {
      aliyun: { 文本: 'ecs.u1-c1m2.xlarge', 标签: ['均衡'] },
      tencent: { 文本: 'S6.LARGE8', 标签: ['低价'] },
      huawei: 's7.xlarge.2',
      aws: 't4g.large',
      azure: 'D4as v5',
      gcp: 'e2-standard-2',
    },
  },
  '4C16G': {
    cpu: 4,
    memory: 16,
    月价: { aliyun: 316.00, tencent: 305.00, huawei: 296.00, aws: 430.00, azure: 448.00, gcp: 418.00 },
    实例: {
      aliyun: { 文本: 'ecs.u1-c1m4.xlarge', 标签: ['内存型'] },
      tencent: { 文本: 'S6.LARGE16', 标签: ['低价'] },
      huawei: 's7.xlarge.4',
      aws: 'm7g.xlarge',
      azure: 'D4s v5',
      gcp: 'e2-standard-4',
    },
  },
  '8C16G': {
    cpu: 8,
    memory: 16,
    月价: { aliyun: 458.00, tencent: 438.00, huawei: 426.00, aws: 608.00, azure: 632.00, gcp: 590.00 },
    实例: {
      aliyun: { 文本: 'ecs.u1-c1m2.2xlarge', 标签: ['计算'] },
      tencent: { 文本: 'S6.2XLARGE16', 标签: ['低价'] },
      huawei: 's7.2xlarge.2',
      aws: 'c7g.2xlarge',
      azure: 'F8s v2',
      gcp: 'c3-standard-8',
    },
  },
  '8C32G': {
    cpu: 8,
    memory: 32,
    月价: { aliyun: 628.00, tencent: 604.00, huawei: 586.00, aws: 860.00, azure: 896.00, gcp: 836.00 },
    实例: {
      aliyun: { 文本: 'ecs.u1-c1m4.2xlarge', 标签: ['内存型'] },
      tencent: { 文本: 'S6.2XLARGE32', 标签: ['低价'] },
      huawei: 's7.2xlarge.4',
      aws: 'm7g.2xlarge',
      azure: 'D8s v5',
      gcp: 'e2-standard-8',
    },
  },
};

const 服务器规格精确云商 = {
  '1C2G': ['aliyun', 'tencent', 'huawei', 'gcp'],
  '2C4G': ['aliyun', 'tencent', 'huawei'],
  '4C8G': ['aliyun', 'tencent', 'huawei', 'azure'],
  '4C16G': ['aliyun', 'tencent', 'huawei', 'aws', 'azure', 'gcp'],
  '8C16G': ['aliyun', 'tencent', 'huawei', 'aws', 'azure', 'gcp'],
  '8C32G': ['aliyun', 'tencent', 'huawei', 'aws', 'azure', 'gcp'],
};

const 模块数据 = [
  {
    id: 'compute',
    分类: '服务器',
    标题: '云服务器 ECS / CVM',
    指标: {
      aliyun: { 月价: 118.42, cpu: 2, memory: 4, sla: 99.975 },
      tencent: { 月价: 112.80, cpu: 2, memory: 4, sla: 99.95 },
      huawei: { 月价: 109.60, cpu: 2, memory: 4, sla: 99.95 },
      aws: { 月价: 155.20, cpu: 2, memory: 4, sla: 99.99 },
      azure: { 月价: 162.40, cpu: 2, memory: 4, sla: 99.99 },
      gcp: { 月价: 149.70, cpu: 2, memory: 4, sla: 99.95 },
    },
    行: [
      {
        维度: 'CPU / 内存',
        对齐: 'text',
        值: {
          aliyun: '2 vCPU / 4 GiB',
          tencent: '2 vCPU / 4 GiB',
          huawei: '2 vCPU / 4 GiB',
          aws: '2 vCPU / 4 GiB',
          azure: '2 vCPU / 4 GiB',
          gcp: '2 vCPU / 4 GiB',
        },
      },
      {
        维度: '实例规格',
        对齐: 'text',
        值: {
          aliyun: { 文本: 'ecs.u1-c1m2.large', 标签: ['均衡'] },
          tencent: { 文本: 'S6.MEDIUM4', 标签: ['低价'] },
          huawei: 's7.large.2',
          aws: 't4g.medium',
          azure: 'B2s',
          gcp: 'e2-medium',
        },
      },
      {
        维度: '规格补充',
        对齐: 'text',
        值: {
          aliyun: { 文本: 'ESSD 40GB / 1Gbps', 标签: ['x86'] },
          tencent: { 文本: 'CBS 50GB / 1Gbps', 标签: ['x86'] },
          huawei: { 文本: 'SSD 40GB / 1Gbps', 标签: ['x86'] },
          aws: { 文本: 'EBS gp3 / ARM', 标签: ['突发'] },
          azure: { 文本: 'Premium SSD / 低突发', 标签: ['x86'] },
          gcp: { 文本: 'Balanced PD / 2Gbps', 标签: ['共享核'] },
        },
      },
      {
        维度: '地域',
        对齐: 'text',
        动态: 'region',
      },
      {
        维度: '计费方式',
        对齐: 'text',
        动态: 'billing',
      },
      {
        维度: '按量单价',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.238', 单位: '元/小时' },
          tencent: { 文本: '0.224', 单位: '元/小时', 标签: ['低价'] },
          huawei: { 文本: '0.219', 单位: '元/小时' },
          aws: { 文本: '0.309', 单位: '元/小时' },
          azure: { 文本: '0.324', 单位: '元/小时' },
          gcp: { 文本: '0.299', 单位: '元/小时' },
        },
      },
      {
        维度: '包年包月',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '118.42', 单位: '元/月' },
          tencent: { 文本: '112.80', 单位: '元/月' },
          huawei: { 文本: '109.60', 单位: '元/月' },
          aws: { 文本: '155.20', 单位: '元/月' },
          azure: { 文本: '162.40', 单位: '元/月' },
          gcp: { 文本: '149.70', 单位: '元/月' },
        },
      },
      {
        维度: '流量价格',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.80', 单位: '元/GB' },
          tencent: { 文本: '0.80', 单位: '元/GB' },
          huawei: { 文本: '0.80', 单位: '元/GB' },
          aws: { 文本: '0.62', 单位: '元/GB', 标签: ['阶梯'] },
          azure: { 文本: '0.61', 单位: '元/GB' },
          gcp: { 文本: '0.60', 单位: '元/GB' },
        },
      },
      {
        维度: '存储价格',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.35', 单位: '元/GB/月' },
          tencent: { 文本: '0.33', 单位: '元/GB/月' },
          huawei: { 文本: '0.32', 单位: '元/GB/月' },
          aws: { 文本: '0.55', 单位: '元/GB/月' },
          azure: { 文本: '0.52', 单位: '元/GB/月' },
          gcp: { 文本: '0.50', 单位: '元/GB/月' },
        },
      },
      {
        维度: '免费额度',
        对齐: 'text',
        值: {
          aliyun: '新用户试用',
          tencent: '轻量试用',
          huawei: '试用专区',
          aws: { 文本: '750 小时', 标签: ['免费额度'] },
          azure: '12 个月试用',
          gcp: '300 USD 赠金',
        },
      },
      {
        维度: 'SLA',
        对齐: 'number',
        值: {
          aliyun: { 文本: '99.975', 单位: '%' },
          tencent: { 文本: '99.95', 单位: '%' },
          huawei: { 文本: '99.95', 单位: '%' },
          aws: { 文本: '99.99', 单位: '%' },
          azure: { 文本: '99.99', 单位: '%' },
          gcp: { 文本: '99.95', 单位: '%' },
        },
      },
      {
        维度: '适用场景',
        对齐: 'text',
        值: {
          aliyun: '中小 Web 服务',
          tencent: '通用业务',
          huawei: '政企通用',
          aws: '全球业务',
          azure: '企业应用',
          gcp: '弹性计算',
        },
      },
      {
        维度: '最低价标记',
        对齐: 'text',
        最低价字段: '月价',
        值: {
          aliyun: '候选',
          tencent: '接近最低',
          huawei: { 文本: '当前最低', 标签: ['低价'] },
          aws: '全球区溢价',
          azure: '全球区溢价',
          gcp: '全球区溢价',
        },
      },
    ],
  },
  {
    id: 'storage',
    分类: '存储',
    标题: '对象存储 OSS / COS / S3',
    指标: {
      aliyun: { 月价: 120.00, cpu: 0, memory: 0, sla: 99.995 },
      tencent: { 月价: 118.00, cpu: 0, memory: 0, sla: 99.995 },
      huawei: { 月价: 116.00, cpu: 0, memory: 0, sla: 99.995 },
      aws: { 月价: 167.20, cpu: 0, memory: 0, sla: 99.99 },
      azure: { 月价: 151.00, cpu: 0, memory: 0, sla: 99.99 },
      gcp: { 月价: 144.50, cpu: 0, memory: 0, sla: 99.95 },
    },
    行: [
      { 维度: 'CPU / 内存', 对齐: 'text', 值: 填充所有('不适用') },
      {
        维度: '实例规格',
        对齐: 'text',
        值: {
          aliyun: 'OSS 标准',
          tencent: 'COS 标准',
          huawei: 'OBS 标准',
          aws: 'S3 Standard',
          azure: 'Blob Hot',
          gcp: 'Cloud Storage Standard',
        },
      },
      { 维度: '地域', 对齐: 'text', 动态: 'region' },
      { 维度: '计费方式', 对齐: 'text', 动态: 'billing' },
      {
        维度: '按量单价',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.120', 单位: '元/GB/月' },
          tencent: { 文本: '0.118', 单位: '元/GB/月' },
          huawei: { 文本: '0.116', 单位: '元/GB/月' },
          aws: { 文本: '0.167', 单位: '元/GB/月' },
          azure: { 文本: '0.151', 单位: '元/GB/月' },
          gcp: { 文本: '0.145', 单位: '元/GB/月' },
        },
      },
      {
        维度: '包年包月',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '120.00', 单位: '元/TB/月' },
          tencent: { 文本: '118.00', 单位: '元/TB/月' },
          huawei: { 文本: '116.00', 单位: '元/TB/月' },
          aws: { 文本: '167.20', 单位: '元/TB/月' },
          azure: { 文本: '151.00', 单位: '元/TB/月' },
          gcp: { 文本: '144.50', 单位: '元/TB/月' },
        },
      },
      {
        维度: '流量价格',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.50', 单位: '元/GB' },
          tencent: { 文本: '0.50', 单位: '元/GB' },
          huawei: { 文本: '0.49', 单位: '元/GB' },
          aws: { 文本: '0.62', 单位: '元/GB' },
          azure: { 文本: '0.58', 单位: '元/GB' },
          gcp: { 文本: '0.56', 单位: '元/GB' },
        },
      },
      {
        维度: '存储价格',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '0.120', 单位: '元/GB/月' },
          tencent: { 文本: '0.118', 单位: '元/GB/月' },
          huawei: { 文本: '0.116', 单位: '元/GB/月' },
          aws: { 文本: '0.167', 单位: '元/GB/月' },
          azure: { 文本: '0.151', 单位: '元/GB/月' },
          gcp: { 文本: '0.145', 单位: '元/GB/月' },
        },
      },
      {
        维度: '免费额度',
        对齐: 'text',
        值: {
          aliyun: '5GB 试用',
          tencent: '50GB 试用',
          huawei: '40GB 试用',
          aws: '5GB 12个月',
          azure: '5GB 12个月',
          gcp: '5GB Always Free',
        },
      },
      {
        维度: 'SLA',
        对齐: 'number',
        值: {
          aliyun: { 文本: '99.995', 单位: '%' },
          tencent: { 文本: '99.995', 单位: '%' },
          huawei: { 文本: '99.995', 单位: '%' },
          aws: { 文本: '99.99', 单位: '%' },
          azure: { 文本: '99.99', 单位: '%' },
          gcp: { 文本: '99.95', 单位: '%' },
        },
      },
      {
        维度: '适用场景',
        对齐: 'text',
        值: {
          aliyun: '图片与备份',
          tencent: '静态资源',
          huawei: '归档前热数据',
          aws: '全球分发源站',
          azure: '企业文件',
          gcp: '数据湖',
        },
      },
      {
        维度: '最低价标记',
        对齐: 'text',
        最低价字段: '月价',
        值: {
          aliyun: '候选',
          tencent: '接近最低',
          huawei: { 文本: '当前最低', 标签: ['低价'] },
          aws: '高可用',
          azure: '企业集成',
          gcp: '多区域友好',
        },
      },
    ],
  },
  {
    id: 'database',
    分类: '数据库',
    标题: '云数据库 RDS',
    指标: {
      aliyun: { 月价: 298.00, cpu: 2, memory: 4, sla: 99.95 },
      tencent: { 月价: 286.00, cpu: 2, memory: 4, sla: 99.95 },
      huawei: { 月价: 279.00, cpu: 2, memory: 4, sla: 99.95 },
      aws: { 月价: 430.00, cpu: 2, memory: 4, sla: 99.95 },
      azure: { 月价: 448.00, cpu: 2, memory: 4, sla: 99.99 },
      gcp: { 月价: 418.00, cpu: 2, memory: 4, sla: 99.95 },
    },
    行: [
      { 维度: 'CPU / 内存', 对齐: 'text', 值: 填充所有('2 vCPU / 4 GiB') },
      {
        维度: '实例规格',
        对齐: 'text',
        值: {
          aliyun: 'mysql.n2.medium.1',
          tencent: 'MYSQL.S2.MEDIUM4',
          huawei: 'rds.mysql.c6.large.2',
          aws: 'db.t4g.medium',
          azure: 'B2ms Flexible',
          gcp: 'db-custom-2-4096',
        },
      },
      {
        维度: '规格补充',
        对齐: 'text',
        值: {
          aliyun: { 文本: 'MySQL 8.0 / 高可用 / ESSD 100GB', 标签: ['主备'] },
          tencent: { 文本: 'MySQL 8.0 / 双节点 / SSD 100GB', 标签: ['主备'] },
          huawei: { 文本: 'MySQL 8.0 / 主备 / SSD 100GB', 标签: ['主备'] },
          aws: { 文本: 'RDS MySQL / Multi-AZ 可选', 标签: ['全球'] },
          azure: { 文本: 'Flexible Server / Zone Redundant', 标签: ['高 SLA'] },
          gcp: { 文本: 'Cloud SQL / HA 可选 / SSD 100GB', 标签: ['自动备份'] },
        },
      },
      { 维度: '地域', 对齐: 'text', 动态: 'region' },
      { 维度: '计费方式', 对齐: 'text', 动态: 'billing' },
      {
        维度: '按量单价',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.596', 单位: '元/小时' },
          tencent: { 文本: '0.572', 单位: '元/小时' },
          huawei: { 文本: '0.558', 单位: '元/小时' },
          aws: { 文本: '0.860', 单位: '元/小时' },
          azure: { 文本: '0.896', 单位: '元/小时' },
          gcp: { 文本: '0.836', 单位: '元/小时' },
        },
      },
      {
        维度: '包年包月',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '298.00', 单位: '元/月' },
          tencent: { 文本: '286.00', 单位: '元/月' },
          huawei: { 文本: '279.00', 单位: '元/月' },
          aws: { 文本: '430.00', 单位: '元/月' },
          azure: { 文本: '448.00', 单位: '元/月' },
          gcp: { 文本: '418.00', 单位: '元/月' },
        },
      },
      {
        维度: '流量价格',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.80', 单位: '元/GB' },
          tencent: { 文本: '0.80', 单位: '元/GB' },
          huawei: { 文本: '0.80', 单位: '元/GB' },
          aws: { 文本: '0.62', 单位: '元/GB' },
          azure: { 文本: '0.61', 单位: '元/GB' },
          gcp: { 文本: '0.60', 单位: '元/GB' },
        },
      },
      {
        维度: '存储价格',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.70', 单位: '元/GB/月' },
          tencent: { 文本: '0.66', 单位: '元/GB/月' },
          huawei: { 文本: '0.64', 单位: '元/GB/月' },
          aws: { 文本: '0.92', 单位: '元/GB/月' },
          azure: { 文本: '0.88', 单位: '元/GB/月' },
          gcp: { 文本: '0.86', 单位: '元/GB/月' },
        },
      },
      {
        维度: '免费额度',
        对齐: 'text',
        值: {
          aliyun: '新用户试用',
          tencent: '体验套餐',
          huawei: '试用专区',
          aws: '750 小时',
          azure: '灵活服务器试用',
          gcp: 'Cloud SQL 赠金',
        },
      },
      {
        维度: 'SLA',
        对齐: 'number',
        值: {
          aliyun: { 文本: '99.95', 单位: '%' },
          tencent: { 文本: '99.95', 单位: '%' },
          huawei: { 文本: '99.95', 单位: '%' },
          aws: { 文本: '99.95', 单位: '%' },
          azure: { 文本: '99.99', 单位: '%' },
          gcp: { 文本: '99.95', 单位: '%' },
        },
      },
      {
        维度: '适用场景',
        对齐: 'text',
        值: {
          aliyun: '中小交易库',
          tencent: '业务主库',
          huawei: '政企数据',
          aws: '跨区业务',
          azure: '微软生态',
          gcp: '分析联动',
        },
      },
      {
        维度: '最低价标记',
        对齐: 'text',
        最低价字段: '月价',
        值: {
          aliyun: '候选',
          tencent: '接近最低',
          huawei: { 文本: '当前最低', 标签: ['低价'] },
          aws: '全球区',
          azure: { 文本: '高 SLA', 标签: ['SLA'] },
          gcp: '分析友好',
        },
      },
    ],
  },
  {
    id: 'bandwidth',
    分类: '网络',
    标题: '带宽与流量',
    指标: {
      aliyun: { 月价: 80.00, cpu: 0, memory: 0, sla: 99.95 },
      tencent: { 月价: 78.00, cpu: 0, memory: 0, sla: 99.95 },
      huawei: { 月价: 76.00, cpu: 0, memory: 0, sla: 99.95 },
      aws: { 月价: 62.00, cpu: 0, memory: 0, sla: 99.99 },
      azure: { 月价: 61.00, cpu: 0, memory: 0, sla: 99.99 },
      gcp: { 月价: 60.00, cpu: 0, memory: 0, sla: 99.95 },
    },
    行: [
      { 维度: 'CPU / 内存', 对齐: 'text', 值: 填充所有('不适用') },
      {
        维度: '实例规格',
        对齐: 'text',
        值: {
          aliyun: 'BGP 多线',
          tencent: 'BGP 高防外',
          huawei: '全动态 BGP',
          aws: 'Data Transfer Out',
          azure: 'Bandwidth Zone 1',
          gcp: 'Premium Tier',
        },
      },
      { 维度: '地域', 对齐: 'text', 动态: 'region' },
      { 维度: '计费方式', 对齐: 'text', 动态: 'billing' },
      {
        维度: '按量单价',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.80', 单位: '元/GB' },
          tencent: { 文本: '0.78', 单位: '元/GB' },
          huawei: { 文本: '0.76', 单位: '元/GB' },
          aws: { 文本: '0.62', 单位: '元/GB' },
          azure: { 文本: '0.61', 单位: '元/GB' },
          gcp: { 文本: '0.60', 单位: '元/GB' },
        },
      },
      {
        维度: '包年包月',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '80.00', 单位: '元/100GB' },
          tencent: { 文本: '78.00', 单位: '元/100GB' },
          huawei: { 文本: '76.00', 单位: '元/100GB' },
          aws: { 文本: '62.00', 单位: '元/100GB' },
          azure: { 文本: '61.00', 单位: '元/100GB' },
          gcp: { 文本: '60.00', 单位: '元/100GB' },
        },
      },
      {
        维度: '流量价格',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '0.80', 单位: '元/GB' },
          tencent: { 文本: '0.78', 单位: '元/GB' },
          huawei: { 文本: '0.76', 单位: '元/GB' },
          aws: { 文本: '0.62', 单位: '元/GB' },
          azure: { 文本: '0.61', 单位: '元/GB' },
          gcp: { 文本: '0.60', 单位: '元/GB' },
        },
      },
      {
        维度: '存储价格',
        对齐: 'number',
        值: 填充所有({ 文本: '0.00', 单位: '元/GB/月' }),
      },
      {
        维度: '免费额度',
        对齐: 'text',
        值: {
          aliyun: '无固定额度',
          tencent: '无固定额度',
          huawei: '无固定额度',
          aws: { 文本: '100GB/月', 标签: ['免流量'] },
          azure: '100GB/月',
          gcp: '部分区域免费',
        },
      },
      {
        维度: 'SLA',
        对齐: 'number',
        值: {
          aliyun: { 文本: '99.95', 单位: '%' },
          tencent: { 文本: '99.95', 单位: '%' },
          huawei: { 文本: '99.95', 单位: '%' },
          aws: { 文本: '99.99', 单位: '%' },
          azure: { 文本: '99.99', 单位: '%' },
          gcp: { 文本: '99.95', 单位: '%' },
        },
      },
      {
        维度: '适用场景',
        对齐: 'text',
        值: {
          aliyun: '国内公网',
          tencent: '游戏业务',
          huawei: '政企公网',
          aws: '全球出口',
          azure: '企业网络',
          gcp: '跨境应用',
        },
      },
      {
        维度: '最低价标记',
        对齐: 'text',
        最低价字段: '月价',
        值: {
          aliyun: '国内稳定',
          tencent: '国内稳定',
          huawei: '国内低价',
          aws: '全球折中',
          azure: '接近最低',
          gcp: { 文本: '当前最低', 标签: ['低价'] },
        },
      },
    ],
  },
  {
    id: 'cdn',
    分类: '网络',
    标题: 'CDN',
    指标: {
      aliyun: { 月价: 24.00, cpu: 0, memory: 0, sla: 99.90 },
      tencent: { 月价: 23.00, cpu: 0, memory: 0, sla: 99.90 },
      huawei: { 月价: 22.00, cpu: 0, memory: 0, sla: 99.90 },
      aws: { 月价: 58.00, cpu: 0, memory: 0, sla: 99.90 },
      azure: { 月价: 54.00, cpu: 0, memory: 0, sla: 99.90 },
      gcp: { 月价: 50.00, cpu: 0, memory: 0, sla: 99.90 },
    },
    行: [
      { 维度: 'CPU / 内存', 对齐: 'text', 值: 填充所有('不适用') },
      {
        维度: '实例规格',
        对齐: 'text',
        值: {
          aliyun: 'CDN 静态 HTTPS',
          tencent: 'ECDN / CDN',
          huawei: 'CDN 基础加速',
          aws: 'CloudFront',
          azure: 'Azure CDN',
          gcp: 'Cloud CDN',
        },
      },
      {
        维度: '规格补充',
        对齐: 'text',
        值: {
          aliyun: { 文本: '国内节点 / HTTPS / 回源压缩', 标签: ['免证书'] },
          tencent: { 文本: '全球节点 / QUIC / 图片优化', 标签: ['边缘'] },
          huawei: { 文本: '国内节点 / HTTPS / 防盗链', 标签: ['低价'] },
          aws: { 文本: 'CloudFront / WAF / Lambda@Edge', 标签: ['全球'] },
          azure: { 文本: 'Front Door / 规则引擎 / WAF', 标签: ['企业'] },
          gcp: { 文本: 'Cloud CDN / Anycast / LB 集成', 标签: ['边缘'] },
        },
      },
      { 维度: '地域', 对齐: 'text', 动态: 'region' },
      { 维度: '计费方式', 对齐: 'text', 动态: 'billing' },
      {
        维度: '按量单价',
        对齐: 'number',
        值: {
          aliyun: { 文本: '0.24', 单位: '元/GB' },
          tencent: { 文本: '0.23', 单位: '元/GB' },
          huawei: { 文本: '0.22', 单位: '元/GB' },
          aws: { 文本: '0.58', 单位: '元/GB' },
          azure: { 文本: '0.54', 单位: '元/GB' },
          gcp: { 文本: '0.50', 单位: '元/GB' },
        },
      },
      {
        维度: '包年包月',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '24.00', 单位: '元/100GB' },
          tencent: { 文本: '23.00', 单位: '元/100GB' },
          huawei: { 文本: '22.00', 单位: '元/100GB' },
          aws: { 文本: '58.00', 单位: '元/100GB' },
          azure: { 文本: '54.00', 单位: '元/100GB' },
          gcp: { 文本: '50.00', 单位: '元/100GB' },
        },
      },
      {
        维度: '流量价格',
        对齐: 'number',
        最低价字段: '月价',
        值: {
          aliyun: { 文本: '0.24', 单位: '元/GB' },
          tencent: { 文本: '0.23', 单位: '元/GB' },
          huawei: { 文本: '0.22', 单位: '元/GB' },
          aws: { 文本: '0.58', 单位: '元/GB' },
          azure: { 文本: '0.54', 单位: '元/GB' },
          gcp: { 文本: '0.50', 单位: '元/GB' },
        },
      },
      {
        维度: '存储价格',
        对齐: 'number',
        值: 填充所有({ 文本: '0.00', 单位: '元/GB/月' }),
      },
      {
        维度: '免费额度',
        对齐: 'text',
        值: {
          aliyun: '新用户资源包',
          tencent: '免费试用包',
          huawei: '试用流量包',
          aws: '1TB/月 12个月',
          azure: '促销额度',
          gcp: '赠金抵扣',
        },
      },
      {
        维度: 'SLA',
        对齐: 'number',
        值: {
          aliyun: { 文本: '99.90', 单位: '%' },
          tencent: { 文本: '99.90', 单位: '%' },
          huawei: { 文本: '99.90', 单位: '%' },
          aws: { 文本: '99.90', 单位: '%' },
          azure: { 文本: '99.90', 单位: '%' },
          gcp: { 文本: '99.90', 单位: '%' },
        },
      },
      {
        维度: '适用场景',
        对齐: 'text',
        值: {
          aliyun: '国内站点',
          tencent: '音视频加速',
          huawei: '政企门户',
          aws: '全球分发',
          azure: '企业应用',
          gcp: '边缘缓存',
        },
      },
      {
        维度: '最低价标记',
        对齐: 'text',
        最低价字段: '月价',
        值: {
          aliyun: '低价候选',
          tencent: '接近最低',
          huawei: { 文本: '当前最低', 标签: ['低价'] },
          aws: '全球覆盖',
          azure: '企业集成',
          gcp: '边缘节点',
        },
      },
    ],
  },
];

function 填充所有(值) {
  return 云商列表.reduce((结果, 云商) => {
    结果[云商.id] = 值;
    return 结果;
  }, {});
}

function 转换币种(金额, 币种) {
  const 数值 = 币种 === 'USD' ? 金额 / 7.18 : 金额;
  return 数值.toFixed(2);
}

function 获取最低云商(模块, 字段 = '月价') {
  return 云商列表.reduce(
    (当前, 云商) => {
      const 值 = 模块.指标[云商.id]?.[字段] ?? Number.POSITIVE_INFINITY;
      return 值 < 当前.值 ? { id: 云商.id, 值 } : 当前;
    },
    { id: '', 值: Number.POSITIVE_INFINITY },
  ).id;
}

function 获取排序值(模块, 云商, 排序) {
  const 指标 = 模块.指标[云商.id];
  if (排序 === '按 CPU 性价比排序') {
    return 指标.cpu > 0 ? 指标.月价 / 指标.cpu : 指标.月价;
  }
  if (排序 === '按内存性价比排序') {
    return 指标.memory > 0 ? 指标.月价 / 指标.memory : 指标.月价;
  }
  if (排序 === '按 SLA 排序') {
    return -指标.sla;
  }
  return 指标.月价;
}

function 构建云服务器模块(模块, 服务器规格) {
  if (模块.id !== 'compute') {
    return 模块;
  }

  const 档位 = 服务器规格档位[服务器规格] || 服务器规格档位['2C4G'];
  const 指标 = 云商列表.reduce((结果, 云商) => {
    const 月价 = 档位.月价[云商.id];
    结果[云商.id] = {
      ...模块.指标[云商.id],
      月价,
      cpu: 档位.cpu,
      memory: 档位.memory,
    };
    return 结果;
  }, {});
  const 更新行 = 模块.行.map((行) => {
    if (行.维度 === 'CPU / 内存') {
      return {
        ...行,
        值: 填充所有(`${档位.cpu} vCPU / ${档位.memory} GiB`),
      };
    }
    if (行.维度 === '实例规格') {
      return { ...行, 值: 档位.实例 };
    }
    if (行.维度 === '规格补充') {
      const 系统盘 = 档位.cpu >= 8 ? 100 : 档位.cpu >= 4 ? 80 : 40;
      const 带宽 = 档位.cpu >= 8 ? 5 : 档位.cpu >= 4 ? 2 : 1;
      return {
        ...行,
        值: {
          aliyun: { 文本: `ESSD ${系统盘}GB / ${带宽}Gbps`, 标签: ['x86'] },
          tencent: { 文本: `CBS ${系统盘}GB / ${带宽}Gbps`, 标签: ['x86'] },
          huawei: { 文本: `SSD ${系统盘}GB / ${带宽}Gbps`, 标签: ['x86'] },
          aws: { 文本: `EBS gp3 / ${带宽}Gbps`, 标签: ['突发'] },
          azure: { 文本: `Premium SSD / ${带宽}Gbps`, 标签: ['x86'] },
          gcp: { 文本: `Balanced PD / ${带宽}Gbps`, 标签: ['共享核'] },
        },
      };
    }
    if (行.维度 === '按量单价') {
      return {
        ...行,
        值: 云商列表.reduce((结果, 云商) => {
          结果[云商.id] = {
            文本: (档位.月价[云商.id] / 500).toFixed(3),
            单位: '元/小时',
            标签: 云商.id === 'tencent' ? ['低价'] : undefined,
          };
          return 结果;
        }, {}),
      };
    }
    if (行.维度 === '包年包月') {
      return {
        ...行,
        值: 云商列表.reduce((结果, 云商) => {
          结果[云商.id] = {
            文本: 档位.月价[云商.id].toFixed(2),
            单位: '元/月',
          };
          return 结果;
        }, {}),
      };
    }
    return 行;
  });

  return { ...模块, 指标, 行: 更新行 };
}

function 合并单元格提示(值, 标签, 警告 = false) {
  const 基础 = typeof 值 === 'string' ? { 文本: 值 } : { ...值 };
  const 原标签 = 基础.标签 || [];
  return {
    ...基础,
    标签: [...new Set([...原标签, ...标签])],
    警告: 基础.警告 || 警告,
  };
}

function 是精确规格匹配(模块, 云商, 状态) {
  if (模块.id === 'compute') {
    return 服务器规格精确云商[状态.服务器规格]?.includes(云商.id) ?? true;
  }
  return 精确规格云商[模块.id]?.includes(云商.id) ?? true;
}

function 获取单元格值(模块, 行, 云商, 状态) {
  if (行.动态 === 'region') {
    const 地域 = 地域映射[状态.地域][云商.id];
    const 是精确地域 = 精确地域云商[云商.id]?.includes(状态.地域);
    return 是精确地域
      ? 地域
      : 合并单元格提示(地域, ['就近地域', '非筛选地域'], true);
  }
  if (行.动态 === 'billing') {
    return 状态.计费方式;
  }
  const 值 = 行.值[云商.id];
  const 是规格行 = 行.维度 === '实例规格' || 行.维度 === '规格补充';
  const 是精确规格 = 是精确规格匹配(模块, 云商, 状态);
  return 是规格行 && !是精确规格
    ? 合并单元格提示(值, ['就近规格', '非筛选规格'], true)
    : 值;
}

function 标准化单元格(值, 状态) {
  if (typeof 值 === 'string') {
    return { 文本: 值, 单位: '', 标签: [], 警告: false };
  }
  const 文本 =
    状态.币种 === 'USD' && 值?.单位?.includes('元')
      ? 转换币种(Number.parseFloat(值.文本), 状态.币种)
      : 值.文本;
  const 单位 =
    状态.币种 === 'USD' && 值?.单位?.includes('元')
      ? 值.单位.replace('元', 'USD')
      : 值?.单位 || '';
  return { 文本, 单位, 标签: 值?.标签 || [], 警告: Boolean(值?.警告) };
}

function 添加单元格标签(单元格, 标签) {
  return {
    ...单元格,
    标签: 单元格.标签.includes(标签)
      ? 单元格.标签
      : [...单元格.标签, 标签],
  };
}

function App() {
  const [状态, 设置状态] = useState({
    地域: '华东',
    计费方式: '包月',
    资源类型: '全部',
    服务器规格: '2C4G',
    币种: 'CNY',
    排序: '按最低月价排序',
    紧凑: false,
    暗色: false,
    只看最低: false,
  });
  const [锁定列, 设置锁定列] = useState({});
  const [悬停列, 设置悬停列] = useState('');

  const 可见模块 = useMemo(() => {
    if (状态.资源类型 === '全部') {
      return 模块数据;
    }
    return 模块数据.filter((模块) => 模块.分类 === 状态.资源类型);
  }, [状态.资源类型]);

  const 页面类名 = [
    'app-shell',
    状态.紧凑 ? 'is-compact' : '',
    状态.暗色 ? 'is-dark' : '',
    状态.只看最低 ? 'only-lowest' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={页面类名}>
      <header className="site-header">
        <div className="header-toolbar">
          <div className="mode-cell" aria-label="页面模式">
            <Toggle
              文本="紧凑模式"
              激活={状态.紧凑}
              onClick={() => 设置状态((旧) => ({ ...旧, 紧凑: !旧.紧凑 }))}
            />
            <Toggle
              文本="暗色模式"
              激活={状态.暗色}
              onClick={() => 设置状态((旧) => ({ ...旧, 暗色: !旧.暗色 }))}
            />
            <Toggle
              文本="只看最低价"
              激活={状态.只看最低}
              onClick={() =>
                设置状态((旧) => ({ ...旧, 只看最低: !旧.只看最低 }))
              }
            />
          </div>
          <nav className="top-nav" aria-label="页面导航">
            <a
              href="https://github.com/AzDj/CloudServerPrice"
              target="_blank"
              rel="noreferrer"
              aria-label="打开 GitHub 仓库"
            >
              <img className="github-icon" src={GITHUB_ICON_URL} alt="" />
            </a>
          </nav>
        </div>
        <Controls 状态={状态} 设置状态={设置状态} />
      </header>

      <section
        id="price-table"
        className="table-stack"
        aria-label="云服务价格对比表"
      >
        <div className="index-status">更新于 {更新日期}</div>
        {可见模块.map((模块, 索引) => (
          <PriceModule
            key={模块.id}
            模块={模块}
            状态={状态}
            索引={索引}
            锁定云商={锁定列[模块.id] || ''}
            设置锁定云商={(云商) =>
              设置锁定列((旧) => ({
                ...旧,
                [模块.id]: 旧[模块.id] === 云商 ? '' : 云商,
              }))
            }
            悬停列={悬停列}
            设置悬停列={设置悬停列}
          />
        ))}
        <footer className="disclaimer">
          比价数据取自各厂商公开价目文档，实际成交价受采购规模、专属协议、定向优惠影响，仅供选型参考，非最终结算价。
        </footer>
      </section>
    </main>
  );
}

function Toggle({ 文本, 激活, onClick }) {
  return (
    <button
      className={`toggle ${激活 ? 'is-active' : ''}`}
      type="button"
      aria-pressed={激活}
      onClick={onClick}
    >
      <span className="switch-dot" />
      {文本}
    </button>
  );
}

function Controls({ 状态, 设置状态 }) {
  return (
    <div className="controls" aria-label="筛选与排序">
      <SelectControl
        标签="地域"
        值={状态.地域}
        选项={地域选项}
        onChange={(值) => 设置状态((旧) => ({ ...旧, 地域: 值 }))}
      />
      <SelectControl
        标签="计费方式"
        值={状态.计费方式}
        选项={计费选项}
        onChange={(值) => 设置状态((旧) => ({ ...旧, 计费方式: 值 }))}
      />
      <SelectControl
        标签="资源类型"
        值={状态.资源类型}
        选项={资源类型选项}
        onChange={(值) => 设置状态((旧) => ({ ...旧, 资源类型: 值 }))}
      />
      <SelectControl
        标签="服务器规格"
        值={状态.服务器规格}
        选项={服务器规格选项}
        onChange={(值) => 设置状态((旧) => ({ ...旧, 服务器规格: 值 }))}
      />
      <SelectControl
        标签="币种"
        值={状态.币种}
        选项={币种选项}
        onChange={(值) => 设置状态((旧) => ({ ...旧, 币种: 值 }))}
      />
      <SelectControl
        标签="排序"
        值={状态.排序}
        选项={排序选项}
        onChange={(值) => 设置状态((旧) => ({ ...旧, 排序: 值 }))}
      />
    </div>
  );
}

function SelectControl({ 标签, 值, 选项, onChange }) {
  return (
    <label className="select-control">
      <span>{标签}</span>
      <select value={值} onChange={(事件) => onChange(事件.target.value)}>
        {选项.map((选项值) => (
          <option key={选项值} value={选项值}>
            {选项值}
          </option>
        ))}
      </select>
    </label>
  );
}

function PriceModule({
  模块,
  状态,
  索引,
  锁定云商,
  设置锁定云商,
  悬停列,
  设置悬停列,
}) {
  const 展示模块数据 = 构建云服务器模块(模块, 状态.服务器规格);
  const 最低云商 = 获取最低云商(展示模块数据);
  const 滚动容器 = useRef(null);
  const 拖拽状态 = useRef({ 激活: false, 起点: 0, 初始滚动: 0 });
  const 排序云商 = [...云商列表].sort(
    (甲, 乙) =>
      获取排序值(展示模块数据, 甲, 状态.排序) -
      获取排序值(展示模块数据, 乙, 状态.排序),
  );
  const 展示云商 = 锁定云商
    ? [
        排序云商.find((云商) => 云商.id === 锁定云商),
        ...排序云商.filter((云商) => 云商.id !== 锁定云商),
      ].filter(Boolean)
    : 排序云商;

  return (
    <section
      className="price-module"
      style={{ '--enter-order': 索引 }}
      aria-labelledby={`${展示模块数据.id}-title`}
    >
      <div className="module-head">
        <h2 id={`${展示模块数据.id}-title`}>{展示模块数据.标题}</h2>
      </div>
      <div
        className="table-scroll"
        ref={滚动容器}
        onWheel={(事件) => {
          const 容器 = 滚动容器.current;
          if (!容器 || !事件.shiftKey) {
            return;
          }
          容器.scrollLeft += 事件.deltaY;
        }}
        onPointerDown={(事件) => {
          if (事件.button !== 0 || 事件.target.closest('button, select, a')) {
            return;
          }
          const 容器 = 滚动容器.current;
          if (!容器 || 容器.scrollWidth <= 容器.clientWidth) {
            return;
          }
          拖拽状态.current = {
            激活: true,
            起点: 事件.clientX,
            初始滚动: 容器.scrollLeft,
          };
          容器.classList.add('is-dragging');
          容器.setPointerCapture(事件.pointerId);
        }}
        onPointerMove={(事件) => {
          const 容器 = 滚动容器.current;
          if (!容器 || !拖拽状态.current.激活) {
            return;
          }
          容器.scrollLeft =
            拖拽状态.current.初始滚动 -
            (事件.clientX - 拖拽状态.current.起点);
        }}
        onPointerUp={(事件) => {
          const 容器 = 滚动容器.current;
          拖拽状态.current.激活 = false;
          容器?.classList.remove('is-dragging');
          容器?.releasePointerCapture?.(事件.pointerId);
        }}
        onPointerCancel={() => {
          拖拽状态.current.激活 = false;
          滚动容器.current?.classList.remove('is-dragging');
        }}
      >
        <table className="price-table">
          <colgroup>
            <col className="dimension-col" />
            {展示云商.map((云商) => (
              <col className="vendor-col" key={云商.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="dimension-head">配置维度</th>
              {展示云商.map((云商) => (
                <th
                  key={云商.id}
                  className={[
                    锁定云商 === 云商.id ? 'is-locked' : '',
                    悬停列 === `${展示模块数据.id}-${云商.id}` ? 'is-col-hover' : '',
                    状态.只看最低 && 最低云商 !== 云商.id ? 'is-muted' : '',
                    最低云商 === 云商.id ? 'is-lowest-provider' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => 设置悬停列(`${展示模块数据.id}-${云商.id}`)}
                  onMouseLeave={() => 设置悬停列('')}
                >
                  <div className="vendor-head">
                    <a
                      className="vendor-link"
                      href={云商.官网}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`打开${云商.名称}官网`}
                    >
                      <span className={`vendor-mark vendor-${云商.id}`}>
                        <img
                          className="vendor-icon"
                          src={云商.图标}
                          alt=""
                          loading="lazy"
                        />
                      </span>
                      <span className="vendor-name">{云商.名称}</span>
                    </a>
                    <button
                      className="lock-mark"
                      type="button"
                      onClick={() => 设置锁定云商(云商.id)}
                      aria-pressed={锁定云商 === 云商.id}
                    >
                      {锁定云商 === 云商.id ? '已锁定' : '锁定'}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {展示模块数据.行.map((行) => (
              <tr key={行.维度}>
                <th className="dimension-cell">{行.维度}</th>
                {展示云商.map((云商) => {
                  const 原始值 = 获取单元格值(展示模块数据, 行, 云商, 状态);
                  const 是否最低 =
                    (行.最低价字段 &&
                      获取最低云商(展示模块数据, 行.最低价字段) === 云商.id) ||
                    (行.维度 === '最低价标记' && 最低云商 === 云商.id);
                  const 单元格 = 是否最低
                    ? 添加单元格标签(标准化单元格(原始值, 状态), '最低')
                    : 标准化单元格(原始值, 状态);
                  return (
                    <td
                      key={云商.id}
                      className={[
                        行.对齐 === 'number' ? 'is-number' : '',
                        是否最低 ? 'is-lowest' : '',
                        单元格.标签.includes('低价') ? 'is-good-price' : '',
                        单元格.警告 ? 'is-warning' : '',
                        锁定云商 === 云商.id ? 'is-locked' : '',
                        悬停列 === `${展示模块数据.id}-${云商.id}` ? 'is-col-hover' : '',
                        状态.只看最低 && 最低云商 !== 云商.id ? 'is-muted' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onMouseEnter={() => 设置悬停列(`${展示模块数据.id}-${云商.id}`)}
                      onMouseLeave={() => 设置悬停列('')}
                    >
                      <CellContent 单元格={单元格} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CellContent({ 单元格 }) {
  return (
    <div className="cell-content">
      <span className="cell-main">{单元格.文本}</span>
      {单元格.单位 ? <span className="unit">{单元格.单位}</span> : null}
      {单元格.标签.length > 0 ? (
        <span className="tag-row">
          {单元格.标签.map((标签) => (
            <span className={`mini-tag ${获取标签类名(标签)}`} key={标签}>
              {标签}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

function 获取标签类名(标签) {
  if (标签 === '最低') {
    return 'is-lowest-tag';
  }
  if (标签 === '低价') {
    return 'is-good-price-tag';
  }
  if (标签.includes('就近') || 标签.includes('非筛选')) {
    return 'is-warning-tag';
  }
  return '';
}

createRoot(document.getElementById('root')).render(<App />);
