import { load } from 'cheerio';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const 官方文档来源 = [
  {
    id: 'aliyun',
    名称: '阿里云',
    url: 'https://help.aliyun.com/zh/ecs/product-overview/billing-overview',
    官方域名: ['help.aliyun.com', 'aliyun.com'],
    关键词: ['计费', '价格', '按量付费', '包年包月', 'ECS', '实例', '公网'],
  },
  {
    id: 'tencent',
    名称: '腾讯云',
    url: 'https://cloud.tencent.com/document/product/213/2180',
    官方域名: ['cloud.tencent.com'],
    关键词: ['计费', '价格', '按量计费', '包年包月', 'CVM', '实例', '公网'],
  },
  {
    id: 'huawei',
    名称: '华为云',
    url: 'https://support.huaweicloud.com/eu/productdesc-ecs/ecs_01_0065.html',
    官方域名: ['huaweicloud.com'],
    关键词: ['Billing', 'price', 'pay-per-use', 'yearly/monthly', 'ECS', 'Elastic Cloud Server'],
  },
  {
    id: 'aws',
    名称: 'AWS',
    url: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    官方域名: ['aws.amazon.com'],
    关键词: ['pricing', 'On-Demand', 'EC2', 'instance', 'compute', 'data transfer'],
  },
  {
    id: 'azure',
    名称: 'Azure',
    url: 'https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/',
    官方域名: ['azure.microsoft.com'],
    关键词: ['pricing', 'Virtual Machines', 'Linux', 'region', 'pay as you go', 'reserved'],
  },
  {
    id: 'gcp',
    名称: 'Google Cloud',
    url: 'https://cloud.google.com/compute/vm-instance-pricing',
    官方域名: ['cloud.google.com'],
    关键词: ['pricing', 'Compute Engine', 'VM', 'machine type', 'region', 'discount'],
  },
];

export const 默认输出路径 = path.resolve('src/generated/official-docs-data.js');

const 默认关键词 = [
  '价格',
  '计费',
  '按量',
  '包年',
  '包月',
  '实例',
  '存储',
  '数据库',
  '流量',
  '带宽',
  'CDN',
  'pricing',
  'billing',
  'on-demand',
  'reserved',
  'instance',
  'storage',
  'network',
  'bandwidth',
];

const 用户代理 =
  'CloudServerPriceCrawler/1.0 (+https://github.com/AzDj/CloudServerPrice)';
const 默认超时毫秒 = 20000;

export function 清理文本(文本) {
  return String(文本 || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function 截断文本(文本, 最大长度 = 220) {
  const 已清理 = 清理文本(文本);
  return 已清理.length > 最大长度
    ? `${已清理.slice(0, 最大长度 - 1)}...`
    : 已清理;
}

export function 校验官方地址(来源) {
  const 地址 = new URL(来源.url);
  const 允许域名 = 来源.官方域名 || [];
  const 是官方域名 = 允许域名.some(
    (域名) => 地址.hostname === 域名 || 地址.hostname.endsWith(`.${域名}`),
  );

  if (地址.protocol !== 'https:') {
    throw new Error(`${来源.名称} 文档地址必须使用 HTTPS`);
  }

  if (!是官方域名) {
    throw new Error(`${来源.名称} 文档地址不在官方域名白名单内`);
  }

  return 地址;
}

export function 提取命中关键词(文本列表, 关键词列表 = 默认关键词) {
  const 全文 = 文本列表.join(' ').toLowerCase();
  return 关键词列表.filter((关键词) =>
    全文.includes(String(关键词).toLowerCase()),
  );
}

export function 是正文候选(文本) {
  const 已清理 = 清理文本(文本);
  const 小写文本 = 已清理.toLowerCase();
  const 导航特征 = [
    'sign in',
    'sign up',
    'log out',
    'console',
    'service tickets',
    'partner center',
    'my account',
    '账号中心',
    '工单',
    '管理控制台',
    '注册',
    '登录',
  ];
  const 命中数量 = 导航特征.filter((特征) => 小写文本.includes(特征)).length;

  return 已清理.length >= 18 && 已清理.length <= 360 && 命中数量 < 2;
}

export function 抽取文档内容(html, 最终地址, 来源) {
  const $ = load(html);
  $('script, style, noscript, svg, nav, footer, header, aside, form, button').remove();

  const 标题 = 截断文本(
    $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').first().text() ||
      来源.名称,
    120,
  );
  const 关键词列表 = [...new Set([...(来源.关键词 || []), ...默认关键词])];
  const 所有文本 = [];

  $('h1, h2, h3, p, li, td, th').each((_, 元素) => {
    const 文本 = 清理文本($(元素).text());
    if (是正文候选(文本)) {
      所有文本.push(文本);
    }
  });

  const 已出现 = new Set();
  const 命中文本 = [];
  for (const 文本 of 所有文本) {
    const 小写文本 = 文本.toLowerCase();
    const 命中 = 关键词列表.some((关键词) =>
      小写文本.includes(String(关键词).toLowerCase()),
    );
    if (!命中 || 已出现.has(文本)) {
      continue;
    }
    已出现.add(文本);
    命中文本.push(截断文本(文本, 220));
  }

  const 正文摘录 =
    命中文本.length > 0
      ? 命中文本.slice(0, 4)
      : 所有文本.slice(0, 4).map((文本) => 截断文本(文本, 220));
  const 摘要 = 截断文本(正文摘录.join(' '), 320);
  const 命中关键词 = 提取命中关键词(正文摘录, 关键词列表).slice(0, 8);

  return {
    标题,
    摘要: 摘要 || `${来源.名称} 官方文档已抓取，但页面正文未抽取到可展示段落。`,
    正文摘录,
    命中关键词,
    最终地址,
  };
}

export function 等待(毫秒) {
  return new Promise((resolve) => {
    setTimeout(resolve, 毫秒);
  });
}

export async function 带退避抓取(
  来源,
  {
    fetch实现 = globalThis.fetch,
    sleep = 等待,
    timeoutMs = 默认超时毫秒,
  } = {},
) {
  const 地址 = 校验官方地址(来源);

  if (typeof fetch实现 !== 'function') {
    throw new Error('当前 Node.js 运行时不支持 fetch');
  }

  let 最后错误;
  for (let 尝试次数 = 0; 尝试次数 < 2; 尝试次数 += 1) {
    const 控制器 = new AbortController();
    const 超时 = setTimeout(() => 控制器.abort(), timeoutMs);

    try {
      const 响应 = await fetch实现(地址.href, {
        redirect: 'follow',
        signal: 控制器.signal,
        headers: {
          'user-agent': 用户代理,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      if (响应.status === 429 && 尝试次数 === 0) {
        await sleep(20000);
        continue;
      }

      if ((响应.status >= 500 || 响应.status === 408) && 尝试次数 === 0) {
        await sleep(2000);
        continue;
      }

      if (!响应.ok) {
        throw new Error(`HTTP ${响应.status}`);
      }

      return {
        html: await 响应.text(),
        status: 响应.status,
        finalUrl: 响应.url || 地址.href,
        contentType: 响应.headers?.get?.('content-type') || '',
      };
    } catch (错误) {
      最后错误 = 错误;
      const 是超时 = 错误?.name === 'AbortError';
      if (是超时 && 尝试次数 === 0) {
        await sleep(2000);
        continue;
      }
      throw 错误;
    } finally {
      clearTimeout(超时);
    }
  }

  /* c8 ignore next */
  throw 最后错误 || new Error('抓取失败');
}

export async function 抓取官方文档(来源, 选项 = {}) {
  const 抓取时间 = 选项.抓取时间 || new Date().toISOString();

  try {
    const 响应 = await 带退避抓取(来源, 选项);
    const 内容 = 抽取文档内容(响应.html, 响应.finalUrl, 来源);
    return {
      id: 来源.id,
      名称: 来源.名称,
      url: 来源.url,
      最终地址: 内容.最终地址,
      标题: 内容.标题,
      摘要: 内容.摘要,
      正文摘录: 内容.正文摘录,
      命中关键词: 内容.命中关键词,
      状态: '成功',
      http状态: 响应.status,
      内容类型: 响应.contentType,
      抓取时间,
    };
  } catch (错误) {
    return {
      id: 来源.id,
      名称: 来源.名称,
      url: 来源.url,
      最终地址: 来源.url,
      标题: `${来源.名称} 官方文档`,
      摘要: `抓取失败：${截断文本(错误?.message || 错误, 180)}`,
      正文摘录: [],
      命中关键词: [],
      状态: '失败',
      http状态: null,
      内容类型: '',
      抓取时间,
    };
  }
}

export function 生成官方文档模块(文档列表, 抓取时间) {
  const 日期 = 抓取时间.slice(0, 10);
  const 成功数量 = 文档列表.filter((文档) => 文档.状态 === '成功').length;
  const 摘要 = {
    抓取时间,
    日期,
    总数: 文档列表.length,
    成功数量,
    失败数量: 文档列表.length - 成功数量,
  };

  return [
    '// 本文件由 scripts/crawl-official-docs.mjs 生成，请勿手工修改。',
    `export const 官方文档更新时间 = ${JSON.stringify(抓取时间)};`,
    `export const 官方文档抓取摘要 = ${JSON.stringify(摘要, null, 2)};`,
    `export const 官方文档资讯 = ${JSON.stringify(文档列表, null, 2)};`,
    '',
  ].join('\n');
}

export async function 执行爬虫({
  来源列表 = 官方文档来源,
  输出路径 = 默认输出路径,
  fetch实现 = globalThis.fetch,
  sleep = 等待,
  timeoutMs = 默认超时毫秒,
  控制台 = console,
} = {}) {
  const 抓取时间 = new Date().toISOString();
  const 文档列表 = [];

  for (const 来源 of 来源列表) {
    控制台.log(`抓取 ${来源.名称} 官方文档：${来源.url}`);
    文档列表.push(
      await 抓取官方文档(来源, { fetch实现, sleep, timeoutMs, 抓取时间 }),
    );
  }

  await mkdir(path.dirname(输出路径), { recursive: true });
  await writeFile(输出路径, 生成官方文档模块(文档列表, 抓取时间), 'utf8');

  const 成功数量 = 文档列表.filter((文档) => 文档.状态 === '成功').length;
  控制台.log(`官方文档爬虫完成：成功 ${成功数量}/${文档列表.length}`);

  return { 文档列表, 成功数量, 抓取时间, 输出路径 };
}

/* c8 ignore next 2 */
const 当前文件 = fileURLToPath(import.meta.url);
const 入口文件 = process.argv[1] ? path.resolve(process.argv[1]) : '';

/* c8 ignore next 8 */
if (入口文件 && path.resolve(当前文件) === 入口文件) {
  执行爬虫().then(({ 成功数量, 文档列表 }) => {
    if (成功数量 === 0 && process.env.CRAWLER_STRICT === '1') {
      console.error(`所有官方文档均抓取失败：${文档列表.map((文档) => 文档.摘要).join('；')}`);
      process.exitCode = 1;
    }
  });
}
