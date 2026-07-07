import { t, LANGUAGE_LABELS, translateInterest } from '../../utils/i18n';
import { Language } from '../../utils/types';

const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'my', label: 'မြန်မာ' },
];

const INTEREST_IDS = ['philosophy', 'science', 'art', 'history', 'go', 'literature', 'peace'];

Page({
  data: {
    step: 1,
    language: 'zh' as Language,
    languages: LANGUAGES,
    selectedInterests: [] as string[],
    interestOptions: [] as Array<{ id: string; label: string }>,
    userName: '',
    wxsSelected: {} as Record<string, boolean>,
  },

  onLoad() {
    const app = getApp();
    const language = app.globalData.language || 'zh';
    this.setData({ language });
    this.updateInterestLabels();
  },

  updateInterestLabels() {
    const options = INTEREST_IDS.map(id => ({
      id,
      label: translateInterest(id, this.data.language),
    }));
    this.setData({ interestOptions: options });
  },

  t(key: string): string {
    return t(this.data.language, key);
  },

  selectLang(e: any) {
    const lang = e.currentTarget.dataset.lang as Language;
    this.setData({ language: lang });
    this.updateInterestLabels();
  },

  toggleInterest(e: any) {
    const id = e.currentTarget.dataset.id;
    const selected = [...this.data.selectedInterests];
    const idx = selected.indexOf(id);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(id);
    }
    const wxsSelected: Record<string, boolean> = {};
    selected.forEach(s => { wxsSelected[s] = true; });
    this.setData({ selectedInterests: selected, wxsSelected });
  },

  onNameInput(e: any) {
    this.setData({ userName: e.detail.value });
  },

  nextStep() {
    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 });
    }
  },

  prevStep() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 });
    }
  },

  skipAll() {
    this.saveAndGo();
  },

  finish() {
    this.saveAndGo();
  },

  saveAndGo() {
    const app = getApp();
    const { language, selectedInterests, userName } = this.data;

    const profile = {
      name: userName.trim() || t(language, 'default_name'),
      interests: selectedInterests,
      language,
    };

    app.setUserProfile(profile);
    wx.setStorageSync('user_profile', profile);
    wx.setStorageSync('onboarding_done', true);

    wx.reLaunch({ url: '/pages/index/index' });
  },
});
