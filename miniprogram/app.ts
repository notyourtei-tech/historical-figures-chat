// 万古灵犀 · 微信小程序
// 与历史古人对话的AI聊天应用

interface IAppOption {
  globalData: {
    userProfile: UserProfile | null;
    language: Language;
    currentChatId: string | null;
  };
}

type Language = 'zh' | 'en' | 'ja' | 'vi' | 'my';

interface UserProfile {
  name: string;
  interests: string[];
  language: Language;
  mbti?: string;
}

App<IAppOption>({
  globalData: {
    userProfile: null,
    language: 'zh',
    currentChatId: null,
  },

  onLaunch() {
    // 读取本地存储的用户设置
    try {
      const profile = wx.getStorageSync('user_profile');
      if (profile) {
        this.globalData.userProfile = profile;
        this.globalData.language = profile.language || 'zh';
      }
      const lang = wx.getStorageSync('language');
      if (lang) {
        this.globalData.language = lang;
      }
    } catch (e) {
      console.error('读取用户设置失败', e);
    }
  },

  getUserProfile(): UserProfile | null {
    return this.globalData.userProfile;
  },

  setUserProfile(profile: UserProfile) {
    this.globalData.userProfile = profile;
    this.globalData.language = profile.language;
    wx.setStorageSync('user_profile', profile);
  },

  getLanguage(): Language {
    return this.globalData.language;
  },

  setLanguage(lang: Language) {
    this.globalData.language = lang;
    wx.setStorageSync('language', lang);
  },
});
