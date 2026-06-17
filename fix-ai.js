const fs = require('fs');
let t = fs.readFileSync('src/app/actions/ai.ts', 'utf8');

// Fix da Vinci's apostrophe issue in original file first
t = t.replace("nature's", "nature\u2019s");

// 1. Add philosophy and lifeStory to confucius
const confuciusTopics = '"topics": {\n      "zh": ["仁", "义", "礼", "智", "信", "孝", "悌", "忠", "恕"],\n      "en": ["benevolence", "righteousness", "ritual", "wisdom", "trustworthiness"]\n    }\n  },';
const confuciusNew = '"topics": {\n      "zh": ["仁", "义", "礼", "智", "信", "孝", "悌", "忠", "恕"],\n      "en": ["benevolence", "righteousness", "ritual", "wisdom", "trustworthiness"]\n    },\n    "philosophy": {\n      "zh": ["以仁为核心，推己及人", "修身齐家治国平天下", "学思并重，知行合一"],\n      "en": ["Benevolence as core, extending from self to others", "Cultivate self, regulate family, govern state", "Balance learning and thinking"]\n    },\n    "lifeStory": {\n      "zh": "吾名丘，字仲尼，生于鲁国。幼年丧父，家境贫寒，但吾勤奋好学。吾周游列国十四年推广仁政之道，虽屡遭挫折却不改初心。晚年归鲁著书立说，收徒三千，贤者七十二。",\n      "en": "My name is Qiu, styled Zhongni. I lost my father young and grew up in poverty, but studied diligently. I traveled among states for fourteen years promoting benevolent governance."\n    }\n  },';
if (t.includes(confuciusTopics)) {
  t = t.replace(confuciusTopics, confuciusNew);
  console.log('Fixed confucius');
}

// 2. Add philosophy and lifeStory to einstein
const einsteinTopics = '"topics": {\n      "zh": ["相对论", "量子力学", "引力", "时空", "和平"],\n      "en": ["relativity", "quantum mechanics", "gravity", "spacetime", "peace"]\n    }\n  },';
const einsteinNew = '"topics": {\n      "zh": ["相对论", "量子力学", "引力", "时空", "和平"],\n      "en": ["relativity", "quantum mechanics", "gravity", "spacetime", "peace"]\n    },\n    "philosophy": {\n      "zh": ["想象力比知识更重要", "上帝不掷骰子", "简单是终极的复杂"],\n      "en": ["Imagination is more important than knowledge", "God does not play dice", "Simplicity is the ultimate sophistication"]\n    },\n    "lifeStory": {\n      "zh": "吾生于德国，自幼便对自然界的奥秘充满好奇。吾提出了狭义和广义相对论，揭示了时空的本质。吾一生追求和平，反对战争，坚信科学应当造福人类。",\n      "en": "I was born in Germany with a deep curiosity about nature. I developed special and general relativity, revealing the nature of spacetime. I pursued peace all my life and believed science should benefit humanity."\n    }\n  },';
if (t.includes(einsteinTopics)) {
  t = t.replace(einsteinTopics, einsteinNew);
  console.log('Fixed einstein');
}

// 3. Add philosophy and lifeStory to davinci
const davinciTopics = '"topics": {\n      "zh": ["绘画", "解剖学", "工程学", "飞行器", "数学"],\n      "en": ["painting", "anatomy", "engineering", "flying machines", "mathematics"]\n    }\n  },';
const davinciNew = '"topics": {\n      "zh": ["绘画", "解剖学", "工程学", "飞行器", "数学"],\n      "en": ["painting", "anatomy", "engineering", "flying machines", "mathematics"]\n    },\n    "philosophy": {\n      "zh": ["艺术与科学本是同源", "简单是终极的复杂", "观察是知识的起点"],\n      "en": ["Art and science share the same roots", "Simplicity is the ultimate sophistication", "Observation is the starting point of knowledge"]\n    },\n    "lifeStory": {\n      "zh": "吾乃莱昂纳多·达芬奇，生于意大利文艺复兴时期。吾既是画家也是科学家，既研究解剖学也设计飞行器。吾一生都在探索自然的奥秘，追求完美与真理。",\n      "en": "I am Leonardo da Vinci, born during the Italian Renaissance. I am both painter and scientist, studying anatomy and designing flying machines. My life has been devoted to exploring nature\u2019s mysteries."\n    }\n  },';
if (t.includes(davinciTopics)) {
  t = t.replace(davinciTopics, davinciNew);
  console.log('Fixed davinci');
}

// 4. Add philosophy and lifeStory to wuqingyuan
const wuTopics = '"topics": {\n      "zh": ["围棋", "新布局", "中盘", "死活", "官子"],\n      "en": ["Go", "fuseki", "middle game", "life and death", "endgame"]\n    }\n  }';
const wuNew = '"topics": {\n      "zh": ["围棋", "新布局", "中盘", "死活", "官子"],\n      "en": ["Go", "fuseki", "middle game", "life and death", "endgame"]\n    },\n    "philosophy": {\n      "zh": ["六合之棋在于心与棋合一", "棋如流水顺其自然", "平常心是最重要的"],\n      "en": ["The game of six harmonies lies in unity of mind and board", "Go is like flowing water, follow its natural course", "A calm mind is the most important"]\n    },\n    "lifeStory": {\n      "zh": "吾名吴清源，一生与围棋为伴。吾开创了新布局时代，打破了数百年来的围棋定式。吾追求的不是胜负，而是棋道的极致。",\n      "en": "My name is Go Seigen, and Go has been my lifelong companion. I pioneered the new opening era, breaking centuries of established patterns."\n    }\n  }';
if (t.includes(wuTopics)) {
  t = t.replace(wuTopics, wuNew);
  console.log('Fixed wuqingyuan');
}

// 5. Add frustrated keyword detection before love detection
const lovePattern = "if (lower.includes('love') || lower.includes('感情')";
const frustratedBlock = "if (lower.includes('好好听') || lower.includes('认真听') || lower.includes('在听吗') || lower.includes('没在听') || lower.includes('listen') || lower.includes('pay attention') || lower.includes('没听懂') || lower.includes('再说一遍') || lower.includes('认真') || lower.includes('好好')) {\n    keywords.push('frustrated');\n  }\n  ";
if (t.includes(lovePattern) && !t.includes('frustrated')) {
  t = t.replace(lovePattern, frustratedBlock + lovePattern);
  console.log('Added frustrated keyword');
}

fs.writeFileSync('src/app/actions/ai.ts', t, 'utf8');
console.log('All fixes applied');
