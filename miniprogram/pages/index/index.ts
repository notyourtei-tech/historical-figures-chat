import { celebrities } from '../../utils/celebrities';
import { t, LANGUAGE_LABELS, translateCategory, countInterestMatches } from '../../utils/i18n';
import { getChatHistoryList } from '../../utils/ai-service';
import { Language, Celebrity } from '../../utils/types';

function getCategoryOptions(language: Language) {
  return CATEGORIES.map((id) => ({
    id,
    label: translateCategory(id, language),
  }));
}

const CATEGORIES = ['哲学家', '科学家', '文学家', '政治家', '军事家', '艺术家', '弈者', '智者', '政治军事领袖'];

Page({
  data: {
    language: 'zh' as Language,
    langLabel: '中文',
    showLangMenu: false,
    searchTerm: '',
    selectedCategory: 'all',
    filteredCelebrities: [] as Celebrity[],
    categories: getCategoryOptions('zh'),
    userName: '友君',
    chatHistoryList: [] as any[],
  },

  onLoad() {
    const app = getApp();
    const profile = app.globalData.userProfile;
    const language = app.globalData.language || 'zh';
    
    this.setData({
      language,
      langLabel: LANGUAGE_LABELS[language],
      categories: getCategoryOptions(language),
      userName: profile?.name || '友君',
    });

    this.filterCelebrities();
  },

  onShow() {
    const app = getApp();
    const profile = app.globalData.userProfile;
    const language = app.globalData.language || 'zh';
    
    this.setData({
      language,
      langLabel: LANGUAGE_LABELS[language],
      categories: getCategoryOptions(language),
      userName: profile?.name || '友君',
    });

    this.filterCelebrities();
    this.loadHistory();
  },

  t(key: string, vars?: Record<string, string | number>): string {
    return t(this.data.language, key, vars);
  },

  toggleLang() {
    this.setData({ showLangMenu: !this.data.showLangMenu });
  },

  switchLanguage(e: any) {
    const lang = e.currentTarget.dataset.lang as Language;
    const app = getApp();
    app.setLanguage(lang);
    this.setData({
      language: lang,
      langLabel: LANGUAGE_LABELS[lang],
      categories: getCategoryOptions(lang),
      showLangMenu: false,
    });
    this.filterCelebrities();
  },

  onSearch(e: any) {
    this.setData({ searchTerm: e.detail.value });
    this.filterCelebrities();
  },

  selectCategory(e: any) {
    this.setData({ selectedCategory: e.currentTarget.dataset.cat });
    this.filterCelebrities();
  },

  filterCelebrities() {
    const { searchTerm, selectedCategory, language } = this.data;
    const app = getApp();
    const profile = app.globalData.userProfile;

    let filtered = celebrities;

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        const name = c.name[language] || c.name.zh || '';
        const title = c.title[language] || c.title.zh || '';
        return name.toLowerCase().includes(term) ||
               title.toLowerCase().includes(term);
      });
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // 排序：兴趣匹配优先
    if (profile?.interests?.length) {
      filtered = [...filtered].sort((a, b) => {
        const aMatch = countInterestMatches(profile.interests, a.interests);
        const bMatch = countInterestMatches(profile.interests, b.interests);
        return bMatch - aMatch;
      });
    }

    this.setData({ filteredCelebrities: filtered });
  },

  loadHistory() {
    const historyList = getChatHistoryList();
    const list = historyList.map((h: any) => {
      const celeb = celebrities.find(c => c.id === h.id);
      return {
        ...h,
        name: celeb?.name[this.data.language] || h.id,
      };
    });
    this.setData({ chatHistoryList: list });
  },

  goToChat(e: any) {
    const id = e.detail?.id || e.currentTarget?.dataset?.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/chat/chat?id=${id}` });
  },
});
