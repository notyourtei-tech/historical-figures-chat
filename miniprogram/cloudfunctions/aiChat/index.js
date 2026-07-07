// 云函数：aiChat
// 代理 OpenRouter API 调用，解决小程序无法直接调用外部 API 的问题

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// OpenRouter API 配置
// 在云函数环境变量中设置 OPENROUTER_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// 可用模型列表
// 策略：优先小模型（更快），中文场景优先中文模型，大模型作为后备
const MODELS = [
  // 第一梯队：速度快 + 中文好
  'qwen/qwen3-coder:free',           // Qwen3 中文原生支持好，响应快
  'google/gemini-2.0-flash-001',     // Gemini Flash 速度快，中文好（免费额度）
  // 第二梯队：质量好但稍慢
  'meta-llama/llama-3.3-70b-instruct:free',
  // 第三梯队：大模型后备
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
];

// 内存中的速率限制
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1分钟窗口
  const limit = 20; // 每分钟20次

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(ip, record);
  }

  record.timestamps = record.timestamps.filter(t => t > now - windowMs);

  if (record.timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.timestamps.push(now);
  return { allowed: true, remaining: limit - record.timestamps.length };
}

async function callOpenRouter(systemPrompt, messages, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('MISSING_API_KEY');
  }

  const { temperature = 0.8, max_tokens = 400 } = options;

  // 构建消息
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  let lastError = '';

  for (const model of MODELS) {
    try {
      console.log(`[AI] Trying model: ${model}`);

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ancient-wisdom-miniapp.vercel.app',
          'X-Title': 'Ancient-Wisdom-MiniApp',
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          max_tokens,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
        }),
        // 缩短超时到 25 秒，避免用户等太久
        signal: AbortSignal.timeout(25000),
      });

      const raw = await response.text();

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`[AI] ${model} rate limited, trying next...`);
          lastError = 'RATE_LIMIT_EXCEEDED';
          continue;
        }
        throw new Error(`${response.status}: ${raw.slice(0, 200)}`);
      }

      const data = JSON.parse(raw);
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('AI_EMPTY_RESPONSE');
      }

      return {
        success: true,
        content,
        model,
      };
    } catch (e) {
      lastError = (e && e.message) ? e.message : String(e || 'UNKNOWN_ERROR');
      console.warn(`[AI] ${model} failed:`, lastError.slice(0, 160));
    }
  }

  if (lastError && lastError.includes('RATE_LIMIT')) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', content: '所有免费模型均被限流，请稍后再试' };
  }

  return { success: false, error: 'API_CALL_FAILED', content: lastError || 'UNKNOWN_ERROR' };
}

// 云函数入口
exports.main = async (event, context) => {
  const { action, systemPrompt, messages, userPrompt, language } = event;
  const ip = context.WX_CLIENTIP || 'unknown';

  // 速率限制
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', content: '请求过于频繁' };
  }

  try {
    if (action === 'chat') {
      return await callOpenRouter(systemPrompt, messages, {
        temperature: 0.8,
        max_tokens: 400,
      });
    }

    if (action === 'greeting') {
      return await callOpenRouter(systemPrompt, [{ role: 'user', content: userPrompt }], {
        temperature: 0.85,
        max_tokens: 150,
      });
    }

    return { success: false, error: 'UNKNOWN_ACTION' };
  } catch (e) {
    console.error('[CloudFunction] Error:', e);
    return { success: false, error: 'SERVER_ERROR', content: (e && e.message) ? e.message : String(e || '未知错误') };
  }
};
