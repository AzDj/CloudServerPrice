import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  带退避抓取,
  抓取官方文档,
  执行爬虫,
  官方文档来源,
  抽取文档内容,
  校验官方地址,
  清理文本,
  生成官方文档模块,
  等待,
  是正文候选,
} from './crawl-official-docs.mjs';

const 示例来源 = {
  id: 'demo',
  名称: '示例云',
  url: 'https://docs.example.com/pricing',
  官方域名: ['docs.example.com'],
  关键词: ['计费', 'pricing', '实例'],
};

function 创建响应({ status = 200, body = '<html></html>', url = 示例来源.url } = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    url,
    headers: {
      get: () => 'text/html; charset=utf-8',
    },
    text: async () => body,
  };
}

test('校验官方地址只允许 HTTPS 官方域名', () => {
  const 地址 = 校验官方地址(示例来源);
  assert.equal(地址.hostname, 'docs.example.com');

  assert.throws(
    () =>
      校验官方地址({
        ...示例来源,
        url: 'http://docs.example.com/pricing',
      }),
    /HTTPS/,
  );
  assert.throws(
    () =>
      校验官方地址({
        ...示例来源,
        url: 'https://fake.example.net/pricing',
      }),
    /官方域名白名单/,
  );
});

test('默认官方来源优先中国站和中文页面', () => {
  const 来源映射 = Object.fromEntries(
    官方文档来源.map((来源) => [来源.id, 来源]),
  );

  assert.match(来源映射.aliyun.url, /\/zh\//);
  assert.match(来源映射.tencent.url, /cloud\.tencent\.com/);
  assert.match(来源映射.huawei.url, /support\.huaweicloud\.com\/productdesc-ecs/);
  assert.match(来源映射.aws.url, /amazonaws\.cn/);
  assert.match(来源映射.azure.url, /azure\.cn/);
  assert.match(来源映射.gcp.url, /hl=zh-CN/);
});

test('清理文本会压缩空白字符', () => {
  assert.equal(清理文本('  价格\u00a0  计费\n说明  '), '价格 计费 说明');
});

test('正文候选会过滤账户导航文本', () => {
  assert.equal(
    是正文候选('My Account Billing & Costs Service Tickets Console Sign In Sign Up'),
    false,
  );
  assert.equal(
    是正文候选('ECSs are billed based on ECS specifications and the service duration.'),
    true,
  );
});

test('默认等待函数可以按毫秒返回', async () => {
  await assert.doesNotReject(() => 等待(0));
});

test('抽取文档内容会提取标题、摘要和命中关键词', () => {
  const html = `
    <html>
      <head><title>旧标题</title><meta property="og:title" content="官方价格文档"></head>
      <body>
        <nav>导航不应进入正文</nav>
        <h1>价格总览</h1>
        <p>云服务器实例支持按量计费和包年包月，价格会按照地域、规格和公网带宽变化。</p>
        <p>普通介绍文字不会因为太短而优先展示。</p>
        <li>pricing is listed by instance family and region.</li>
      </body>
    </html>
  `;
  const 内容 = 抽取文档内容(html, 示例来源.url, 示例来源);

  assert.equal(内容.标题, '官方价格文档');
  assert.match(内容.摘要, /按量计费/);
  assert.match(内容.摘要, /pricing/);
  assert.ok(内容.命中关键词.includes('计费'));
  assert.ok(内容.正文摘录.length >= 2);
});

test('抽取文档内容在没有关键词命中时回退到正文段落', () => {
  const 内容 = 抽取文档内容(
    '<html><body><p>这是一段长度足够的普通官方说明文本，用于验证回退提取路径。</p></body></html>',
    示例来源.url,
    { ...示例来源, 关键词: ['不存在'] },
  );

  assert.match(内容.摘要, /普通官方说明文本/);
});

test('抽取文档内容支持没有自定义关键词的来源', () => {
  const 内容 = 抽取文档内容(
    '<html><body><h1>计费说明</h1><p>云服务器实例价格会按照地域、规格和计费方式展示，适合比价核对。</p></body></html>',
    示例来源.url,
    { id: 'demo', 名称: '示例云', url: 示例来源.url },
  );

  assert.match(内容.摘要, /实例价格/);
});

test('抽取文档内容在空正文时返回兜底摘要', () => {
  const 内容 = 抽取文档内容('<html><body></body></html>', 示例来源.url, 示例来源);

  assert.match(内容.摘要, /页面正文未抽取到可展示段落/);
});

test('带退避抓取遇到 429 会等待 20 秒后重试', async () => {
  const 等待记录 = [];
  const 状态列表 = [429, 200];
  const 响应 = await 带退避抓取(示例来源, {
    sleep: async (毫秒) => 等待记录.push(毫秒),
    fetch实现: async () => 创建响应({ status: 状态列表.shift(), body: '成功' }),
  });

  assert.equal(响应.html, '成功');
  assert.deepEqual(等待记录, [20000]);
});

test('带退避抓取遇到 5xx 会等待 2 秒后重试', async () => {
  const 等待记录 = [];
  const 状态列表 = [502, 200];
  const 响应 = await 带退避抓取(示例来源, {
    sleep: async (毫秒) => 等待记录.push(毫秒),
    fetch实现: async () => 创建响应({ status: 状态列表.shift(), body: '恢复' }),
  });

  assert.equal(响应.html, '恢复');
  assert.deepEqual(等待记录, [2000]);
});

test('带退避抓取遇到超时会等待 2 秒后重试', async () => {
  const 等待记录 = [];
  const 超时错误 = Object.assign(new Error('请求超时'), { name: 'AbortError' });
  let 调用次数 = 0;
  const 响应 = await 带退避抓取(示例来源, {
    sleep: async (毫秒) => 等待记录.push(毫秒),
    fetch实现: async () => {
      调用次数 += 1;
      if (调用次数 === 1) {
        throw 超时错误;
      }
      return 创建响应({ status: 200, body: '超时后恢复', url: '' });
    },
  });

  assert.equal(响应.html, '超时后恢复');
  assert.equal(响应.finalUrl, 示例来源.url);
  assert.deepEqual(等待记录, [2000]);
});

test('带退避抓取在运行时缺少 fetch 时会报错', async () => {
  await assert.rejects(
    () => 带退避抓取(示例来源, { fetch实现: null }),
    /不支持 fetch/,
  );
});

test('带退避抓取支持响应没有最终地址和内容类型', async () => {
  const 响应 = await 带退避抓取(示例来源, {
    fetch实现: async () => ({
      status: 200,
      ok: true,
      url: '',
      text: async () => '无响应头',
    }),
  });

  assert.equal(响应.finalUrl, 示例来源.url);
  assert.equal(响应.contentType, '');
});

test('带退避抓取会报告非可重试 HTTP 错误', async () => {
  await assert.rejects(
    () =>
      带退避抓取(示例来源, {
        fetch实现: async () => 创建响应({ status: 404 }),
      }),
    /HTTP 404/,
  );
});

test('抓取官方文档成功时返回可展示资讯', async () => {
  const 文档 = await 抓取官方文档(示例来源, {
    抓取时间: '2026-07-12T00:00:00.000Z',
    fetch实现: async () =>
      创建响应({
        body: '<html><body><h1>价格</h1><p>实例 pricing 与计费信息按地域展示，适合比价采集。</p></body></html>',
      }),
  });

  assert.equal(文档.状态, '成功');
  assert.equal(文档.http状态, 200);
  assert.match(文档.摘要, /计费信息/);
});

test('抓取官方文档失败时返回失败状态而不抛出', async () => {
  const 文档 = await 抓取官方文档(示例来源, {
    fetch实现: async () => {
      throw new Error('网络失败');
    },
  });

  assert.equal(文档.状态, '失败');
  assert.match(文档.摘要, /网络失败/);
});

test('抓取官方文档可以处理非 Error 类型失败', async () => {
  const 文档 = await 抓取官方文档(示例来源, {
    fetch实现: async () => {
      throw '裸字符串错误';
    },
  });

  assert.equal(文档.状态, '失败');
  assert.match(文档.摘要, /裸字符串错误/);
});

test('生成官方文档模块会输出可导入的中文静态数据', () => {
  const 源码 = 生成官方文档模块(
    [
      {
        id: 'demo',
        名称: '示例云',
        状态: '成功',
        摘要: '示例摘要',
      },
    ],
    '2026-07-12T00:00:00.000Z',
  );

  assert.match(源码, /官方文档更新时间/);
  assert.match(源码, /成功数量/);
  assert.match(源码, /示例摘要/);
});

test('执行爬虫会写出生成文件', async () => {
  const 临时目录 = await mkdtemp(path.join(os.tmpdir(), 'cspc-docs-'));
  const 输出路径 = path.join(临时目录, 'official-docs-data.js');

  try {
    const 结果 = await 执行爬虫({
      来源列表: [示例来源],
      输出路径,
      控制台: { log() {} },
      fetch实现: async () =>
        创建响应({
          body: '<html><body><h1>价格</h1><p>实例 pricing 与计费信息按地域展示，适合比价采集。</p></body></html>',
        }),
    });
    const 源码 = await readFile(输出路径, 'utf8');

    assert.equal(结果.成功数量, 1);
    assert.match(源码, /示例云/);
  } finally {
    await rm(临时目录, { recursive: true, force: true });
  }
});
