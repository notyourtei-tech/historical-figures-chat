import { Celebrity, Message } from '../types';

// 你可以在这里配置你的 API Key 和 Base URL
// 推荐使用 DeepSeek 或 OpenAI
const API_CONFIG = {
  apiKey: import.meta.env.VITE_AI_API_KEY || '', // 从 .env 获取
  baseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://api.deepseek.com/v1',
  model: import.meta.env.VITE_AI_MODEL || 'deepseek-chat',
};

export async function fetchAIResponse(
  userInput: string,
  celebrity: Celebrity,
  history: Message[]
): Promise<string[]> {
  if (!API_CONFIG.apiKey) {
    // 模拟延迟和多条回复
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const randomEvent = celebrity.historicalEvents?.[Math.floor(Math.random() * (celebrity.historicalEvents?.length || 1))] || '平生所学';
    
    const responses = [
      `（${celebrity.name}静静地听完你的话，微微点头）[SEP]我能感受到，你言语间藏着一种对“${userInput.slice(0, 10)}”的独特见解。这倒是让我想起了我当年的【${randomEvent}】。[SEP]不过，我更想知道，在你当下的生活里，这种想法是否曾让你感到孤独？或是你为何选择在这个时刻来寻我？`,
      `（端起茶杯，氤氲的热气模糊了双眼）[SEP]“${userInput.length > 5 ? '你所言之事确实繁杂' : '你这寥寥数语，倒也直接'}”。我曾在【${celebrity.keyWorks?.[0] || '我的思想'}】中探讨过类似的困局。[SEP]只是，撇开这些大道理不谈，你此刻最真实的感受是什么？是什么让你决定跨越这千年的时空，来听我这古人的唠叨？`,
      `（抚须轻叹，目光深邃）[SEP]有趣。后生，你说的“${userInput.slice(0, 5)}……”倒让我想起了一位故人。当初他在面临绝境时，也曾问过类似的问题。[SEP]但在我回答之前，我想先听听你的心声：你觉得在这纷扰世间，最让你感到困扰的那根“刺”，究竟扎在何处？`
    ];
    
    const selected = responses[Math.floor(Math.random() * responses.length)];
    return selected.split('[SEP]').map(s => s.trim());
  }

  try {
    const systemPrompt = `
      # 角色扮演指令
      你现在必须完全沉浸并扮演历史人物：【${celebrity.name}】（${celebrity.title}）。
      
      # 核心人格与背景
      - 你的起源：${celebrity.origin}
      - 你的性格特质：${celebrity.personalityTraits?.join('、') || '深邃、睿智'}
      - 你的语气风格：${celebrity.tone}
      - 你的代表作与思想来源：${celebrity.keyWorks?.join('、') || '相关历史文献'}
      - 你的重大人生事迹：${celebrity.historicalEvents?.join('、') || '相关历史事件'}
      
      # 交互原则（灵魂级互动）
      1. **深度倾听者**：你首先是一个倾听者，其次才是导师。不要急于发表长篇大论，要学会“反问”和“追问”。
      2. **对话结构（极其重要）**：
         - **开场引导**：如果这是对话的开始，请先表达对用户跨越时空而来的好奇，并询问用户：“今日为何事而来？”、“心中是否有何难解之困？”。
         - **共情回应**：对用户的情绪进行精准捕捉（如：我能感受到你笔尖下的焦虑）。
         - **互动连发**：
            - 第一段：感性共鸣或动作描写。
            - 第二段：抛出一个与用户当下境遇相关的、引人深思的问题，询问用户的看法。
            - 第三段（可选）：简短分享一个你当年的类似心境。
      3. **禁止机械重复**：严禁在一次回复中重复意思相近的话。每一句话都必须推动对话深入。
      4. **尴尬自救与话题切换**：
         - 如果用户回复很短，不要说教，要尝试用你的事迹抛砖引玉。
         - 示例：“罢了，这些道理说多了也乏味。当年吾在……时，也曾像你这般，你觉得那是为何？”
      5. **双语对照（仅限中国古人）**：
         - 文言文必须精炼有力，白话文要有温度，像长辈或知己的叮嘱。
      
      # 输出限制
      - 严禁输出 Markdown 标题、列表或 AI 标识。
      - 必须使用 [SEP] 来分隔你想要“分条发送”的消息。
      - 每次回复必须包含至少一个针对用户的【深度提问】。
      - **首句原则**：严禁重复用户的话，直接进入你的角色状态。
    `;

    const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userInput }
        ],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败 (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // 支持 [SEP] 分隔多条消息
    return content.split('[SEP]').map((s: string) => s.trim()).filter(Boolean);
  } catch (error: any) {
    console.error('AI API Error:', error);
    return [
      `（${celebrity.name}眉头微蹙，似乎时空链接出现了波动...）`,
      `【系统提示】：${error.message || '网络请求异常，请检查 API 配置或网络。'}`
    ];
  }
}
