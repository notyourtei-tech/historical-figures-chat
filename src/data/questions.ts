import { Question } from '../types';

export const mbtiQuestions: Question[] = [
  // E vs I
  {
    id: 1,
    text: "在社交场合中，你通常：",
    options: [
      { label: "感到充满活力，喜欢与多人交谈", value: "E" },
      { label: "感到精疲力竭，倾向于与少数熟人交谈", value: "I" }
    ]
  },
  {
    id: 2,
    text: "你更倾向于：",
    options: [
      { label: "先行动再思考", value: "E" },
      { label: "先思考再行动", value: "I" }
    ]
  },
  {
    id: 3,
    text: "你的闲暇时间通常：",
    options: [
      { label: "喜欢出去见朋友", value: "E" },
      { label: "喜欢独自待着看书或思考", value: "I" }
    ]
  },
  // S vs N
  {
    id: 4,
    text: "你更关注：",
    options: [
      { label: "事实、细节和当下的现实", value: "S" },
      { label: "可能性、灵感和未来的愿景", value: "N" }
    ]
  },
  {
    id: 5,
    text: "学习新事物时，你更喜欢：",
    options: [
      { label: "循序渐进，关注实际应用", value: "S" },
      { label: "跳跃式思考，关注背后的理论和联系", value: "N" }
    ]
  },
  {
    id: 6,
    text: "你被认为是一个：",
    options: [
      { label: "务实、脚踏实地的人", value: "S" },
      { label: "富有想象力、理想主义的人", value: "N" }
    ]
  },
  // T vs F
  {
    id: 7,
    text: "做决定时，你更多地依赖：",
    options: [
      { label: "逻辑分析和客观标准", value: "T" },
      { label: "个人价值观和对他人的影响", value: "F" }
    ]
  },
  {
    id: 8,
    text: "你更看重：",
    options: [
      { label: "正义和公平", value: "T" },
      { label: "和谐与体谅", value: "F" }
    ]
  },
  {
    id: 9,
    text: "在争论中，你通常：",
    options: [
      { label: "据理力争，关注谁是对的", value: "T" },
      { label: "寻求折中，关注大家的感受", value: "F" }
    ]
  },
  // J vs P
  {
    id: 10,
    text: "你的工作方式通常是：",
    options: [
      { label: "有计划、有组织，喜欢提前完成", value: "J" },
      { label: "随性、灵活，喜欢在压力下冲刺", value: "P" }
    ]
  },
  {
    id: 11,
    text: "你更喜欢：",
    options: [
      { label: "事情已经确定并尘埃落定", value: "J" },
      { label: "保持选择的开放性", value: "P" }
    ]
  },
  {
    id: 12,
    text: "你的生活空间通常：",
    options: [
      { label: "井井有条，东西各归其位", value: "J" },
      { label: "虽然有些凌乱，但你知道东西在哪", value: "P" }
    ]
  }
];
