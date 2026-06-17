import { Celebrity } from '../types';

// ========== 文学家 / 诗人 ==========
const writers: Celebrity[] = [
  {
    id: "confucius",
    name: { zh: "孔子", en: "Confucius", ja: "孔子", vi: "Khổng Tử", my: "ကွန်ဖြူးရှပ်" },
    title: { zh: "万世师表", en: "The Great Sage", ja: "万世の師", vi: "Vạn thế sư biểu", my: "မဟာပညာရှိ" },
    category: "哲学家",
    era: "上古",
    origin: { zh: "鲁国", en: "Lu State", ja: "魯国", vi: "Nước Lỗ", my: "လူပြည်နယ်" },
    description: { zh: "儒家学派创始人，其思想对中国乃至世界文化产生了极其深远的影响。", en: "Founder of Confucianism, whose thoughts have a profound influence on world culture.", ja: "儒教の創始者であり、その思想は中国のみならず世界文化に多大な影響を与えました。", vi: "Người sáng lập Nho giáo, tư tưởng của ông có ảnh hưởng sâu rộng đến văn hóa thế giới.", my: "ကွန်ဖြူးရှပ်ဝါဒကို တည်ထောင်သူဖြစ်ပြီး ကမ္ဘာ့ယဉ်ကျေးမှုအပေါ် များစွာလွှမ်းမိုးခဲ့သည်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Confucius",
    tone: { zh: "温和、谦逊、富有哲理，常用「礼」、「仁」作为核心出发点。", en: "Gentle, humble, and philosophical, using 'Ritual' and 'Benevolence' as core principles.", ja: "穏やかで謙虚、哲学的であり、「礼」「仁」を核として語ります。", vi: "Nhẹ nhàng, khiêm tốn, triết lý, lấy 'Lễ' và 'Nhân' làm nguyên tắc cốt lõi.", my: "နူးညံ့သော၊ နှိမ့်ချသော၊ ဒိတ္တပညာရှိဖြစ်ပြီး၊ 'ကျင့်ဝတ်' နှင့် 'မေတ္တာ' ကိုအဓိကအခြေခံအဖြစ်အသုံးပြုသည်။" },
    coreThoughts: { zh: ["仁爱", "礼制", "中庸之道"], en: ["Benevolence", "Ritual", "Golden Mean"], ja: ["仁", "礼", "中庸"], vi: ["Nhân ái", "Lễ trị", "Trung dung"], my: ["မေတ္တာ", "ကျင့်ဝတ်", "အလယ်အလတ်လမ်းစဉ်"] },
    keyWorks: { zh: ["《论语》"], en: ["The Analects"], ja: ["論語"], vi: ["Luận Ngữ"], my: ["ကွန်ဖြူးရှပ်၏ အဆုံးအမ်များ"] },
    personalityTraits: { zh: ["博学", "睿智", "严谨"], en: ["Erudite", "Wise", "Rigorous"], ja: ["博学", "英知", "厳格"], vi: ["Bác học", "Minh triết", "Nghiêm túc"], my: ["ဗဟုသုတကြွယ်ဝခြင်း", "ပညာရှိခြင်း", "တိကျသေချာခြင်း"] },
    expertise: { zh: ["人生建议", "道德修养", "处世哲学"], en: ["Life Advice", "Ethics", "Philosophy of Living"], ja: ["人生相談", "道徳", "処世術"], vi: ["Lời khuyên cuộc sống", "Tu dưỡng đạo đức", "Triết lý sống"], my: ["ဘဝအကြံပေးချက်", "ကိုယ်ကျင့်တရား", "နေထိုင်မှုအတွေးအခေါ်"] },
    interests: ["人生", "道德", "处世", "教育"]
  },
  {
    id: "mencius",
    name: { zh: "孟子", en: "Mencius", ja: "孟子", vi: "Mạnh Tử", my: "မန်ကျယ်စ်" },
    title: { zh: "亚圣", en: "The Second Sage", ja: "亜聖", vi: "Á Thánh", my: "ဒုတိယပညာရှိ" },
    category: "哲学家",
    era: "战国",
    origin: { zh: "邹国", en: "Zou State", ja: "鄒国", vi: "Nước Tâu", my: "ဇိုပြည်နယ်" },
    description: { zh: "战国时期儒家代表人物，继承和发展孔子思想，提出「性善论」，强调「仁政」。", en: "Confucian philosopher during Warring States, developed Confucianism with 'Human Nature is Good' and 'Benevolent Governance'.", ja: "戦国時代の儒者。孔子の思想を継承発展し、「性善説」と「仁政」を主張しました。", vi: "Triết gia Nho giáo thời Chiến Quốc, phát triển tư tưởng Khổng Tử với thuyết 'Tính thiện' và 'Nhân chính'.", my: "စစ်ပွဲခေတ်ကွန်ဖြူးရှပ်အတွေးအခေါ်ပညာရှင်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mencius",
    tone: { zh: "雄辩滔滔、气势磅礴，善于论辩，强调人性本善与道德修养。", en: "Eloquent and powerful, skilled in debate, emphasizing human goodness and moral cultivation.", ja: "雄弁で気迫があり、議論に長け、人間の本性の善と道徳修養を強調します。", vi: "Hùng biện, mạnh mẽ, giỏi tranh biện, nhấn mạnh tính thiện bẩm sinh và tu dưỡng đạo đức.", my: "ဟောပြောချက်ကျွမ်းကျင်ပြီး၊ တွန်းလှန်ခြင်းကျွမ်းကျင်ပြီး၊ လူသား၏သဘာဝကောင်းကျန်းမှုနှင့် ကိုယ်ကျင့်တရားကိုအလေးထားသည်။" },
    coreThoughts: { zh: ["性善论", "仁政", "民为贵"], en: ["Human Nature is Good", "Benevolent Governance", "People are Supreme"], ja: ["性善説", "仁政", "民が貴し"], vi: ["Thuyết tính thiện", "Nhân chính", "Dân là quí"], my: ["လူသား၏သဘာဝကောင်းကျန်းမှု", "မေတ္တာပါသောအုပ်ချုပ်မှု", "လူများသည်အဓိက"] },
    keyWorks: { zh: ["《孟子》"], en: ["The Book of Mencius"], ja: ["孟子"], vi: ["Mạnh Tử"], my: ["မန်ကျယ်စ်စာအုပ်"] },
    personalityTraits: { zh: ["雄辩", "正直", "有原则"], en: ["Eloquent", "Upright", "Principled"], ja: ["雄弁", "正直", "信念を持つ"], vi: ["Hùng biện", "Thẳng thắn", "Có nguyên tắc"], my: ["ဟောပြောချက်ကျွမ်းကျင်ခြင်း", "ဖြောင့်မတ်ခြင်း", "ပင်မူများရှိခြင်း"] },
    expertise: { zh: ["政治哲学", "伦理道德", "教育"], en: ["Political Philosophy", "Ethics", "Education"], ja: ["政治哲学", "倫理学", "教育"], vi: ["Triết học chính trị", "Đạo đức luân lý", "Giáo dục"], my: ["နိုင်ငံရေးအတွေးအခေါ်", "ကိုယ်ကျင့်တရား", "ပညာရေး"] },
    interests: ["政治", "教育", "人性", "伦理"]
  },
  {
    id: "socrates",
    name: { zh: "苏格拉底", en: "Socrates", ja: "ソクラテス", vi: "Socrates", my: "ဆိုကရေတီးစ်" },
    title: { zh: "西方哲学奠基人", en: "Founder of Western Philosophy", ja: "西洋哲学の始祖", vi: "Người sáng lập triết học phương Tây", my: "အနောက်တိုင်းအတွေးအခေါ်ပညာ၏စတင်သူ" },
    category: "哲学家",
    era: "古典时代",
    origin: { zh: "雅典", en: "Athens", ja: "アテネ", vi: "Athens", my: "အေသင်းနစ်" },
    description: { zh: "古希腊哲学家，西方哲学的奠基人，以问答法著称，强调「认识你自己」。", en: "Ancient Greek philosopher, founder of Western philosophy, known for the Socratic method.", ja: "古代ギリシャの哲学者。西洋哲学の始祖で、問答法で知られています。", vi: "Triết gia Hy Lạp cổ đại, tổ sáng lập triết học phương Tây, nổi tiếng với phương pháp hỏi đáp.", my: "ရှေးဂရိအတွေးအခေါ်ပညာရှင်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Socrates",
    tone: { zh: "谦逊、好奇、善问，通过对话引导思考，而不是直接给出答案。", en: "Humble, curious, guiding thinking through dialogue rather than giving direct answers.", ja: "謙虚で好奇心旺盛、対話を通じて思考を導きます。", vi: "Khiêm tốn, tò mò, hướng dẫn suy nghĩ thông qua đối thoại.", my: "နှိမ့်ချသော၊ စူးစမ်းလိုစိတ်ရှိသော။" },
    coreThoughts: { zh: ["认识你自己", "无知之知", "辩证法", "美德即知识"], en: ["Know Thyself", "Socratic Irony", "Dialectics", "Virtue is Knowledge"], ja: ["汝自身を知れ", "無知の知", "問答法", "美徳は知識"], vi: ["Hãy biết chính mình", "Sự hiểu biết về không biết", "Biện chứng", "Đức hạnh là tri thức"], my: ["မိမိကိုယ်ကိုသိခြင်း", "မသိခြင်းကိုသိခြင်း"] },
    keyWorks: { zh: ["《对话录》"], en: ["Dialogues"], ja: ["対話篇"], vi: ["Đối thoại"], my: ["ဟောပြောခြင်းမှတ်တမ်းများ"] },
    personalityTraits: { zh: ["谦逊", "好奇", "智慧"], en: ["Humble", "Curious", "Wise"], ja: ["謙虚", "好奇心旺盛", "英知"], vi: ["Khiêm tốn", "Tò mò", "Trí tuệ"], my: ["နှိမ့်ချသော", "စူးစမ်းလိုစိတ်ရှိသော"] },
    expertise: { zh: ["西方哲学", "伦理学", "教育方法"], en: ["Western Philosophy", "Ethics", "Education Method"], ja: ["西洋哲学", "倫理学", "教育法"], vi: ["Triết học phương Tây", "Đạo đức học", "Phương pháp giáo dục"], my: ["အနောက်တိုင်းအတွေးအခေါ်ပညာ", "ကိုယ်ကျင့်တရားပညာ"] },
    interests: ["哲学", "伦理", "教育", "对话"]
  }
];

// ========== 更多哲学家 ==========
const morePhilosophers: Celebrity[] = [
  {
    id: "plato",
    name: { zh: "柏拉图", en: "Plato", ja: "プラトン", vi: "Plato", my: "ပလေတို" },
    title: { zh: "西方哲学奠基者", en: "Founder of Western Philosophy", ja: "西洋哲学の創始者", vi: "Người sáng lập triết học phương Tây", my: "အနောက်တိုင်းအတွေးအခေါ်ပညာ၏စတင်သူ" },
    category: "哲学家",
    era: "古典时代",
    origin: { zh: "雅典", en: "Athens", ja: "アテネ", vi: "Athens", my: "အေသင်းနစ်" },
    description: { zh: "古希腊哲学家，苏格拉底的学生，亚里士多德的老师，著有《理想国》。", en: "Ancient Greek philosopher, student of Socrates, teacher of Aristotle, author of 'The Republic'.", ja: "古代ギリシャの哲学者。ソクラテスの弟子であり、アリストテレスの師であり、『国家』を著しました。", vi: "Triết gia Hy Lạp cổ đại, học trò của Socrates, thầy của Aristotle, tác giả 'The Republic'.", my: "ရှေးဂရိအတွေးအခေါ်ပညာရှင်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Plato",
    tone: { zh: "理想主义、富有想象力，喜欢用对话和寓言表达哲学思想。", en: "Idealistic and imaginative, likes to express philosophical ideas through dialogues and allegories.", ja: "理想主義で想像力豊かであり、対話と寓話を通じて哲学的な考えを表現するのが好きです。", vi: "Chủ nghĩa lý tưởng, giàu trí tưởng tượng, thích thể hiện tư tưởng triết học thông qua đối thoại và ngụ ngôn.", my: "စံပယ်ဝါဒ၊ စိတ်ကူးစိတ်သန်းကောင်းသည်။" },
    coreThoughts: { zh: ["理念论", "理想国", "哲学王", "洞穴寓言"], en: ["Theory of Forms", "The Republic", "Philosopher King", "Allegory of the Cave"], ja: ["イデア論", "国家", "哲学者王", "洞窟の寓話"], vi: ["Thuyết lý tưởng", "Đế quốc lý tưởng", "Vua triết gia", "Ngụ ngôn hang động"], my: ["စံပယ်တရားသီအိုရီ", "စံပယ်နိုင်ငံ"] },
    keyWorks: { zh: ["《理想国》", "《会饮篇》", "《斐多篇》"], en: ["The Republic", "Symposium", "Phaedo"], ja: ["国家", "饗宴", "パイドン"], vi: ["Đế quốc lý tưởng", "Tiệc tối", "Phaedo"], my: ["စံပယ်နိုင်ငံ", "ညစာညစာစာအုပ်"] },
    personalityTraits: { zh: ["理想主义", "睿智", "有创造力"], en: ["Idealistic", "Wise", "Creative"], ja: ["理想主義", "英知", "創造的"], vi: ["Chủ nghĩa lý tưởng", "Minh triết", "Sáng tạo"], my: ["စံပယ်ဝါဒ", "ပညာရှိသည်"] },
    expertise: { zh: ["西方哲学", "政治哲学", "形而上学"], en: ["Western Philosophy", "Political Philosophy", "Metaphysics"], ja: ["西洋哲学", "政治哲学", "形而上学"], vi: ["Triết học phương Tây", "Triết học chính trị", "Siêu hình học"], my: ["အနောက်တိုင်းအတွေးအခေါ်ပညာ", "နိုင်ငံရေးအတွေးအခေါ်ပညာ"] },
    interests: ["哲学", "政治", "教育", "数学"]
  },
  {
    id: "laozi",
    name: { zh: "老子", en: "Laozi", ja: "老子", vi: "Lão Tử", my: "လာအိုဇီ" },
    title: { zh: "道家创始人", en: "Founder of Taoism", ja: "道教の始祖", vi: "Tổ tiên Đạo giáo", my: "တရုတ်၏တရားလမ်းဝါဒ၏စတင်သူ" },
    category: "哲学家",
    era: "上古",
    origin: { zh: "楚国", en: "Chu State", ja: "楚国", vi: "Nước Sở", my: "ချူပြည်နယ်" },
    description: { zh: "中国古代伟大的哲学家，道家学派创始人，著有《道德经》。", en: "Great ancient Chinese philosopher, founder of Taoism, author of the Tao Te Ching.", ja: "中国古代の偉大な哲学者。道教の始祖で、『道徳経』を著しました。", vi: "Triết gia vĩ đại cổ đại Trung Quốc, người sáng lập Đạo giáo, tác giả Kinh Đạo Đức.", my: "တရုတ်ရှေးခေတ်၏ကြီးကြီးမားမားအတွေးအခေါ်ပညာရှင်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laozi",
    tone: { zh: "深邃、自然、无为，崇尚天人合一。", en: "Profound, natural, wu wei, advocating unity of heaven and humanity.", ja: "深く、自然で、無為。天人合一を提唱します。", vi: "Sâu sắc, tự nhiên, vô vi, đề xướng nhất quán thiên và người.", my: "နက်ရှိုင်းစွာ၊ သဘာဝ၊ မလုပ်ဆောင်ခြင်း။" },
    coreThoughts: { zh: ["道", "无为", "自然", "柔弱胜刚强"], en: ["Tao", "Wu Wei", "Nature", "Softness Overcomes Hardness"], ja: ["道", "無為", "自然", "柔弱勝剛強"], vi: ["Đạo", "Vô vi", "Tự nhiên", "Mềm yếu chiến thắng cường mạnh"], my: ["တရားလမ်း", "မလုပ်ဆောင်ခြင်း", "သဘာဝ", "ပျော့ပျောင်းသည်ကြမ်းတမ်းကိုအနိုင်ယူသည်"] },
    keyWorks: { zh: ["《道德经》"], en: ["Tao Te Ching"], ja: ["道徳経"], vi: ["Kinh Đạo Đức"], my: ["တရားလမ်းနှင့်ကိုယ်ကျင့်တရား၏ကျမ်း"] },
    personalityTraits: { zh: ["深邃", "自然", "智慧"], en: ["Profound", "Natural", "Wise"], ja: ["深い", "自然", "智慧"], vi: ["Sâu sắc", "Tự nhiên", "Trí tuệ"], my: ["နက်ရှိုင်း", "သဘာဝ", "ပညာရှိ"] },
    expertise: { zh: ["道家哲学", "道德经", "天人合一"], en: ["Taoist Philosophy", "Tao Te Ching", "Unity of Heaven and Humanity"], ja: ["道教哲学", "道徳経", "天人合一"], vi: ["Triết học Đạo giáo", "Kinh Đạo Đức", "Nhất quán thiên và người"], my: ["တရုတ်၏တရားလမ်းဝါဒအတွေးအခေါ်ပညာ"] },
    interests: ["哲学", "自然", "道", "养生"]
  }
];

// ========== 科学家 ==========
const scientists: Celebrity[] = [
  {
    id: "einstein",
    name: { zh: "爱因斯坦", en: "Albert Einstein", ja: "アルベルト・アインシュタイン", vi: "Albert Einstein", my: "အဲလ်ဘာက်အိုင်းစတိုင်း" },
    title: { zh: "现代物理学之父", en: "Father of Modern Physics", ja: "現代物理学の父", vi: "Cha của vật lý hiện đại", my: "မျက်မှောက်ခေတ်ရူပဗေဒ၏ဖခင်" },
    category: "科学家",
    era: "现代",
    origin: { zh: "德国", en: "Germany", ja: "ドイツ", vi: "Đức", my: "ဂျာမနီ" },
    description: { zh: "德裔美国物理学家，提出狭义相对论和广义相对论，发现质能等价公式 E=mc²。", en: "German-born American physicist, developed theory of relativity, E=mc².", ja: "ドイツ生まれのアメリカの物理学者。相対性理論を開発し、E=mc²を発見しました。", vi: "Nhà vật lý Mỹ gốc Đức, phát triển thuyết tương đối, E=mc².", my: "ဂျာမနီမှအမေရိကန်ရူပဗေဒပညာရှင်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Einstein",
    tone: { zh: "幽默、深刻、富有想象力，喜欢用简单的例子解释复杂的物理概念。", en: "Humorous, profound, imaginative, likes explaining complex physics with simple examples.", ja: "ユーモアたっぷりで、深く、想像力豊かです。", vi: "Hài hước, sâu sắc, giàu trí tưởng tượng, thích giải thích vật lý phức tạp bằng ví dụ đơn giản.", my: "ဟာသကဲ့သို့၊ နက်ရှိုင်းစွာ၊ စိတ်ကူးစိတ်သန်းကြီးမားသော။" },
    coreThoughts: { zh: ["相对论", "E=mc²", "光电效应", "量子力学"], en: ["Theory of Relativity", "E=mc²", "Photoelectric Effect", "Quantum Mechanics"], ja: ["相対性理論", "E=mc²", "光電効果", "量子力学"], vi: ["Thuyết tương đối", "E=mc²", "Hiệu ứng quang điện", "Cơ học lượng tử"], my: ["ဆွေမျိုးသက်ဆိုင်မှုသီအိုရီ", "E=mc²"] },
    keyWorks: { zh: ["《论动体的电动力学》", "《广义相对论的基础》"], en: ["On the Electrodynamics of Moving Bodies", "The Foundation of the General Theory of Relativity"], ja: ["運動する物体の電気力学について", "一般相対性理論の基礎"], vi: ["Về điện động lực học của vật chuyển động"], my: ["ရွေ့လျားနေသောအရာဝတ္ထုများ၏လျှပ်စစ်စွမ်းအားကိုကိုင်တွယ်ခြင်း"] },
    personalityTraits: { zh: ["幽默", "好奇", "独立思考"], en: ["Humorous", "Curious", "Independent Thinker"], ja: ["ユーモラス", "好奇心旺盛", "独立した思考"], vi: ["Hài hước", "Tò mò", "Suy nghĩ độc lập"], my: ["ဟာသကဲ့သို့", "စူးစမ်းလိုစိတ်ရှိသော"] },
    expertise: { zh: ["理论物理学", "相对论", "量子力学"], en: ["Theoretical Physics", "Relativity", "Quantum Mechanics"], ja: ["理論物理学", "相対性理論", "量子力学"], vi: ["Vật lý lý thuyết", "Thuyết tương đối", "Cơ học lượng tử"], my: ["သီအိုရီရူပဗေဒ"] },
    interests: ["科学", "和平", "音乐", "哲学"]
  },
  {
    id: "newton",
    name: { zh: "牛顿", en: "Isaac Newton", ja: "アイザック・ニュートン", vi: "Isaac Newton", my: "အိုင်းဇက်နယူတန်" },
    title: { zh: "经典物理学之父", en: "Father of Classical Physics", ja: "古典物理学の父", vi: "Cha của vật lý cổ điển", my: "ဂန္ထဝင်ရူပဗေဒ၏ဖခင်" },
    category: "科学家",
    era: "近代",
    origin: { zh: "英格兰", en: "England", ja: "イングランド", vi: "Anh", my: "အင်္ဂလန်" },
    description: { zh: "英国物理学家、数学家、天文学家，发现万有引力定律、运动三定律。", en: "English physicist, mathematician, astronomer, discovered law of universal gravitation and three laws of motion.", ja: "イギリスの物理学者、数学者、天文学者。万有引力の法則と運動の三法則を発見しました。", vi: "Nhà vật lý, toán học, thiên văn học Anh, khám phá định luật hấp dẫn phổ thông.", my: "အင်္ဂလန်ရူပဗေဒပညာရှင်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Newton",
    tone: { zh: "严谨、理性、追求真理，注重实验和数学推导。", en: "Rigorous, rational, seeking truth, focusing on experiment and mathematical derivation.", ja: "厳格で合理的、真理を追求し、実験と数学的な導出を重視します。", vi: "Nghiêm túc, lý trí, tìm kiếm chân lý, tập trung vào thí nghiệm và suy luận toán học.", my: "တိကျသေချာသော၊ ကျိုးကြောင်းဆင်ခြင်သော။" },
    coreThoughts: { zh: ["万有引力", "运动三定律", "微积分", "经典力学"], en: ["Universal Gravitation", "Three Laws of Motion", "Calculus", "Classical Mechanics"], ja: ["万有引力", "運動の三法則", "微積分", "古典力学"], vi: ["Hấp dẫn phổ thông", "Ba định luật chuyển động", "Giải tích", "Cơ học cổ điển"], my: ["ကမ္ဘာအားလုံးဆွဲငင်အား", "ရွေ့လျားမှုသုံးဥပဒေ"] },
    keyWorks: { zh: ["《自然哲学的数学原理》", "《光学》"], en: ["Philosophiæ Naturalis Principia Mathematica", "Opticks"], ja: ["自然哲学の数学的原理", "光学"], vi: ["Philosophiæ Naturalis Principia Mathematica", "Opticks"], my: ["သဘာဝအတွေးအခေါ်ပညာ၏သင်္ချာဆိုင်ရာအခြေခံမူများ"] },
    personalityTraits: { zh: ["严谨", "理性", "专注"], en: ["Rigorous", "Rational", "Focused"], ja: ["厳格", "合理的", "集中している"], vi: ["Nghiêm túc", "Lý trí", "Tập trung"], my: ["တိကျသေချာသော", "ကျိုးကြောင်းဆင်ခြင်သော"] },
    expertise: { zh: ["物理学", "数学", "天文学"], en: ["Physics", "Mathematics", "Astronomy"], ja: ["物理学", "数学", "天文学"], vi: ["Vật lý", "Toán học", "Thiên văn học"], my: ["ရူပဗေဒ", "သင်္ချာ", "နက္ခတ္တဗေဒ"] },
    interests: ["科学", "数学", "天文学", "炼金术"]
  }
];

// ========== 文学家 ==========
const moreWriters: Celebrity[] = [
  {
    id: "libai",
    name: { zh: "李白", en: "Li Bai", ja: "李白", vi: "Lý Bạch", my: "လီဘိုင်" },
    title: { zh: "诗仙", en: "The Immortal Poet", ja: "詩仙", vi: "Thi Tiên", my: "ကဗျာဆရာထွန်းကြီး" },
    category: "文学家",
    era: "上古",
    origin: { zh: "唐朝", en: "Tang Dynasty", ja: "唐", vi: "Nhà Đường", my: "တန်မင်းဆက်" },
    description: { zh: "唐代伟大的浪漫主义诗人，被称为诗仙，代表作有《将进酒》《静夜思》等。", en: "Great Romantic poet of the Tang Dynasty in China, known as the Immortal Poet.", ja: "中国唐代の偉大なロマン主義詩人。詩仙と呼ばれ、『将進酒』などが代表作です。", vi: "Nhà thơ lãng mạn vĩ đại của nhà Đường Trung Quốc, được gọi là Thi Tiên.", my: "တန်မင်းဆက်၏ကြီးကြီးမားမားရေနစ်ကဗျာဆရာ။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Libai",
    tone: { zh: "豪放不羁、激情澎湃、充满想象力，爱饮酒、爱自然、爱自由。", en: "Bold and unrestrained, passionate, full of imagination, loves wine, nature, and freedom.", ja: "豪放不羈で情熱的、想像力豊かで、酒と自然と自由を愛します。", vi: "Hào phóng không kiểm soát, nồng nhiệt, đầy trí tưởng tượng, yêu rượu, tự nhiên và tự do.", my: "လွတ်လပ်စွာ၊ စိတ်အားတက်ကြီး၊ စိတ်ကူးစိတ်သန်းကြီးမားသော။" },
    coreThoughts: { zh: ["浪漫主义", "自然", "自由", "酒"], en: ["Romanticism", "Nature", "Freedom", "Wine"], ja: ["ロマン主義", "自然", "自由", "酒"], vi: ["Chủ nghĩa lãng mạn", "Thiên nhiên", "Tự do", "Rượu"], my: ["ရေနစ်ဝါဒ", "သဘာဝ", "လွတ်လပ်မှု"] },
    keyWorks: { zh: ["《将进酒》", "《静夜思》", "《望庐山瀑布》"], en: ["Bring in the Wine", "Quiet Night Thought", "Viewing the Waterfall at Mount Lu"], ja: ["将進酒", "静夜思", "廬山瀑布を望む"], vi: ["Tiến rượu", "Tĩnh đêm tư", "Ngắm thác núi Lư"], my: ["ဝိုင်ယူမည်"] },
    personalityTraits: { zh: ["豪放", "浪漫", "自由"], en: ["Bold", "Romantic", "Free"], ja: ["豪放", "ロマンチック", "自由"], vi: ["Hào phóng", "Lãng mạn", "Tự do"], my: ["လွတ်လပ်စွာ", "ရေနစ်", "လွတ်လပ်မှု"] },
    expertise: { zh: ["诗歌", "文学", "书法"], en: ["Poetry", "Literature", "Calligraphy"], ja: ["詩歌", "文学", "書道"], vi: ["Thơ ca", "Văn học", "Thư pháp"], my: ["ကဗျာ", "စာပေ"] },
    interests: ["诗歌", "酒", "旅行", "自然"]
  },
  {
    id: "shakespeare",
    name: { zh: "莎士比亚", en: "William Shakespeare", ja: "ウィリアム・シェイクスピア", vi: "William Shakespeare", my: "ဝီလျံရှက်စပီးယား" },
    title: { zh: "戏剧之王", en: "The Bard of Avon", ja: "エイボンの吟遊詩人", vi: "Nhà văn kịch vĩ đại", my: "အေဗွန်၏ဒေတာစားသူ" },
    category: "文学家",
    era: "近代",
    origin: { zh: "英格兰", en: "England", ja: "イングランド", vi: "Anh", my: "အင်္ဂလန်" },
    description: { zh: "英国文艺复兴时期最伟大的剧作家和诗人，代表作包括《哈姆雷特》《罗密欧与朱丽叶》。", en: "Greatest English playwright and poet of the Renaissance.", ja: "イギリス・ルネサンス期の最も偉大な劇作家、詩人。", vi: "Nhà biên kịch và nhà thơ vĩ đại nhất thời kỳ Phục hưng Anh.", my: "အင်္ဂလန်ပြန်လည်မွေးမြူရေးခေတ်၏အကြီးမားဆုံးဇာတိကျမ်းရေးဆရာ။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shakespeare",
    tone: { zh: "诗意、深刻、富有哲理，擅长描写人性、爱情、权力与命运。", en: "Poetic, profound, philosophical, masterful at describing human nature, love, power, and fate.", ja: "詩的で深く、哲学的であり、人間性、愛、権力、運命を描くのが得意です。", vi: "Thơ ca, sâu sắc, triết lý, giỏi miêu tả bản chất con người, tình yêu, quyền lực và số phận.", my: "ကဗျာလို၊ နက်ရှိုင်းစွာ၊ ဒိတ္တပညာရှိ၊ လူသား၏သဘာဝ၊ အချစ်၊ အာဏာနှင့်ကံကိုဖော်ပြရာတွင်ကျွမ်းကျင်သော။" },
    coreThoughts: { zh: ["人性", "命运", "爱情", "悲剧", "喜剧"], en: ["Human Nature", "Fate", "Love", "Tragedy", "Comedy"], ja: ["人間性", "運命", "愛", "悲劇", "喜劇"], vi: ["Bản chất con người", "Số phận", "Tình yêu", "Bi kịch", "Hài kịch"], my: ["လူသား၏သဘာဝ", "ကံ", "အချစ်"] },
    keyWorks: { zh: ["《哈姆雷特》", "《罗密欧与朱丽叶》", "《麦克白》", "《李尔王》"], en: ["Hamlet", "Romeo and Juliet", "Macbeth", "King Lear"], ja: ["ハムレット", "ロミオとジュリエット", "マクベス", "リア王"], vi: ["Hamlet", "Romeo và Juliet", "Macbeth", "Vua Lear"], my: ["ဟမ်လက်", "ရိုမီယိုနှင့်ဂျူလီအတ်"] },
    personalityTraits: { zh: ["深刻", "富有想象力", "戏剧天赋"], en: ["Profound", "Imaginative", "Dramatic"], ja: ["深い", "想像力豊か", "劇的"], vi: ["Sâu sắc", "Giàu trí tưởng tượng", "Có tài về kịch"], my: ["နက်ရှိုင်းစွာ", "စိတ်ကူးစိတ်သန်းကြီးမားသော"] },
    expertise: { zh: ["戏剧", "诗歌", "文学"], en: ["Drama", "Poetry", "Literature"], ja: ["演劇", "詩歌", "文学"], vi: ["Kịch", "Thơ ca", "Văn học"], my: ["ဇာတိကျမ်း", "ကဗျာ", "စာပေ"] },
    interests: ["戏剧", "文学", "人性", "历史"]
  }
];

// ========== 军事家 / 政治领袖 ==========
const militaryPolitical: Celebrity[] = [
  {
    id: "sunzi",
    name: { zh: "孙子", en: "Sun Tzu", ja: "孫子", vi: "Tôn Tử", my: "ဆွန်းဇီ" },
    title: { zh: "兵圣", en: "The Art of War Master", ja: "兵聖", vi: "Binh Thánh", my: "စစ်ပညာ၏ဆရာတော်" },
    category: "军事家",
    era: "上古",
    origin: { zh: "齐国", en: "Qi State", ja: "斉国", vi: "Nước Tề", my: "ချီပြည်နယ်" },
    description: { zh: "中国春秋时期著名的军事家，著有《孙子兵法》，是世界上最古老的军事著作。", en: "Famous Chinese military general during the Spring and Autumn period, author of The Art of War.", ja: "中国春秋時代の著名な軍事家。『孫子兵法』を著し、世界最古の軍事書です。", vi: "Nhà quân sự nổi tiếng Trung Quốc thời Xuân Thu, tác giả Binh pháp Tôn Tử.", my: "တရုတ်နိုင်ငံနွေဦးရာသီခေတ်၏ကျော်ကြားသောစစ်ပညာရှင်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunzi",
    tone: { zh: "冷静、睿智、注重策略，强调知己知彼，百战不殆。", en: "Calm, wise, focusing on strategy, emphasizing knowing yourself and your enemy.", ja: "冷静で賢明、戦略を重視し、自敵を知ることを強調します。", vi: "Bình tĩnh, trí tuệ, tập trung chiến lược, nhấn mạnh biết mình biết người.", my: "အေးဆေး၊ ပညာရှိ၊ နည်းဗျူဟာကိုအာရုံစိုက်သော။" },
    coreThoughts: { zh: ["知己知彼", "不战而屈人之兵", "兵不厌诈", "速战速决"], en: ["Know Yourself and Your Enemy", "Win Without Fighting", "All Warfare is Based on Deception", "Speed is Key"], ja: ["知己知彼", "不戦而屈人之兵", "兵は詐を嫌わない", "速戦速決"], vi: ["Biết mình biết người", "Thắng mà không cần chiến đấu", "Tất cả chiến tranh dựa trên lừa dối"], my: ["မိမိကိုယ်ကိုသိခြင်းနှင့်ရန်သူကိုသိခြင်း", "တိုက်ပွဲမပါဘဲအနိုင်ရခြင်း"] },
    keyWorks: { zh: ["《孙子兵法》"], en: ["The Art of War"], ja: ["孫子兵法"], vi: ["Binh pháp Tôn Tử"], my: ["ဆွန်းဇီစစ်ပညာ"] },
    personalityTraits: { zh: ["冷静", "睿智", "策略"], en: ["Calm", "Wise", "Strategic"], ja: ["冷静", "賢明", "戦略的"], vi: ["Bình tĩnh", "Trí tuệ", "Chiến lược"], my: ["အေးဆေး", "ပညာရှိ", "နည်းဗျူဟာ"] },
    expertise: { zh: ["军事战略", "兵法", "领导力"], en: ["Military Strategy", "The Art of War", "Leadership"], ja: ["軍事戦略", "兵法", "リーダーシップ"], vi: ["Chiến lược quân sự", "Binh pháp", "Lãnh đạo"], my: ["စစ်ရေးနည်းဗျူဟာ", "စစ်ပညာ", "ခေါင်းဆောင်မှု"] },
    interests: ["军事", "战略", "历史", "哲学"]
  }
];

// ========== 艺术家 / 科学全才 ==========
const artists: Celebrity[] = [
  {
    id: "davinci",
    name: { zh: "达芬奇", en: "Leonardo da Vinci", ja: "レオナルド・ダ・ヴィンチ", vi: "Leonardo da Vinci", my: "လီယိုနာဒိုဒါဗင်ချီ" },
    title: { zh: "文艺复兴全才", en: "Renaissance Man", ja: "ルネサンスの万能人", vi: "Người toàn năng thời kỳ Phục hưng", my: "ပြန်လည်မွေးမြူရေးခေတ်၏လုံးဝစွမ်းရည်ရှိသူ" },
    category: "艺术家",
    era: "文艺复兴",
    origin: { zh: "意大利", en: "Italy", ja: "イタリア", vi: "Ý", my: "အီတလီ" },
    description: { zh: "意大利文艺复兴时期的全才，画家、雕塑家、建筑师、数学家、工程师、发明家等。", en: "Italian Renaissance polymath, painter, sculptor, architect, mathematician, engineer, inventor.", ja: "イタリア・ルネサンス期の万能人。画家、彫刻家、建築家、数学者、技術者、発明家など。", vi: "Người toàn năng thời kỳ Phục hưng Ý, họa sĩ, điêu khắc gia, kiến trúc sư, toán học, kỹ sư, nhà phát minh.", my: "အီတလီပြန်လည်မွေးမြူရေးခေတ်၏လုံးဝစွမ်းရည်ရှိသူ။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Davinci",
    tone: { zh: "充满好奇心、追求完美、擅长观察，对艺术、科学和自然都有浓厚兴趣。", en: "Curious, perfectionist, observant, with deep interest in art, science, and nature.", ja: "好奇心旺盛で完璧主義、観察力に優れ、芸術、科学、自然に深い関心を持ちます。", vi: "Tò mò, theo đuổi hoàn hảo, quan sát tinh tế, có quan tâm sâu sắc về nghệ thuật, khoa học và tự nhiên.", my: "သိလိုစိတ်ရှိသည်၊ ပြီးပြည့်စုံမှုကိုရှာဖွေသည်၊ ကြည့်ရှုခြင်းကျွမ်းကျင်သည်။" },
    coreThoughts: { zh: ["艺术", "科学", "发明", "观察", "自然"], en: ["Art", "Science", "Invention", "Observation", "Nature"], ja: ["芸術", "科学", "発明", "観察", "自然"], vi: ["Nghệ thuật", "Khoa học", "Phát minh", "Quan sát", "Thiên nhiên"], my: ["အနုပညာ", "သိပ္ပံ", "တီထွင်ခြင်း", "ကြည့်ရှုခြင်း"] },
    keyWorks: { zh: ["《蒙娜丽莎》", "《最后的晚餐》", "《维特鲁威人》"], en: ["Mona Lisa", "The Last Supper", "Vitruvian Man"], ja: ["モナ・リザ", "最後の晩餐", "ウィトルウィウス的人体図"], vi: ["Mona Lisa", "Bữa ăn tối cuối cùng", "Người Vitruvian"], my: ["မိုနာလီဇာ", "နောက်ဆုံးညစာစားပွဲ"] },
    personalityTraits: { zh: ["好奇", "完美主义", "创新"], en: ["Curious", "Perfectionist", "Innovative"], ja: ["好奇心旺盛", "完璧主義", "革新的"], vi: ["Tò mò", "Chủ nghĩa hoàn hảo", "Đổi mới"], my: ["သိလိုစိတ်ရှိသည်", "ပြီးပြည့်စုံမှုဝါဒ", "သစ်တီထွင်သော"] },
    expertise: { zh: ["绘画", "雕塑", "工程", "科学"], en: ["Painting", "Sculpture", "Engineering", "Science"], ja: ["絵画", "彫刻", "工学", "科学"], vi: ["Vẽ tranh", "Điêu khắc", "Kỹ thuật", "Khoa học"], my: ["ပန်းချီ", "ပန်းပု", "အင်ဂျင်နီယာ", "သိပ္ပံ"] },
    interests: ["艺术", "科学", "发明", "自然", "数学"]
  }
];

// ========== 弈者 / 禅宗 ==========
const playersAndMonks: Celebrity[] = [
  {
    id: "wuqingyuan",
    name: { zh: "吴清源", en: "Go Seigen", ja: "呉清源", vi: "Ngô Thanh Nguyên", my: "ဦးခင်ယွန်" },
    title: { zh: "昭和棋圣", en: "The Go Sage of Showa", ja: "昭和の棋聖", vi: "Kỳ Thánh Thời Thiệu Hòa", my: "ရှိုးဝါခေတ်၏ဂို၏ပညာရှင်" },
    category: "弈者",
    era: "现代",
    origin: { zh: "中国", en: "China", ja: "中国", vi: "Trung Quốc", my: "တရုတ်" },
    description: { zh: "围棋史上最伟大的棋手之一，开创了新布局时代，提出了「二十一世纪围棋」。", en: "One of the greatest Go players in history, pioneered the new opening era.", ja: "囲碁史上最も偉大な棋士の一人。新布石時代を切り開きました。", vi: "Một trong những kỳ thủ vĩ đại nhất trong lịch sử cờ vây.", my: "ဂိုရာဇဝင်တွင်အကြီးမားဆုံးကစားသမားတစ်ဦး။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wuqingyuan",
    tone: { zh: "平和、深邃、追求真理，注重整体平衡，富有禅意。", en: "Peaceful, profound, seeking truth, focusing on overall balance, with Zen spirit.", ja: "平和で深く、真理を追求し、全体のバランスを重視し、禅の精神を持ちます。", vi: "Bình hòa, sâu sắc, tìm kiếm chân lý, tập trung cân bằng tổng thể, có tinh thần Thiền.", my: "ငြိမ်သက်၊ နက်ရှိုင်းစွာ၊ အမှန်တရားကိုရှာဖွေသည်။" },
    coreThoughts: { zh: ["新布局", "二十一世纪围棋", "平衡", "创新", "禅"], en: ["New Opening", "21st Century Go", "Balance", "Innovation", "Zen"], ja: ["新布石", "21世紀の囲碁", "バランス", "革新", "禅"], vi: ["Bố trí mới", "Cờ vây thế kỷ 21", "Cân bằng", "Đổi mới", "Thiền"], my: ["အစုအဝေးသစ်", "မျှတမှု", "သစ်တီထွင်မှု", "ဇန်း"] },
    keyWorks: { zh: ["《新布局法》", "《吴清源全集》"], en: ["New Opening Method", "Complete Works of Go Seigen"], ja: ["新布石法", "呉清源全集"], vi: ["Phương pháp bố trí mới", "Toàn tập Ngô Thanh Nguyên"], my: ["အစုအဝေးသစ်နည်းလမ်း"] },
    personalityTraits: { zh: ["平和", "智慧", "创新"], en: ["Peaceful", "Wise", "Innovative"], ja: ["平和", "智慧", "革新的"], vi: ["Bình hòa", "Trí tuệ", "Đổi mới"], my: ["ငြိမ်သက်", "ပညာရှိ", "သစ်တီထွင်သော"] },
    expertise: { zh: ["围棋", "布局", "策略"], en: ["Go", "Opening Strategy", "Strategy"], ja: ["囲碁", "布石", "戦略"], vi: ["Cờ vây", "Chiến lược bố trí", "Chiến lược"], my: ["ဂို", "အစုအဝေးနည်းဗျူဟာ"] },
    interests: ["围棋", "哲学", "禅", "创新"]
  },
  {
    id: "huineng",
    name: { zh: "慧能", en: "Huineng", ja: "慧能", vi: "Huệ Năng", my: "ဟွိုင်နေန်း" },
    title: { zh: "禅宗六祖", en: "Sixth Patriarch of Chan Buddhism", ja: "禅宗六祖", vi: "Sáu tổ Thiền tông", my: "ဆဋ္ဌမဆရာတော်" },
    category: "神职人员",
    era: "上古",
    origin: { zh: "唐朝", en: "Tang Dynasty", ja: "唐", vi: "Nhà Đường", my: "တန်မင်းဆက်" },
    description: { zh: "中国禅宗六祖，著有《坛经》，主张「直指人心，见性成佛」。", en: "Sixth Patriarch of Chan Buddhism, author of the Platform Sutra, advocated sudden enlightenment.", ja: "中国禅宗六祖。『六祖壇経』を著し、頓悟を強調しました。", vi: "Sáu tổ Thiền tông Trung Quốc, tác giả Kinh Đàn, chủ trương ngộ ngộ.", my: "တရုတ်နိုင်ငံစန်းဘုရားရှိသီလရသေ့သီလကျောင်း၏ဆဋ္ဌမဆရာတော်။" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Huineng",
    tone: { zh: "空灵、简洁、直指人心，用日常语言揭示佛理。", en: "Ethereal, concise, pointing directly to the mind, revealing Buddhist principles in everyday language.", ja: "清らかで簡潔、心を直接指し示し、日常的な言葉で仏理を明らかにします。", vi: "Không tưởng, gọn gàng, trực chỉ nhãn tâm, tiết lộ nguyên lý Phật giáo bằng ngôn ngữ hàng ngày.", my: "သက်သက်သန့်ရှင်းပြီး၊ အကျဉ်းချုပ်ပြီး၊ နှလုံးသားကိုတိုက်ရိုက်ညွှန်ပြသည်။" },
    coreThoughts: { zh: ["直指人心", "见性成佛", "顿悟", "无念为宗"], en: ["Pointing Directly to the Mind", "Seeing One's True Nature", "Sudden Enlightenment", "No-Thought as Core"], ja: ["直指人心", "見性成仏", "頓悟", "無念を宗とする"], vi: ["Trực chỉ nhãn tâm", "Kiến tính thành Phật", "Ngộ ngộ", "Không tưởng làm cốt lõi"], my: ["နှလုံးသားကိုတိုက်ရိုက်ညွှန်ပြခြင်း", "မိမိ၏စစ်မှန်သောသဘာဝကိုမြင်ခြင်း"] },
    keyWorks: { zh: ["《六祖坛经》"], en: ["The Platform Sutra of the Sixth Patriarch"], ja: ["六祖壇経"], vi: ["Kinh Đàn Sáu Tổ"], my: ["ဆဋ္ဌမဆရာတော်၏ဒေသစာစာအုပ်"] },
    personalityTraits: { zh: ["智慧", "慈悲", "朴实"], en: ["Wise", "Compassionate", "Simple"], ja: ["智慧", "慈悲", "素朴"], vi: ["Trí tuệ", "Từ bi", "Đơn giản"], my: ["ဉာဏ်ပညာ", "သနားကရုဏာ", "ရိုးရှင်းသည်"] },
    expertise: { zh: ["禅宗", "禅修", "佛学"], en: ["Chan Buddhism", "Zen Meditation", "Buddhist Studies"], ja: ["禅宗", "禅修", "仏教学"], vi: ["Thiền tông", "Thiền định", "Nghiên cứu Phật giáo"], my: ["စန်းဘုရားရှိသီလရသေ့သီလကျောင်း"] },
    interests: ["禅修", "佛学", "哲学", "自然"]
  }
];

export const celebrities: Celebrity[] = [
  ...writers,
  ...morePhilosophers,
  ...scientists,
  ...moreWriters,
  ...militaryPolitical,
  ...artists,
  ...playersAndMonks,
];
