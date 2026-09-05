import { Celebrity, Message, Language } from '../../utils/types';
import { t } from '../../utils/i18n';
import {
  findCelebrityById,
  chatWithCelebrity,
  getInitialGreeting,
  generateId,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
} from '../../utils/ai-service';

Page({
  data: {
    celebrityId: '',
    celebrity: null as any,
    language: 'zh' as Language,
    messages: [] as Message[],
    inputValue: '',
    isLoading: false,
    canSend: false,
    scrollIntoView: '',
    showScrollBtn: false,
    showMenu: false,
    isNearBottom: true,
  },

  onLoad(options: any) {
    const id = options.id || '';
    const app = getApp();
    const language = app.globalData.language || 'zh';

    const celebrity = findCelebrityById(id);
    if (!celebrity) {
      wx.showToast({ title: '人物不存在', icon: 'error' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({ celebrityId: id, celebrity, language });
    wx.setNavigationBarTitle({ title: celebrity.name[language] || celebrity.name.zh });

    app.globalData.currentChatId = id;
    this.initChat();
  },

  onUnload() {
    const app = getApp();
    app.globalData.currentChatId = null;
  },

  async initChat() {
    const { celebrityId, celebrity, language } = this.data;
    
    // 尝试加载历史
    const saved = loadChatHistory(celebrityId);
    if (saved.length > 0) {
      this.setData({ messages: saved });
      this.scrollToBottom();
      return;
    }

    // 加载开场白
    this.setData({ isLoading: true });
    try {
      const greeting = await getInitialGreeting(celebrity, language);
      const msg: Message = {
        id: generateId(),
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
      };
      this.setData({ messages: [msg] });
      saveChatHistory(celebrityId, [msg]);
    } catch (e) {
      console.error('获取开场白失败', e);
    } finally {
      this.setData({ isLoading: false });
      this.scrollToBottom();
    }
  },

  t(key: string, vars?: Record<string, string | number>): string {
    return t(this.data.language, key, vars);
  },

  onInput(e: any) {
    const value = e.detail.value;
    this.setData({
      inputValue: value,
      canSend: value.trim().length > 0,
    });
  },

  async onSend() {
    const { inputValue, isLoading, celebrity, language, messages } = this.data;
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    this.setData({
      messages: newMessages,
      inputValue: '',
      canSend: false,
      isLoading: true,
    });
    this.scrollToBottom();

    try {
      const response = await chatWithCelebrity(celebrity, newMessages, language);
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response || t(language, 'error_ai_failed'),
        timestamp: Date.now(),
      };
      const finalMessages = [...newMessages, assistantMessage];
      this.setData({ messages: finalMessages });
      saveChatHistory(this.data.celebrityId, finalMessages);
    } catch (e: any) {
      console.error('发送失败', e);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: e.message || '抱歉，先贤暂时无法回应。',
        timestamp: Date.now(),
        isError: true,
      };
      const finalMessages = [...newMessages, errorMessage];
      this.setData({ messages: finalMessages });
      saveChatHistory(this.data.celebrityId, finalMessages);
    } finally {
      this.setData({ isLoading: false });
      this.scrollToBottom();
    }
  },

  async onRetry(e: any) {
    const messageId = e.detail.messageId;
    const { messages, celebrity, language, isLoading } = this.data;
    if (isLoading) return;

    // 找到最后一个用户消息
    const errorIdx = messages.findIndex(m => m.id === messageId);
    if (errorIdx === -1) return;

    const conversation = messages.slice(0, errorIdx);
    this.setData({ messages: conversation, isLoading: true });

    try {
      const response = await chatWithCelebrity(celebrity, conversation, language);
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response || '',
        timestamp: Date.now(),
      };
      const finalMessages = [...conversation, assistantMessage];
      this.setData({ messages: finalMessages });
      saveChatHistory(this.data.celebrityId, finalMessages);
    } catch (e: any) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '重试失败，请稍后再试。',
        timestamp: Date.now(),
        isError: true,
      };
      const finalMessages = [...conversation, errorMessage];
      this.setData({ messages: finalMessages });
    } finally {
      this.setData({ isLoading: false });
      this.scrollToBottom();
    }
  },

  toggleMenu() {
    this.setData({ showMenu: !this.data.showMenu });
  },

  clearChat() {
    wx.showModal({
      title: '确认',
      content: t(this.data.language, 'confirm_clear'),
      success: (res) => {
        if (res.confirm) {
          clearChatHistory(this.data.celebrityId);
          this.setData({ messages: [], showMenu: false });
          this.initChat();
        }
      },
    });
  },

  onScroll() {
    // 小程序 scroll-view 不支持直接获取 scrollTop
    // 这里简化处理，在用户向上滚动时显示滚动按钮
    this.setData({ showScrollBtn: true });
  },

  scrollToBottom() {
    const { messages } = this.data;
    if (messages.length > 0) {
      this.setData({
        scrollIntoView: `msg-${messages[messages.length - 1].id}`,
        showScrollBtn: false,
      });
    }
  },
});
